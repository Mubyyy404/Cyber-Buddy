// firebase.js — Cyber Buddy Academy | Firebase init + Firestore helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjHkVkZb2RUjPG-dFi_Q1hYVDhY8OtKw8",
  authDomain: "educational-notification.firebaseapp.com",
  projectId: "educational-notification",
  storageBucket: "educational-notification.firebasestorage.app",
  messagingSenderId: "811687039959",
  appId: "1:811687039959:web:5227b6a5f234bf632c7192",
  measurementId: "G-5B174QPK2J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Write one registration. The Cloud Function "sendRegistrationEmail"
// (see /functions/index.js) fires automatically on every new document.
export async function saveRegistration(data) {
  return addDoc(collection(db, "registrations"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

// Used only by admin.html
export async function fetchAllRegistrations() {
  const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export { signInWithEmailAndPassword, onAuthStateChanged, signOut };
