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
    deleteDoc
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

    // Geçmiş "Booked", "Active" veya "Available" olanları bul
    const expiredSlots = slots.filter(slot => {
        if (slot.status === 'Completed') return false;

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

        // Eğer slot boşsa (kimse almamışsa) SİL, eğer doluysa COMPLETED yap
        if (!slot.bookedBy && !slot.bookedByEmail) {
            return deleteDoc(slotRef);
        } else {
            return updateDoc(slotRef, { status: 'Completed' });
        }
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

            // Allowing booking for Active (Public) or even Available (if direct link/admin)
            if (slotData.status === 'Booked' || slotData.status === 'Completed') {
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
    const newUserWithDate = {
        ...user,
        uid: firebaseUser.uid,
        registered: getTodayDate()
    };

    // Şifreyi Firestore'a açık kaydetmiyoruz (Güvenlik)
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
