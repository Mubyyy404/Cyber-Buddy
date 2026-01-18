import { auth, db } from './firebase.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// DOM elements
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const courseGrid = document.getElementById('courseGrid');
const noCourses = document.getElementById('noCourses');

// Default avatar
const defaultAvatar = 'images/default-avatar.png';

// Load courses from Firestore
async function loadCourses() {
    try {
        console.log('Fetching courses from Firestore');
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        console.log('Courses snapshot size:', coursesSnapshot.size);
        courseGrid.innerHTML = '';
        if (coursesSnapshot.empty) {
            console.log('No courses found in Firestore');
            noCourses.style.display = 'block';
            courseGrid.style.display = 'none';
        } else {
            noCourses.style.display = 'none';
            courseGrid.style.display = 'grid';
            coursesSnapshot.forEach((doc) => {
                const course = doc.data();
                const courseId = doc.id;
                console.log('Course loaded:', course.title, courseId);
                const courseElement = document.createElement('div');
                courseElement.classList.add('card');
                courseElement.innerHTML = `
                    <img src="${course.image || 'https://via.placeholder.com/270x160'}" alt="${course.title}">
                    <div class="card-content">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                        <button onclick="startCourse('${courseId}')">Access Course</button>
                    </div>
                `;
                courseGrid.appendChild(courseElement);
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        noCourses.style.display = 'block';
        noCourses.innerHTML = '<p>Error loading courses. Please try again later.</p>';
        courseGrid.style.display = 'none';
    }
}

// Start course function
window.startCourse = async (courseId) => {
    try {
        console.log('Attempting to start course:', courseId);
        const user = auth.currentUser;
        if (!user) {
            console.log('No user logged in in startCourse');
            alert('Access Denied: Please log in to start this course.');
            return;
        }
        console.log('User UID in startCourse:', user.uid);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            console.log('User document not found:', user.uid);
            alert('Error: User data not found.');
            return;
        }

        const userData = userDoc.data();
        const purchasedCourses = userData.purchasedCourses || [];
        console.log('Purchased courses for user:', purchasedCourses);

        if (purchasedCourses.includes(courseId)) {
            console.log('User authorized, redirecting to course:', courseId);
            window.location.href = `courses/${courseId}.html`;
        } else {
            console.log('User not authorized for course:', courseId);
            alert('Access Denied: You have not purchased this course.');
        }
    } catch (error) {
        console.error('Error starting course:', error);
        alert('An error occurred while trying to access the course.');
    }
};

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        console.log('Logging out user');
        await signOut(auth);
        window.location.replace('login.html');
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// ✅ Fixed Auth Check using onAuthStateChanged
let authResolved = false;

onAuthStateChanged(auth, async (user) => {

    if (user) {
        authResolved = true;
        console.log('User logged in:', user.uid);

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            let displayName = user.displayName;

            if (!displayName && userDoc.exists()) {
                displayName = userDoc.data().name || user.email || 'User';
            } else if (!displayName) {
                displayName = user.email || 'User';
            }

            userName.textContent = `Welcome, ${displayName}`;
            profilePic.src = user.photoURL || defaultAvatar;
            profilePic.onerror = () => profilePic.src = defaultAvatar;

            await loadCourses();
            return;
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // ⛔ DO NOT redirect immediately
    setTimeout(() => {
        if (!authResolved && !auth.currentUser) {
            console.log('Auth not resolved, redirecting to login');
            window.location.replace('login.html');
        }
    }, 1500);
});

