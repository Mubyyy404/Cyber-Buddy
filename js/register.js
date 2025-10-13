import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLPNGY6w2otiBUGfbjnOM86DYfvh-zt4U",
  authDomain: "cyber-buddy-academy.firebaseapp.com",
  projectId: "cyber-buddy-academy",
  storageBucket: "cyber-buddy-academy.firebasestorage.app",
  messagingSenderId: "378058712667",
  appId: "1:378058712667:web:88b72bcde024c217dac17e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const msg = document.getElementById("register-message");
  const btn = document.getElementById("register-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!name || !email || !password) {
      msg.textContent = "⚠️ Please fill in all fields.";
      msg.style.color = "tomato";
      return;
    }

    btn.disabled = true;
    msg.textContent = "⏳ Creating account...";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      msg.textContent = "✅ Registration successful! Redirecting to login...";
      msg.style.color = "#00ffaa";

      setTimeout(() => window.location.href = "login.html", 2000);
    } catch (error) {
      msg.textContent = "❌ " + error.message;
      msg.style.color = "tomato";
    }

    btn.disabled = false;
  });
});
