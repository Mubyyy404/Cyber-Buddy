import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra info in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            purchasedCourses: [] // initially empty
        });

        window.location.href = "login.html"; // redirect to login
    } catch (error) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = error.message;
    }
});
