import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing register.js");
  console.log("Firebase auth:", auth ? "Initialized" : "Not initialized");
  console.log("Firebase db:", db ? "Initialized" : "Not initialized");

  const registerForm = document.getElementById("registerForm");
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");
  const googleSignInButton = document.getElementById("googleSignIn");

  // ✅ Added this function here (moved from below)
  const showMessage = (element, message) => {
    console.log("Displaying message:", message);
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => {
      element.style.display = "none";
    }, 5000);
  };

  if (!registerForm) {
    console.error("Register form not found");
    return;
  }
  if (!googleSignInButton) {
    console.error("Google sign-in button not found");
    return;
  }
  if (!auth) {
    console.error("Firebase auth not initialized. Check firebase.js");
    showMessage(errorMsg, "Firebase authentication not initialized.");
    return;
  }
  if (!db) {
    console.error("Firestore not initialized. Check firebase.js");
    showMessage(errorMsg, "Firestore not initialized.");
    return;
  }

  const submitButton = registerForm.querySelector("button");
  if (!submitButton) {
    console.error("Register button not found");
    return;
  }

  // Email/Password Registration (unchanged)
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !email || !password || !phone) {
      showMessage(errorMsg, "Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage(errorMsg, "Invalid email address.");
      return;
    }

    if (password.length < 6) {
      showMessage(errorMsg, "Password must be at least 6 characters.");
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      showMessage(errorMsg, "Invalid phone number.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Registering...";

    try {
      console.log("Attempting email/password registration");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered:", user.email);

      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        createdAt: new Date(),
        authProvider: "email",
      });

      await sendEmailVerification(user);
      showMessage(successMsg, "📩 Account created! Verify your email before login.");

      await signOut(auth);
      console.log("User signed out after registration");

      setTimeout(() => {
        console.log("Redirecting to login.html");
        window.location.href = "login.html";
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        showMessage(errorMsg, "Email already registered.");
      } else {
        showMessage(errorMsg, "Error: " + error.message);
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Register";
    }
  });

  // Google Sign-In
  googleSignInButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Google sign-in button clicked");
    googleSignInButton.disabled = true;
    googleSignInButton.textContent = "Processing...";

    try {
      console.log("Creating GoogleAuthProvider");
      const provider = new GoogleAuthProvider();
      // ✅ Split scopes correctly
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");

      console.log("Attempting signInWithPopup");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google sign-in successful:", user.email, user.uid);

      const userDoc = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        console.log("Creating new user document");
        await setDoc(userDoc, {
          name: user.displayName || "Google User",
          email: user.email,
          phone: user.phoneNumber || "",
          createdAt: new Date(),
          authProvider: "google",
        });
        console.log("User document created for:", user.email);
      } else {
        console.log("Updating existing user document");
        await updateDoc(userDoc, {
          lastLogin: new Date(),
        });
        console.log("User document updated for:", user.email);
      }

      showMessage(successMsg, "Successfully signed in with Google!");
      console.log("Redirecting to dashboard.html");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    } catch (error) {
      console.error("Google sign-in error:", error.code, error.message);
      showMessage(errorMsg, `Google sign-in failed: ${error.message}`);
    } finally {
      googleSignInButton.disabled = false;
      googleSignInButton.textContent = "Continue with Google";
    }
  });
});
