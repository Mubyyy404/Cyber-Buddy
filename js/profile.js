import { auth, db, storage } from './firebase.js';
import { signOut, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

// Default avatars
const defaultAvatarSmall = 'images/default-avatar.png';
const defaultAvatarLarge = 'images/default-avatar-large.png';

// Wait for auth state
onAuthStateChanged(auth, async (user) => {
  if (user) await loadProfile(user);
  else window.location.href = "login.html";
});

async function loadProfile(user) {
  try {
    loading.style.display = 'block';
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) throw new Error("User data not found");

    const userData = userDoc.data();
    userNameSpan.textContent = user.displayName || userData.name || 'User';
    profilePicImg.src = user.photoURL || userData.profilePic || defaultAvatarSmall;
    profilePicImg.onerror = () => { profilePicImg.src = defaultAvatarSmall; };
    profilePicLarge.src = user.photoURL || userData.profilePic || defaultAvatarLarge;
    profilePicLarge.onerror = () => { profilePicLarge.src = defaultAvatarLarge; };
    nameInput.value = user.displayName || userData.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = userData.phone || '';
  } catch (err) {
    console.error(err);
    showError(err.message);
  } finally {
    loading.style.display = 'none';
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  loading.style.display = 'block';

  const newName = nameInput.value.trim();
  const newPhone = phoneInput.value.trim();

  if (!newName) { showError("Name is required"); saveBtn.disabled = false; loading.style.display='none'; return; }
  if (newPhone && !/^[0-9]{10,15}$/.test(newPhone)) { showError("Phone must be 10-15 digits"); saveBtn.disabled=false; loading.style.display='none'; return; }

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    let newProfilePic = profilePicLarge.src;

    if (profilePicInput.files[0]) {
      const file = profilePicInput.files[0];
      if (file.size > 2*1024*1024) throw new Error("Profile picture must be <2MB");
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      newProfilePic = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "users", user.uid), {
      name: newName,
      phone: newPhone,
      profilePic: newProfilePic
    });

    await updateProfile(user, { displayName: newName, photoURL: newProfilePic });

    // Update immediately
    profilePicImg.src = newProfilePic;
    profilePicLarge.src = newProfilePic;

    showSuccess("Profile updated successfully");
  } catch(err) {
    console.error(err);
    showError(err.message);
  } finally {
    saveBtn.disabled = false;
    loading.style.display = 'none';
  }
});

logoutBtn.addEventListener('click', async () => {
  try { await signOut(auth); window.location.href="login.html"; }
  catch(err){ showError(err.message); }
});

function showError(msg) {
  errorMsg.style.display = 'block';
  errorMsg.textContent = msg;
  successMsg.style.display = 'none';
}
function showSuccess(msg) {
  successMsg.style.display = 'block';
  successMsg.textContent = msg;
  errorMsg.style.display = 'none';
}
