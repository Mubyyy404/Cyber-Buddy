import { auth, db, onAuthStateChanged, signOut, doc, getDoc } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// DOM elements
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const courseGrid = document.getElementById('courseGrid');
const noCourses = document.getElementById('noCourses');

// Default avatar
const defaultAvatar = 'images/default-avatar.png';

// Handle authentication state
onAuthStateChanged(auth, async (user) => {
    try {
        if (user) {
            // Set user info
            userName.textContent = `Welcome, ${user.displayName || 'User'}`;
            profilePic.src = user.photoURL || defaultAvatar;
            profilePic.onerror = () => {
                profilePic.src = defaultAvatar; // Fallback on error
                console.log('Profile picture fallback to default avatar');
            };
            console.log('User logged in:', user.uid);
        } else {
            console.log('No user logged in, showing as guest');
            userName.textContent = 'Welcome, Guest';
            profilePic.src = defaultAvatar;
        }
        // Load courses for all users
        await loadCourses();
    } catch (error) {
        console.error('Error checking auth state:', error);
        // Still attempt to load courses for non-logged-in users
        await loadCourses();
    }
});

// Load courses from Firestore
async function loadCourses() {
    try {
        console.log('Fetching courses from Firestore');
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        console.log('Courses snapshot size:', coursesSnapshot.size);
        courseGrid.innerHTML = ''; // Clear grid
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
                    <img src="${course.image || 'https://via.placeholder.com/250x150'}" alt="${course.title}">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <button onclick="startCourse('${courseId}')">Start Course</button>
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
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'student') {
                console.log('User authorized, redirecting to course:', courseId);
                window.location.href = `course${courseId}.html`; // Navigate to course page
            } else {
                console.log('User not authorized (role not student or no user doc)');
                alert('Access Denied: You are not authorized to start this course.');
            }
        } else {
            console.log('No user logged in');
            alert('Access Denied: Please log in to start this course.');
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
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});
