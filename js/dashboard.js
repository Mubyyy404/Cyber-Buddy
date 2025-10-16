import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Wait for authentication
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userNameEl = document.getElementById("userName");
  const profilePicEl = document.getElementById("profilePic");
  const courseGrid = document.getElementById("courseGrid");
  const noCourses = document.getElementById("noCourses");

  try {
    // Fetch user data
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    let purchasedCourses = [];

    if (userSnap.exists()) {
      const userData = userSnap.data();
      userNameEl.textContent = userData.name || user.email;
      if (userData.profileImage) profilePicEl.src = userData.profileImage;
      purchasedCourses = userData.purchasedcourses || [];
    }

    // Fetch all courses
    const coursesRef = collection(db, "courses");
    const querySnap = await getDocs(coursesRef);

    if (querySnap.empty) {
      noCourses.style.display = "block";
      return;
    }

    // Display all courses
    querySnap.forEach((courseDoc) => {
      const course = courseDoc.data();

      const isPurchased = purchasedCourses.some(
        (p) =>
          p.toLowerCase().trim() === course.title?.toLowerCase().trim() ||
          p.toLowerCase().trim() === courseDoc.id.toLowerCase().trim()
      );

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${course.image || 'images/default-course.png'}" alt="${course.title}">
        <div class="card-content">
          <h3>${course.title}</h3>
          <p>${course.description || 'No description available.'}</p>
          ${
            isPurchased
              ? `<button class="access-btn" data-course="${courseDoc.id}">Access Course</button>`
              : `<button class="locked-btn" disabled>🔒 Access Denied</button>`
          }
        </div>
      `;
      courseGrid.appendChild(card);
    });

    // Handle access button click
    document.querySelectorAll(".access-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const courseId = btn.getAttribute("data-course");
        // Redirect based on course ID
        if (courseId.toLowerCase().includes("web")) {
          window.location.href = "web-pentesting.html";
        } else if (courseId.toLowerCase().includes("network")) {
          window.location.href = "network-pentesting.html";
        } else {
          alert("Course page not found!");
        }
      });
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    noCourses.style.display = "block";
    noCourses.innerHTML = `<p>⚠️ Error loading courses. Check console for details.</p>`;
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});
