import { auth, db } from './firebase.js';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged, updateProfile as authUpdateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// DOM elements
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const coursesGrid = document.getElementById('courses-grid');
const myCoursesGrid = document.getElementById('my-courses-grid');
const profileInfo = document.getElementById('profile-info');
const purchasedCoursesDiv = document.getElementById('purchased-courses');
const loading = document.getElementById('loading');
const searchCoursesAll = document.getElementById('searchCoursesAll');
const searchCoursesMy = document.getElementById('searchCoursesMy');

// Global variables
let courses = [];
let userData = {};
let currentUser = null;

// Default avatar
const defaultAvatar = 'images/default-avatar.png';

// Utility to validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Load courses from Firestore with real-time updates
function listenForCourses() {
    try {
        loading.style.display = 'block';
        coursesGrid.style.display = 'none';
        myCoursesGrid.style.display = 'none';
        onSnapshot(collection(db, 'courses'), (snapshot) => {
            console.log('Real-time courses update, snapshot size:', snapshot.size);
            courses = [];
            snapshot.forEach((docSnap) => {
                const course = docSnap.data();
                const courseId = docSnap.id;
                console.log('Course loaded:', course.title, courseId);
                courses.push({
                    id: courseId,
                    title: course.title,
                    description: course.description,
                    thumbnail: course.image || '/images/course-placeholder.png'
                });
            });
            renderCourses(document.querySelector('.tab-content:not(.hidden)').id || 'all-courses');
            loading.style.display = 'none';
            coursesGrid.style.display = 'grid';
            myCoursesGrid.style.display = 'grid';
        }, (error) => {
            console.error('Error listening for courses:', error);
            coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses. Please try again later.</p>';
            loading.style.display = 'none';
        });
    } catch (error) {
        console.error('Error initializing course listener:', error);
        coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses. Please try again later.</p>';
        loading.style.display = 'none';
    }
}

// Render courses for a specific tab with optional search filter
function renderCourses(tab, searchTerm = '') {
    const grid = tab === 'all-courses' ? coursesGrid : myCoursesGrid;
    grid.innerHTML = '';
    const filteredCourses = (tab === 'my-courses' ? courses.filter(c => userData.purchasedCourses.includes(c.id)) : courses)
        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filteredCourses.length === 0) {
        grid.innerHTML = `<p class="text-[#e6f6f8]/60 text-center">${tab === 'my-courses' ? 'No purchased courses.' : 'No courses found.'}</p>`;
        return;
    }

    filteredCourses.forEach(course => {
        const isPurchased = userData.purchasedCourses.includes(course.id);
        const card = document.createElement('div');
        card.className = 'glass-card rounded-lg overflow-hidden shadow-lg hover:shadow-[0_6px_16px_rgba(6,182,212,0.15)] transition';
        const img = document.createElement('img');
        img.src = course.thumbnail;
        img.alt = course.title;
        img.className = 'w-full h-48 object-cover';

        const content = document.createElement('div');
        content.className = 'p-4';

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold glow';
        title.textContent = course.title;

        const desc = document.createElement('p');
        desc.className = 'text-[#e6f6f8]/60 mt-2';
        desc.textContent = course.description;

        const button = document.createElement('button');
        button.className = isPurchased
            ? 'mt-4 bg-[var(--accent)] w-full py-2 rounded hover:bg-[#0891b2] pulse-cta text-slate-900 font-semibold'
            : 'mt-4 bg-gray-600 w-full py-2 rounded cursor-not-allowed text-slate-900 font-semibold';
        button.textContent = isPurchased ? 'Start Course' : 'Buy Now ($49)';
        button.setAttribute('aria-label', isPurchased ? `Start ${course.title} course` : `Buy ${course.title} course`);
        button.tabIndex = 0;
        button.onclick = () => isPurchased ? startCourse(course.id) : buyCourse(course.id);
        button.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                isPurchased ? startCourse(course.id) : buyCourse(course.id);
            }
        });

        content.append(title, desc, button);
        card.append(img, content);
        grid.appendChild(card);
    });
}

// Switch tab function
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    if (tabId === 'all-courses' || tabId === 'my-courses') {
        renderCourses(tabId, tabId === 'all-courses' ? searchCoursesAll.value : searchCoursesMy.value);
    } else if (tabId === 'profile') {
        loadProfile();
    }
}

