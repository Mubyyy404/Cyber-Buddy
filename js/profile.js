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
const saveBtn = document.getElementById('saveBtn');
const loading = document.getElementById('loading');

let user = JSON.parse(localStorage.getItem('user') || '{}');

async function loadProfile() {
  if (!user.uid) {
    window.location.href = "login.html";
    return;
  }

  try {
    loading.style.display = 'block';
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
    } else {
      showError('User data not found.');
      window.location.href = "login.html";
    }
  } catch (error) {
    showError('Failed to load profile: ' + error.message);
  } finally {
    loading.style.display = 'none';
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

  if (newPhone && !/^[0-9]{10,15}$/.test(newPhone)) {
    showError('Phone number must be 10-15 digits.');
    return;
  }

  try {
    saveBtn.disabled = true;
    loading.style.display = 'block';

    if (profilePicInput.files[0]) {
      const file = profilePicInput.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showError('Profile picture must be under 2MB.');
        return;
      }
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      newProfilePic = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "users", user.uid), {
      name: newName,
      phone: newPhone,
      profilePic: newProfilePic
    });

    showSuccess('Profile updated successfully!');
    await loadProfile(); // Reload to reflect changes
  } catch (error) {
    showError('Failed to update profile: ' + error.message);
  } finally {
    saveBtn.disabled = false;
    loading.style.display = 'none';
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    window.location.href = "login.html";
  } catch (error) {
    showError('Failed to log out: ' + error.message);
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

loadProfile();
