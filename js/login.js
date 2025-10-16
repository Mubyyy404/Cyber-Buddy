import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("⚠️ Please verify your email before logging in.");
      await auth.signOut();
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
      return;
    }

    alert("✅ Login successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("❌ " + error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});