// Start course function
window.startCourse = async (courseId) => {
    try {
        console.log('Attempting to start course:', courseId);
        if (!currentUser) {
            console.log('No user logged in');
            alert('Access Denied: Please log in to start this course.');
            return;
        }
        if (userData.purchasedCourses.includes(courseId)) {
            console.log('User authorized, redirecting to course:', courseId);
            window.location.href = `course.html?id=${courseId}`;
        } else {
            console.log('User not authorized for course:', courseId);
            alert('Access Denied: You have not purchased this course.');
        }
    } catch (error) {
        console.error('Error starting course:', error);
        alert('An error occurred while trying to access the course.');
    }
};

// Buy course function (simulated payment)
window.buyCourse = async (courseId) => {
    try {
        alert('Redirecting to payment... (Future: Integrate Razorpay/Stripe)');
        await updateDoc(doc(db, 'users', currentUser.uid), {
            purchasedCourses: arrayUnion(courseId)
        });
        userData.purchasedCourses.push(courseId);
        renderCourses('all-courses', searchCoursesAll.value);
        if (!document.getElementById('my-courses').classList.contains('hidden')) {
            renderCourses('my-courses', searchCoursesMy.value);
        }
    } catch (error) {
        console.error('Error buying course:', error);
        alert('An error occurred while purchasing the course.');
    }
};

// Update course progress
window.updateCourseProgress = async (courseId) => {
    const progress = prompt('Enter progress percentage (0-100):', '0');
    if (progress && !isNaN(progress) && progress >= 0 && progress <= 100) {
        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'progress', courseId), { progress: `${progress}%` });
            loadProfile();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Failed to update progress.');
        }
    } else {
        alert('Please enter a valid percentage (0-100).');
    }
};

// Load profile function
async function loadProfile() {
    let displayName = currentUser.displayName || userData.name || currentUser.email || 'User';
    let joinDate = currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toDateString() : 'October 18, 2025';

    profileInfo.innerHTML = `
        <p><strong>Name:</strong> ${displayName}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Join Date:</strong> ${joinDate}</p>
    `;

    purchasedCoursesDiv.innerHTML = '';
    if (userData.purchasedCourses.length === 0) {
        purchasedCoursesDiv.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">No purchased courses.</p>';
        return;
    }

    for (const courseId of userData.purchasedCourses) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const progressDoc = await getDoc(doc(db, 'users', currentUser.uid, 'progress', courseId));
            const progress = progressDoc.exists() ? progressDoc.data().progress : '0%';
            const div = document.createElement('div');
            div.className = 'glass-card p-4 rounded';
            div.innerHTML = `
                <h4 class="font-bold glow">${course.title}</h4>
                <p>Progress: ${progress}</p>
                <button onclick="updateCourseProgress('${courseId}')" class="mt-2 bg-[var(--accent)] px-4 py-1 rounded hover:bg-[#0891b2] pulse-cta text-slate-900 font-semibold" aria-label="Update progress for ${course.title}">Update Progress</button>
            `;
            purchasedCoursesDiv.appendChild(div);
        }
    }
}

// Update profile function
window.updateProfile = async () => {
    const newName = prompt('New name:');
    if (newName) {
        try {
            await authUpdateProfile(currentUser, { displayName: newName });
            await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
            userData.name = newName;
            userName.textContent = `Welcome, ${newName}`;
            loadProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    }
};

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        console.log('Logging out user');
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
    }
});

// Search functionality
searchCoursesAll.addEventListener('input', (e) => {
    renderCourses('all-courses', e.target.value);
});
searchCoursesMy.addEventListener('input', (e) => {
    renderCourses('my-courses', e.target.value);
});

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log('User logged in:', user.uid, 'Email:', user.email, 'DisplayName:', user.displayName);

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
                userData.purchasedCourses = userData.purchasedCourses || [];
            } else {
                console.log('User document not found:', user.uid);
                userData = { purchasedCourses: [] };
                await setDoc(doc(db, 'users', user.uid), { purchasedCourses: [], name: user.displayName || user.email });
            }

            let displayName = user.displayName || userData.name || user.email || 'User';
            userName.textContent = `Welcome, ${displayName}`;
            profilePic.src = user.photoURL && isValidUrl(user.photoURL) ? user.photoURL : defaultAvatar;
            profilePic.onerror = () => {
                profilePic.src = defaultAvatar;
                console.log('Profile picture fallback to default avatar');
            };

            listenForCourses();
            switchTab('all-courses');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error initializing dashboard. Please try again.</p>';
        }
    } else {
        console.log('No user logged in, redirecting to login');
        window.location.href = 'login.html';
    }
});
