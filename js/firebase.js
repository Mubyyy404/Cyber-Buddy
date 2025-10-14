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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global auth state listener for redirects
onAuthStateChanged(auth, (user) => {
  if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
    window.location.href = "login.html";
  }
});

export { auth, db, storage };
