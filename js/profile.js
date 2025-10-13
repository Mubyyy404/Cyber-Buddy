import { auth, db, storage } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const profileForm = document.getElementById('profileForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const userNameSpan = document.getElementById('userName');
const profilePicImg = document.getElementById('profilePic');
const profilePicLarge = document.getElementById('profilePicLarge');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const profilePicInput = document.getElementById('profilePicInput');
const logoutBtn = document.getElementById('logoutBtn');

let user = JSON.parse(localStorage.getItem('user') || '{}');

async function loadProfile() {
  if (!user.uid) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    user = { uid: user.uid, ...userDoc.data() };
    localStorage.setItem('user', JSON.stringify(user));

    userNameSpan.textContent = user.name || 'User';
    profilePicImg.src = user.profilePic || 'https://via.placeholder.com/40';
    profilePicLarge.src = user.profilePic || 'https://via.placeholder.com/150';
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newName = nameInput.value.trim();
  const newPhone = phoneInput.value.trim();
  let newProfilePic = user.profilePic;

  if (newName === '') {
    showError('Name is required.');
    return;
  }

  try {
    if (profilePicInput.files[0]) {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, profilePicInput.files[0]);
      newProfilePic = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "users", user.uid), {
      name: newName,
      phone: newPhone,
      profilePic: newProfilePic
    });

    showSuccess('Profile updated successfully!');
    loadProfile(); // Reload to reflect changes
  } catch (error) {
    showError(error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('user');
  window.location.href = "login.html";
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

loadProfile();
