import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
const db = getFirestore(app);

const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  successMsg.style.display = 'none';
}

function showSuccess(message, redirect = true) {
  successMsg.textContent = message;
  successMsg.style.display = 'block';
  errorMsg.style.display = 'none';
  if (redirect) {
    setTimeout(() => {
      window.location.href = 'course.html'; // Auto-redirect after success (user is already signed in)
    }, 1500);
  }
}

function clearMessages() {
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  errorMsg.textContent = '';
  successMsg.textContent = '';
}

// Clear messages when user starts typing
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', clearMessages);
});

// Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'course.html';
  }
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearMessages();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (password.length < 6) {
    showError('Password must be at least 6 characters long.');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // User is now signed in, create Firestore doc
      return setDoc(doc(db, "users", user.uid), {
        email: email,
        purchased: [],
        isAdmin: false
      });
    })
    .then(() => {
      showSuccess('Registration successful! Redirecting to courses...', true);
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showError('This email is already registered. Please <a href="login.html">login here</a>.');
      } else if (errorCode === 'auth/weak-password') {
        showError('Password must be at least 6 characters long. Please choose a stronger password.');
      } else if (errorCode === 'auth/invalid-email') {
        showError('Please enter a valid email address.');
      } else {
        showError(error.message || 'An error occurred during registration. Please try again.');
      }
    });
});
