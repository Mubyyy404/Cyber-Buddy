import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const courseContainer = document.getElementById('courseContainer');
const noCoursesMsg = document.getElementById('noCoursesMsg');
const logoutBtn = document.getElementById('logoutBtn');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  await loadDashboard(user);
});

async function loadDashboard(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User data not found.");
      return;
    }

    const userData = userSnap.data();
    const purchased = userData.purchasedcourses || [];

    const courseSnap = await getDocs(collection(db, "courses"));
    const allCourses = [];
    courseSnap.forEach((doc) => allCourses.push({ id: doc.id, ...doc.data() }));

    const purchasedCourses = allCourses.filter(course => purchased.includes(course.title));

    if (purchasedCourses.length === 0) {
      noCoursesMsg.style.display = "block";
    } else {
      noCoursesMsg.style.display = "none";
      renderCourses(purchasedCourses);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

function renderCourses(courses) {
  courseContainer.innerHTML = "";
  courses.forEach((course) => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <img src="${course.image}" alt="${course.title}">
      <div class="course-card-content">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <button onclick="startCourse('${course.title}')">Start Course</button>
      </div>
    `;
    courseContainer.appendChild(card);
  });
}

window.startCourse = (courseTitle) => {
  const formatted = courseTitle.toLowerCase().replace(/\s+/g, '-');
  window.location.href = `${formatted}.html`;
};

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
