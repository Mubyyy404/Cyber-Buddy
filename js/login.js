import { auth } from './firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const resetPasswordLink = document.getElementById('resetPassword');

const errorMessages = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-disabled': 'Your account has been disabled.',
  'auth/user-not-found': 'No user found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  // Add more as needed
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Clear previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful, redirecting to dashboard');
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    showError(errorMessages[error.code] || 'An error occurred during login. Please try again.');
  }
});

resetPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  if (!email) {
    showError('Please enter your email address to reset your password.');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showSuccess('Password reset email sent! Check your inbox.');
  } catch (error) {
    console.error('Password reset error:', error.code, error.message);
    showError(errorMessages[error.code] || 'Failed to send password reset email. Please try again.');
  }
});

function showError(message) {
  errorMsg.style.display = 'block';
  errorMsg.textContent = message;
  successMsg.style.display = 'none';
}

function showSuccess(message) {
  successMsg.style.display = 'block';
  successMsg.textContent = message;
  errorMsg.style.display = 'none';
}
