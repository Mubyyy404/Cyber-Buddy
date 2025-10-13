// login.js
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("login-form");
const msg = document.getElementById("login-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user courses
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, courses: userData.courses }));

    window.location.href = "courses.html";
  } catch (error) {
    msg.textContent = error.message;
  }
});
