import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

console.log("Register script loaded at:", new Date().toISOString()); // Debugging
console.log("Auth object:", auth); // Debugging
console.log("Firestore db:", db); // Debugging

const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

if (!registerForm) console.error("Register form not found");
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

// 🟢 Register function
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submission triggered at:", new Date().toISOString()); // Debugging
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();
  console.log("Register attempt with email:", email, "phone:", phone); // Debugging

  // Validate inputs
  if (!name) {
    console.log("Validation failed: Missing name"); // Debugging
    showMessage(errorMsg, "Please enter your full name.");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Validation failed: Invalid email"); // Debugging
    showMessage(errorMsg, "Please enter a valid email address.");
    return;
  }
  if (password.length < 6) {
    console.log("Validation failed: Password too short"); // Debugging
    showMessage(errorMsg, "Password must be at least 6 characters long.");
    return;
  }
  const phoneRegex = /^\+?[\d\s-]{8,15}$/;
  if (!phone) {
    console.log("Validation failed: Missing phone number"); // Debugging
    showMessage(errorMsg, "Please enter your phone number.");
    return;
  }
  if (!phoneRegex.test(phone)) {
    console.log("Validation failed: Invalid phone number"); // Debugging
    showMessage(errorMsg, "Please enter a valid phone number (8-15 digits, optional +).");
    return;
  }

  if (!auth) {
    console.error("Auth object is undefined");
    showMessage(errorMsg, "❌ Error: Authentication service not initialized.");
    return;
  }

  const submitButton = registerForm.querySelector("button");
  submitButton.disabled = true;
  submitButton.textContent = "Registering..."; // Loading state
  console.log("Attempting user creation..."); // Debugging

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created, UID:", user.uid, "Email:", user.email); // Debugging

    // Update user profile with name
    await updateProfile(user, { displayName: name });
    console.log("User profile updated with name:", name); // Debugging

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      phone: phone,
      createdAt: new Date()
    });
    console.log("User data stored in Firestore"); // Debugging

    // Send email verification
    console.log("Attempting to send verification email to:", email); // Debugging
    await sendEmailVerification(user);
    console.log("Verification email sent successfully to:", email); // Debugging
    showMessage(successMsg, "📩 Account created! Please check your inbox or spam folder to verify your email.");

    // Sign out to enforce email verification on login
    await signOut(auth);
    console.log("User signed out after registration"); // Debugging

    // Redirect to login page after a short delay
    setTimeout(() => {
      console.log("Redirecting to login.html"); // Debugging
      window.location.href = "login.html";
    }, 3000);
  } catch (error) {
    console.error("Registration error:", error.code, error.message); // Detailed error logging
    if (error.code === "auth/email-already-in-use") {
      showMessage(errorMsg, "❌ This email is already registered. Please use a different email or log in.");
    } else if (error.code === "auth/invalid-email") {
      showMessage(errorMsg, "❌ Invalid email format. Please check your email.");
    } else if (error.code === "auth/weak-password") {
      showMessage(errorMsg, "❌ Password is too weak. Please use a stronger password.");
    } else if (error.code === "auth/network-request-failed") {
      showMessage(errorMsg, "❌ Network error. Please check your internet connection and try again.");
    } else {
      showMessage(errorMsg, "❌ Error: " + error.message);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Register"; // Reset button state
  }
});
