import { auth, db } from "./firebase.js";
import { collection, getDocs, doc, getDoc, query, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const userNameEl = document.getElementById("userName");
const profilePicEl = document.getElementById("profilePic");
const courseGrid = document.getElementById("courseGrid");
const noCourses = document.getElementById("noCourses");
const loadingEl = document.getElementById("loading");

auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "login.html";

  loadingEl.style.display = "block";
  try {
    // Get user info
    const userSnap = await getDoc(doc(db, "users", user.uid));
    let purchasedCourses = [];
    if (userSnap.exists()) {
      const data = userSnap.data();
      userNameEl.textContent = data.name || user.email;
      profilePicEl.src = data.profilePic || "https://via.placeholder.com/40?text=Avatar";
      purchasedCourses = Array.isArray(data.purchasedcourses) ? data.purchasedcourses : [];
    }

    // Get courses (with pagination)
    const coursesQuery = query(collection(db, "courses"), limit(10));
    const coursesSnap = await getDocs(coursesQuery);
    if (coursesSnap.empty) {
      noCourses.style.display = "block";
      return;
    }

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
        <img src="${course.image || 'https://via.placeholder.com/300x160?text=Course+Image'}" alt="${title} course image">
        <div class="card-content">
          <h3>${title}</h3>
          <p>${course.description || 'No description'}</p>
          ${
            isPurchased 
              ? `<button class="access-btn" data-course="${courseDoc.id}" data-url="${course.pageUrl || 'default-course.html'}" aria-label="Access ${title} course">Access Course</button>` 
              : `<button class="locked-btn" disabled aria-disabled="true" aria-label="${title} course is locked">🔒 Access Denied</button>`
          }
        </div>
      `;
      courseGrid.appendChild(card);
    });

    // Button click handler
    document.querySelectorAll(".access-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const courseUrl = btn.dataset.url;
        window.location.href = courseUrl;
      });
    });

  } catch (err) {
    console.error(err);
    noCourses.style.display = "block";
    noCourses.textContent = err.code === "permission-denied" 
      ? "⚠️ You don’t have permission to view courses."
      : err.code === "unavailable"
      ? "⚠️ Network error. Please try again later."
      : "⚠️ Error loading courses.";
  } finally {
    loadingEl.style.display = "none";
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
});
