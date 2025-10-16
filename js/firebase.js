import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLPNGY6w2otiBUGfbjnOM86DYfvh-zt4U",
  authDomain: "cyber-buddy-academy.firebaseapp.com",
  projectId: "cyber-buddy-academy",
  storageBucket: "cyber-buddy-academy.firebasestorage.app",
  messagingSenderId: "378058712667",
  appId: "1:378058712667:web:88b72bcde024c217dac17e",
  measurementId: "G-3F7D703MWN"
};

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  console.log("Firebase initialized at:", new Date().toISOString()); // Debugging
  console.log("Auth object:", auth); // Debugging
  console.log("Firestore db:", db); // Debugging
  console.log("Storage:", storage); // Debugging

  // Global auth state listener for redirects
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed at:', new Date().toISOString(), user ? `User: ${user.uid}, Email: ${user.email}, DisplayName: ${user.displayName}` : 'No user');
    const pathname = window.location.pathname;
    if (!user && !pathname.includes('login.html') && !pathname.includes('register.html')) {
      console.log('Redirecting to login.html from:', pathname);
      window.location.href = "login.html";
    }
  });

  export { auth, db, storage };
} catch (error) {
  console.error("Firebase initialization error:", error.code, error.message); // Debugging
}
