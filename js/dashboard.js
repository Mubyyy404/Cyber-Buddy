import { auth, db } from "./firebase.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const userNameEl = document.getElementById("userName");
const profilePicEl = document.getElementById("profilePic");
const courseGrid = document.getElementById("courseGrid");
const noCourses = document.getElementById("noCourses");

// Auth check
auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "login.html";

  try {
    // Get user info
    const userSnap = await getDoc(doc(db, "users", user.uid));
    let purchasedCourses = [];
    if (userSnap.exists()) {
      const data = userSnap.data();
      userNameEl.textContent = data.name || user.email;
      profilePicEl.src = data.profilePic || 'images/default-avatar.png';
      purchasedCourses = data.purchasedcourses || [];
    }

    // Get all courses
    const coursesSnap = await getDocs(collection(db, "courses"));
    if (coursesSnap.empty) return noCourses.style.display = "block";

    courseGrid.innerHTML = "";

    coursesSnap.forEach((courseDoc) => {
      const course = courseDoc.data();
      const title = course.title || courseDoc.id;

      const isPurchased = purchasedCourses.some(
        (p) => p.toLowerCase().trim() === title.toLowerCase().trim() || 
               p.toLowerCase().trim() === courseDoc.id.toLowerCase().trim()
      );

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${course.image || 'images/default-course.png'}" alt="${title}">
        <div class="card-content">
          <h3>${title}</h3>
          <p>${course.description || 'No description'}</p>
          ${
            isPurchased 
              ? `<button class="access-btn" data-course="${courseDoc.id}">Access Course</button>` 
              : `<button class="locked-btn" disabled>🔒 Access Denied</button>`
          }
        </div>
      `;
      courseGrid.appendChild(card);
    });

    // Button click handler
    document.querySelectorAll(".access-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const courseId = btn.dataset.course.toLowerCase();
        if (courseId.includes("web")) window.location.href = "web-pentesting.html";
        else if (courseId.includes("network")) window.location.href = "network-pentesting.html";
        else alert("Course page not found");
      });
    });

  } catch (err) {
    console.error(err);
    noCourses.style.display = "block";
    noCourses.textContent = "⚠️ Error loading courses.";
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});
