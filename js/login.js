import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) throw new Error("User data not found!");

        localStorage.setItem('user', JSON.stringify({ uid: user.uid, ...userDoc.data() }));
        window.location.href = "dashboard.html"; // redirect to course dashboard
    } catch (error) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = error.message;
    }
});
