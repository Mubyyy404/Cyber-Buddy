import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const courseGrid = document.getElementById('courseGrid');
const userNameSpan = document.getElementById('userName');
const profilePicImg = document.getElementById('profilePic');
const logoutBtn = document.getElementById('logoutBtn');

let user = JSON.parse(localStorage.getItem('user') || '{}');

async function loadUserData() {
  if (!user.uid) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    user = { uid: user.uid, ...userDoc.data() };
    localStorage.setItem('user', JSON.stringify(user));
    userNameSpan.textContent = `Welcome, ${user.name || 'User'}`;
    profilePicImg.src = user.profilePic || 'https://via.placeholder.com/40';
  }
}

const courses = [
  { id: "web-pentesting", name: "Web Pentesting", img: "https://via.placeholder.com/250x150", desc: "Learn web penetration testing.", file: "web-pentesting.html" },
  { id: "ethical-hacking", name: "Ethical Hacking", img: "https://via.placeholder.com/250x150", desc: "Ethical hacking fundamentals.", file: "ethical-hacking.html" },
  { id: "cyber-security-101", name: "Cyber Security 101", img: "https://via.placeholder.com/250x150", desc: "Basics of cyber security.", file: "cyber-security-101.html" }
];

async function renderCourses() {
  await loadUserData();
  if (!user.purchasedCourses || user.purchasedCourses.length === 0) {
    courseGrid.innerHTML = "<p>No courses purchased yet.</p>";
    return;
  }

  courses.forEach(course => {
    if (user.purchasedCourses.includes(course.id)) {
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <img src="${course.img}" alt="${course.name}">
        <h3>${course.name}</h3>
        <p>${course.desc}</p>
        <button data-course-id="${course.id}">Go to Course</button>
      `;
      courseGrid.appendChild(div);
    }
  });
}

courseGrid.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const courseId = e.target.dataset.courseId;
    window.location.href = `${courseId}.html`;
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('user');
  window.location.href = "login.html";
});

renderCourses();
