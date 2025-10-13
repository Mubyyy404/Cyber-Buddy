import { auth, db, setDoc, doc } from '../firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const form = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'users', uid), {
      name: name,
      email: email,
      purchasedCourses: [] // initially empty
    });

    window.location.href = 'login.html';
  } catch (err) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = err.message;
  }
});
