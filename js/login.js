import { auth } from './firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

console.log("Login script loaded at:", new Date().toISOString()); // Debugging
console.log("Auth object:", auth); // Debugging

const loginForm = document.getElementById("loginForm");
const resetPasswordLink = document.getElementById("resetPassword");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

if (!loginForm) console.error("Login form not found");
if (!resetPasswordLink) console.error("Reset password link not found");
if (!errorMsg) console.error("Error message element not found");
if (!successMsg) console.error("Success message element not found");

// Function to show messages
const showMessage = (element, message) => {
  console.log("Showing message:", message); // Debugging
  element.textContent = message;
  element.style.display = "block";
  setTimeout(() => {
    element.style.display = "none";
  }, 5000); // Hide after 5 seconds
};

// 🟢 Login function
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Login form submitted at:", new Date().toISOString()); // Debugging
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  console.log("Login attempt with email:", email); // Debugging

  if (!auth) {
    console.error("Auth object is undefined - check firebase.js import");
    showMessage(errorMsg, "❌ Error: Authentication service not initialized.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful, user:", user.email, "Verified:", user.emailVerified); // Debugging

    if (!user.emailVerified) {
      console.log("User email not verified, signing out"); // Debugging
      showMessage(errorMsg, "⚠️ Please verify your email before logging in. Check your inbox or spam folder.");
      await signOut(auth);
      console.log("User signed out due to unverified email"); // Debugging
      return;
    }

    console.log("User verified, redirecting to dashboard.html"); // Debugging
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error.code, error.message); // Detailed error logging
    if (error.code === "auth/user-not-found") {
      showMessage(errorMsg, "❌ No account found with this email. Please check or register.");
    } else if (error.code === "auth/wrong-password") {
      showMessage(errorMsg, "❌ Incorrect password. Please try again.");
    } else if (error.code === "auth/network-request-failed") {
      showMessage(errorMsg, "❌ Network error. Please check your internet connection and try again.");
    } else {
      showMessage(errorMsg, "❌ Error: " + error.message);
    }
  }
});

// 🟠 Reset Password
resetPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Reset password link clicked at:", new Date().toISOString()); // Debugging
  const emailInput = document.getElementById("email");
  if (!emailInput) {
    console.error("Email input not found");
    showMessage(errorMsg, "❌ Error: Email input not found.");
    return;
  }
  const email = emailInput.value.trim();
  console.log("Email entered for reset:", email); // Debugging
  if (!email) {
    showMessage(errorMsg, "Please enter your email to reset password.");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage(errorMsg, "Please enter a valid email address.");
    return;
  }

  if (!auth) {
    console.error("Auth object is undefined - check firebase.js import");
    showMessage(errorMsg, "❌ Error: Authentication service not initialized.");
    return;
  }

  resetPasswordLink.classList.add("disabled");
  resetPasswordLink.textContent = "Sending..."; // Loading state
  console.log("Attempting to send password reset email..."); // Debugging
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully to:", email); // Debugging
    showMessage(successMsg, "📩 Password reset email sent! Check your inbox or spam folder.");
  } catch (error) {
    console.error("Reset password error:", error.code, error.message); // Detailed error logging
    if (error.code === "auth/user-not-found") {
      showMessage(errorMsg, "❌ No account found with this email. Please check or register.");
    } else if (error.code === "auth/invalid-email") {
      showMessage(errorMsg, "❌ Invalid email format. Please check your email.");
    } else if (error.code === "auth/network-request-failed") {
      showMessage(errorMsg, "❌ Network error. Please check your internet connection and try again.");
    } else {
      showMessage(errorMsg, "❌ Error: " + error.message);
    }
  } finally {
    resetPasswordLink.classList.remove("disabled");
    resetPasswordLink.textContent = "Reset here"; // Reset link state
  }
});
