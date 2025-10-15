import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');

const errorMessages = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Invalid email format.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  // Add more as needed
};

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim() || '';

  if (name === '') {
    showError('Name is required.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      purchasedCourses: [],
      profilePic: ''
    });

    await updateProfile(user, {
      displayName: name
    });

    alert('Registration successful! Redirecting to login...');
    window.location.href = "login.html";
  } catch (error) {
    console.error('Registration error:', error.code, error.message);
    showError(errorMessages[error.code] || error.message);
  }
});

function showError(message) {
  errorMsg.style.display = 'block';
  errorMsg.textContent = message;
}
