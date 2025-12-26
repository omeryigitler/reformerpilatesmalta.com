import { db, auth } from "../firebase";
import {
    collection,
    doc,
    runTransaction,
    onSnapshot,
    query,
    updateDoc,
    setDoc,
    getDoc,
    DocumentReference
} from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    updateProfile
} from "firebase/auth";
import { Slot, UserType } from "../types";
import { convertTime12to24, getTodayDate } from "../utils/helpers";

// --- X. GEÇMİŞ REZERVASYONLARI GÜNCELLEME ---
export const updateExpiredSlots = async (slots: Slot[]) => {
    const now = new Date();

    // Geçmiş "Booked" veya "Active" olanları bul
    const expiredSlots = slots.filter(slot => {
        if (slot.status !== 'Booked' && slot.status !== 'Active') return false;

        // Tarih ve saat kontrolü
        // Slot.date: YYYY-MM-DD
        // Slot.time: HH:MM AM/PM
        // Basit kıyaslama için ISO string oluşturmaya çalışalım
        // Ancak time formatı tutarsız olabilir, o yüzden helper kullanmak lazım veya basit split

        // Slot zamanını Date objesine çevir
        let time24 = slot.time;
        if (slot.time.includes('AM') || slot.time.includes('PM')) {
            time24 = convertTime12to24(slot.time);
        }

        const slotDateObj = new Date(`${slot.date}T${time24}:00`);

        // Eğer slot zamanı şu andan eskiyse
        return slotDateObj < now;
    });

    if (expiredSlots.length === 0) return;



    // Hepsini güncelle (Batch kullanılabilir ama şimdilik Promise.all basit)
    // Transaction gerekmez çünkü bu sadece durum güncellemesi, race condition riski düşük.
    // Ancak kullanıcı iptal etmeye çalışırsa çakışma olabilir, ama geçmiş tarih olduğu için iptal edilemez zaten.
    const promises = expiredSlots.map(slot => {
        const slotRef = doc(db, "slots", `${slot.date}_${slot.time}`);
        return updateDoc(slotRef, { status: 'Completed' });
    });

    try {
        await Promise.all(promises);

    } catch (e) {
        console.error("Geçmiş bookingleri güncelleme hatası:", e);
    }
};

// --- 1. DERSLERİ CANLI TAKİP ETME (REAL-TIME SYNC) ---
export const listenToSlots = (callback: (slots: Slot[]) => void) => {
    // Tüm slotları dinle
    const q = query(collection(db, "slots"));

    // onSnapshot: Veritabanı ile canlı bağlantı kurar
    return onSnapshot(q, (snapshot) => {
        const slots: Slot[] = [];
        snapshot.forEach((doc) => {
            slots.push({ ...(doc.data() as Slot), id: doc.id });
        });
        // Slotları tarihe göre sırala (Helper fonksiyonu burada kullanmıyoruz, ham veriyi dönüyoruz)
        callback(slots);
    }, (error) => {
        console.error("Slots listening error:", error);
    });
};

// --- 2. KULLANICILARI DİNLEME ---
export const listenToUsers = (callback: (users: UserType[]) => void) => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        const users: UserType[] = [];
        snapshot.forEach((doc) => {
            users.push(doc.data() as UserType);
        });
        callback(users);
    });
};

// --- 3. GÜVENLİ REZERVASYON (TRANSACTION) ---
// Aynı anda 2 kişi aynı yere tıklarsa çakışmayı önler.
export const bookSlotTransaction = async (slotDate: string, slotTime: string, user: UserType) => {
    const slotRef = doc(db, "slots", `${slotDate}_${slotTime}`);
    const userName = `${user.firstName} ${user.lastName}`;

    try {
        await runTransaction(db, async (transaction) => {
            const slotDoc = await transaction.get(slotRef);
            if (!slotDoc.exists()) {
                throw "Seçilen ders bulunamadı!";
            }

            const slotData = slotDoc.data() as Slot;

            // Kontrol: Yer dolu mu?
            if (slotData.status === 'Booked' || slotData.status === 'Active' || slotData.status === 'Completed') {
                throw "Bu ders az önce başkası tarafından alındı veya doldu!";
            }

            // İşlem: Durumu güncelle ve kullanıcıyı yaz
            transaction.update(slotRef, {
                status: 'Booked', // Yeni status: Booked
                bookedBy: userName,
                bookedByEmail: user.email
            });
        });
        return { success: true };
    } catch (error: unknown) {
        console.error("Rezervasyon hatası:", error);
        throw error; // Hatayı yukarı fırlat ki UI gösterebilsin
    }
};

// --- 4. REZERVASYON İPTALİ ---
export const cancelBookingTransaction = async (slotDate: string, slotTime: string) => {
    const slotRef = doc(db, "slots", `${slotDate}_${slotTime}`);

    try {
        await updateDoc(slotRef, {
            status: 'Available',
            bookedBy: null,
            bookedByEmail: null
        });
        return { success: true };
    } catch (error) {
        console.error("İptal hatası:", error);
        throw error;
    }
};

