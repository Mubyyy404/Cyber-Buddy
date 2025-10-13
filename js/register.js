// register.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("register-form");
const msg = document.getElementById("register-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      courses: [] // empty array for purchased courses
    });

    msg.textContent = "Registration successful! Redirecting to login...";
    msg.classList.remove("text-red-400");
    msg.classList.add("text-green-400");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    msg.textContent = error.message;
  }
});
