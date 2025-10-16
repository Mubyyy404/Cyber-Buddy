import { auth } from './firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const resetPasswordLink = document.getElementById("resetPassword");
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

  if (!loginForm) return console.error("Login form not found");

  const submitButton = loginForm.querySelector("button");
  if (!submitButton) return console.error("Submit button not found");

  const showMessage = (element, message) => {
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => {
      element.style.display = "none";
    }, 5000);
  };

  // 🔹 Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showMessage(errorMsg, "Please fill in all fields.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        showMessage(errorMsg, "⚠️ Please verify your email before logging in.");
        submitButton.disabled = false;
        submitButton.textContent = "Login";
        return;
      }

      // Redirect to dashboard
      window.location.href = "dashboard.html";

    } catch (error) {
      if (error.code === "auth/user-not-found") showMessage(errorMsg, "No account found with this email.");
      else if (error.code === "auth/wrong-password") showMessage(errorMsg, "Incorrect password.");
      else showMessage(errorMsg, "Error: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Login";
    }
  });

  // 🔹 Reset password
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      if (!email) {
        showMessage(errorMsg, "Please enter your email to reset password.");
        return;
      }

      resetPasswordLink.classList.add("disabled");
      resetPasswordLink.textContent = "Sending...";

      try {
        await sendPasswordResetEmail(auth, email);
        showMessage(successMsg, "📩 Password reset email sent!");
      } catch (error) {
        if (error.code === "auth/user-not-found") showMessage(errorMsg, "No account found with this email.");
        else showMessage(errorMsg, "Error: " + error.message);
      } finally {
        resetPasswordLink.classList.remove("disabled");
        resetPasswordLink.textContent = "Reset here";
      }
    });
  }

});
