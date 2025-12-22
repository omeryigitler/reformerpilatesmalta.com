
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBG2Br1O8PkgKg4ofeXbdqSO0OxkbHMxao",
    authDomain: "reformer-pilates-malta.firebaseapp.com",
    projectId: "reformer-pilates-malta",
    storageBucket: "reformer-pilates-malta.firebasestorage.app",
    messagingSenderId: "229596924816",
    appId: "1:229596924816:web:7861587fac11fc59188115",
    measurementId: "G-W4ZP6FS2LB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function disableHolidayMode() {
    try {
        const docRef = doc(db, "management", "settings");
        await setDoc(docRef, {
            holidayMode: false
        }, { merge: true });
        console.log("Holiday Mode successfully disabled in CORRECT Firestore path (management/settings).");
        process.exit(0);
    } catch (error) {
        console.error("Error updating Holiday Mode:", error);
        process.exit(1);
    }
}

disableHolidayMode();
