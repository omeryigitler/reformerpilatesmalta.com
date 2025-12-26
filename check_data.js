
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkData() {
    console.log("Searching for 'Betul' or 'Betül' (case insensitive)...");
    const slotsSnap = await getDocs(collection(db, "slots"));
    slotsSnap.forEach(doc => {
        const data = doc.data();
        const str = JSON.stringify(data).toLowerCase();
        if (str.includes('betul') || str.includes('betül') || str.includes('btldogan')) {
            console.log(`Found: ID=${doc.id} -> ${JSON.stringify(data)}`);
        }
    });
}

checkData();
