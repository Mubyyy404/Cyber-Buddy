import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

const errorMessages = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Invalid email format.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'permission-denied': 'Insufficient permissions to create user data. Contact support.',
  // Add more as needed
};

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim() || '';

  // Clear previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (name === '') {
    showError('Name is required.');
    return;
  }

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth user profile with display name
    await updateProfile(user, {
      displayName: name
    });

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      purchasedCourses: [],
      profilePic: ''
    });

    // Show success message
    showSuccess('Registration successful! Redirecting to login...');

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    console.error('Registration error:', error.code, error.message);
    showError(errorMessages[error.code] || error.message);
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
