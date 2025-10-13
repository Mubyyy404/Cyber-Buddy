// Import Firebase SDKs (use ES module URLs)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// 🧩 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCLPNGY6w2otiBUGfbjnOM86DYfvh-zt4U",
  authDomain: "cyber-buddy-academy.firebaseapp.com",
  projectId: "cyber-buddy-academy",
  storageBucket: "cyber-buddy-academy.firebasestorage.app",
  messagingSenderId: "378058712667",
  appId: "1:378058712667:web:88b72bcde024c217dac17e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🧠 Login Logic
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const submitBtn = document.getElementById("login-submit");
  const formMsg = document.getElementById("form-message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      formMsg.textContent = "⚠️ Please fill in both fields.";
      formMsg.style.color = "tomato";
      return;
    }

    submitBtn.disabled = true;
    formMsg.textContent = "⏳ Logging in...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Save user data in localStorage
      const userData = {
        email: user.email,
        uid: user.uid,
      };
      localStorage.setItem("currentUser", JSON.stringify(userData));

      formMsg.textContent = "✅ Login successful! Redirecting...";
      formMsg.style.color = "#00ffaa";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } catch (error) {
      formMsg.textContent = "❌ Invalid email or password.";
      formMsg.style.color = "tomato";
    }

    submitBtn.disabled = false;
  });
});
