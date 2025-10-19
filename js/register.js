import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");
  const googleSignInButton = document.getElementById("googleSignIn");

  if (!registerForm) return console.error("Register form not found");
  if (!googleSignInButton) return console.error("Google sign-in button not found");

  const submitButton = registerForm.querySelector("button");
  if (!submitButton) return console.error("Register button not found");

  const showMessage = (element, message) => {
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => element.style.display = "none", 5000);
  };

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name, email, phone, createdAt: new Date()
      });

      await sendEmailVerification(user);
      showMessage(successMsg, "📩 Account created! Verify your email before login.");

      await signOut(auth);

      setTimeout(() => window.location.href = "login.html", 3000);

    } catch (error) {
      if (error.code === "auth/email-already-in-use") showMessage(errorMsg, "Email already registered.");
      else showMessage(errorMsg, "Error: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Register";
    }
  });

  googleSignInButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Google sign-in clicked");
    
    const provider = new GoogleAuthProvider();
    try {
      console.log("Starting Google sign-in...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google sign-in successful:", user.email);

      // Check if user document exists
      const userDoc = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDoc);
      
      if (!docSnap.exists()) {
        // New user - create document
        await setDoc(userDoc, {
          name: user.displayName || "Google User",
          email: user.email,
          phone: user.phoneNumber || "",
          createdAt: new Date(),
          authProvider: 'google'
        });
        console.log("User document created");
      } else {
        // Existing user - update if needed
        await updateDoc(userDoc, {
          lastLogin: new Date()
        });
        console.log("User document updated");
      }

      showMessage(successMsg, "Successfully signed in with Google!");
      setTimeout(() => window.location.href = "dashboard.html", 2000);
    } catch (error) {
      console.error("Google sign-in error:", error);
      showMessage(errorMsg, "Google sign-in failed: " + error.message);
    }
  });

});
