import { auth, db } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const registerBtn = document.getElementById("registerBtn");
  registerBtn.disabled = true;
  registerBtn.textContent = "Registering...";

  try {
    // ✅ Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created:", user.uid);

    // ✅ Save user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
      verified: false,
    });

    // ✅ Send email verification
    await sendEmailVerification(user);
    alert("✅ Verification email sent! Please check your inbox before logging in.");

    registerBtn.textContent = "Registration Successful";
    registerBtn.disabled = true;

    // ✅ Sign out temporarily so unverified users can’t auto-login
    await auth.signOut();

    // Redirect to login after 3 sec
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

  } catch (error) {
    console.error("Registration Error:", error);
    alert("❌ " + error.message);
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
  }
});