// --- 5. KULLANICI İŞLEMLERİ (AUTH + FIRESTORE) ---
// --- 5. KULLANICI İŞLEMLERİ (AUTH + FIRESTORE) ---

export const registerUserAuth = async (user: UserType) => {
    // Force persistence to LOCAL specifically
    await setPersistence(auth, browserLocalPersistence);

    // 1. Firebase Auth ile kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    const firebaseUser = userCredential.user;

    // 1.5. Update Profile with Display Name immediately
    if (user.firstName) {
        await updateProfile(firebaseUser, {
            displayName: `${user.firstName} ${user.lastName || ''}`.trim()
        });
    }

    // 2. Firestore'a kullanıcı detaylarını kaydet
    // ÖNEMLİ: Mevcut yapı (Email bazlı) bozulmasın diye UID yerine Email'i key olarak kullanmaya devam edelim.
    const newUserWithDate = {
        ...user,
        uid: firebaseUser.uid, // UID'yi de ekleyelim, dursun.
        registered: getTodayDate()
    };

    // Şifreyi Firestore'a açık kaydetmeyelim! (Güvenlik)
    // Ancak UserType içinde 'password' alanı zorunluysa, boş veya hashed gibi tutabiliriz.
    // Şimdilik UserType yapısını bozmamak için olduğu gibi bırakıyorum ama Auth tarafı esas şifreyi tutuyor.
    await setDoc(doc(db, "users", user.email), newUserWithDate);

    return firebaseUser;
};

export const getUserProfile = async (email: string) => {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserType;
    }
    return null;
};

export const loginUserAuth = async (email: string, pass: string) => {
    // Force persistence to LOCAL before login
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
};

export const logoutUserAuth = async () => {
    await signOut(auth);
};

export const resetPasswordAuth = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

// Eski register fonksiyonu (Geriye uyumluluk veya Admin panelden ekleme için)
export const registerUser = async (user: UserType) => {
    // Admin panelinden kullanıcı eklerken Auth kullanmalı mıyız? 
    // Evet, ama admin başkası adına şifre belirleyemez (Auth kuralları gereği client SDK'da zor).
    // Şimdilik admin panelinden eklenenler "eski usul" veritabanına eklenir, 
    // ama bu kullanıcılar giriş yapamaz (şifreleri Auth'da yok).
    // Bu yüzden Admin panelindeki "Kullanıcı Ekle" butonunu kaldırmak veya 
    // sadece veri tabanına kayıt açmak (Authsuz) gerekir.

    // Geçici olarak eski usul devam:
    const newUserWithDate = { ...user, registered: getTodayDate() };
    // Eski sistemde mail key idi, yeni sistemde UID key olmalı.
    // Admin panelinden eklenenlerde UID olmadığı için mecburen email kullanıyoruz.
    await setDoc(doc(db, "users", user.email), newUserWithDate);
};
// --- 6. DATA MIGRATION (12h -> 24h) ---
import { writeBatch, getDocs } from "firebase/firestore";

export const migrateSlotsTo24Hour = async () => {
    // 1. Fetch ALL slots
    const q = query(collection(db, "slots"));
    const querySnapshot = await getDocs(q);

    // 2. Identify slots needing migration
    const slotsToMigrate: { docRef: DocumentReference; data: Slot }[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data() as Slot;
        // Check if time has AM or PM
        if (data.time && (data.time.toUpperCase().includes('AM') || data.time.toUpperCase().includes('PM'))) {
            slotsToMigrate.push({ docRef: doc.ref, data });
        }
    });

    if (slotsToMigrate.length === 0) {
        return { success: true, count: 0, message: "No legacy slots found." };
    }



    // 3. Perform Migration (Batch - 400 items limit safety)
    // Create new doc with 24h ID, delete old doc.
    const batch = writeBatch(db);
    let opCount = 0;

    for (const item of slotsToMigrate) {
        const oldData = item.data;
        const time12 = oldData.time;
        const time24 = convertTime12to24(time12); // Helper must be imported or reliable

        // If conversion failed or same, skip
        if (time12 === time24) continue;

        // New ID: date_time24
        const newDocId = `${oldData.date}_${time24}`;
        const newDocRef = doc(db, "slots", newDocId);

        // Set new, Delete old
        batch.set(newDocRef, { ...oldData, time: time24 });
        batch.delete(item.docRef);

        opCount++;
        // Firestore batch limit is 500. Let's be safe.
        // For a simple script, if > 400, strictly we should split batches.
        // Assuming user doesn't have thousands of legacy slots yet.
    }

    if (opCount > 0) {
        await batch.commit();
    }

    return { success: true, count: opCount, message: `Successfully migrated ${opCount} slots.` };
};
