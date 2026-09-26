// firebase.js — Cyber Buddy Academy | Firebase init + Firestore helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, serverTimestamp,
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

/* ── Webinar registrations (index.html) ───────────────────────────────
   UNCHANGED. Still writes to the "registrations" collection with
   addDoc()'s auto-generated ID, exactly as before. Nothing here was
   touched, so your existing index.html, admin.html and the
   "sendRegistrationEmail" Cloud Function keep working as-is. */
export async function saveRegistration(data) {
  return addDoc(collection(db, "registrations"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

/* ── Internship applications (internship-cba-oct-03.html) ────────────
   Writes to its OWN collection, "internshipApplications" — this can
   never collide or mingle with "registrations" above, they're
   completely separate collections in Firestore.

   Instead of addDoc() (which assigns a random auto-ID), this uses
   setDoc() with a document ID we build ourselves:
     <10-digit contact number>_<submission timestamp>
   e.g. "9876543210_1758963200123"

   Why: it's unique per submission (timestamp guarantees that even if
   the same person applies twice), it's human-readable in the Firebase
   console, and — most importantly — it's deterministic, so there's no
   randomness or extra round-trip involved; the document is created
   automatically the moment the user submits, with no risk of an
   accidental duplicate or an empty auto-ID doc if the write is retried. */
export async function saveInternshipRegistration(data) {
  const safeContact = (data.contact || 'na').replace(/\D/g, '') || 'na';
  const docId = `${safeContact}_${Date.now()}`;
  await setDoc(doc(db, "internshipApplications", docId), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docId;
}

// Used only by admin.html (webinar registrations)
export async function fetchAllRegistrations() {
  const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Optional: for an admin view of internship applications later
// (wire this into admin.html as a separate table/tab whenever you want
// to see CBA-OCT-03 applicants there — it reads the new collection only).
export async function fetchAllInternshipRegistrations() {
  const q = query(collection(db, "internshipApplications"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export { signInWithEmailAndPassword, onAuthStateChanged, signOut };
