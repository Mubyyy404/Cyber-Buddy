import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

const errorMessages = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-disabled': 'Your account has been disabled.',
  'auth/user-not-found': 'No user found with this email.',
  // Add more as needed
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) throw new Error("User data not found!");

    window.location.href = "dashboard.html";
  } catch (error) {
    showError(errorMessages[error.code] || error.message);
  }
});

function showError(message) {
  errorMsg.style.display = 'block';
  errorMsg.textContent = message;
}
