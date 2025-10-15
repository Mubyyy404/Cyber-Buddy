import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

const errorMessages = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-disabled': 'Your account has been disabled.',
  'auth/user-not-found': 'No user found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  // Add more as needed
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    showError(errorMessages[error.code] || 'An error occurred. Please try again.');
  }
});

function showError(message) {
  errorMsg.style.display = 'block';
  errorMsg.textContent = message;
}
