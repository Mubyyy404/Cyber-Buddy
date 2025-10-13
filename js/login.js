import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLPNGY6w2otiBUGfbjnOM86DYfvh-zt4U",
  authDomain: "cyber-buddy-academy.firebaseapp.com",
  projectId: "cyber-buddy-academy",
  storageBucket: "cyber-buddy-academy.firebasestorage.app",
  messagingSenderId: "378058712667",
  appId: "1:378058712667:web:88b72bcde024c217dac17e",
  measurementId: "G-3F7D703MWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function clearError() {
  errorMsg.style.display = 'none';
  errorMsg.textContent = '';
}

// Clear error when user starts typing
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', clearError);
});

// Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'course.html';
  }
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in, redirect to courses
      window.location.href = 'course.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/user-not-found') {
        showError('No account found with this email. Please register first.');
      } else if (errorCode === 'auth/wrong-password') {
        showError('Incorrect password. Please try again.');
      } else if (errorCode === 'auth/invalid-email') {
        showError('Please enter a valid email address.');
      } else if (errorCode === 'auth/user-disabled') {
        showError('This account has been disabled. Contact support.');
      } else {
        showError(error.message || 'An error occurred during login. Please try again.');
      }
    });
});
