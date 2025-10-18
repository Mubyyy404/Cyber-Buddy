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

// Log DOM elements for debugging
console.log('DOM elements:', { profilePic, userName, logoutBtn, coursesGrid, myCoursesGrid, profileInfo, purchasedCoursesDiv, loading, searchCoursesAll, searchCoursesMy });

// Global variables
let courses = [];
let userData = {};
let currentUser = null;

// Default avatar
const defaultAvatar = 'https://mubyyy404.github.io/Cyber-Buddy/images/default-avatar-large.png';

// Utility to validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Clean purchasedCourses array
function cleanPurchasedCourses(courses) {
    return courses.filter(id => id && typeof id === 'string' && id.trim() !== '');
}

// Load courses from Firestore with real-time updates
function listenForCourses() {
    try {
        loading.style.display = 'block';
        coursesGrid.style.display = 'none';
        myCoursesGrid.style.display = 'none';
        console.log('Starting real-time course listener');
        onSnapshot(collection(db, 'courses'), (snapshot) => {
            console.log('Real-time courses update, snapshot size:', snapshot.size);
            courses = [];
            if (snapshot.empty) {
                console.log('No courses found in Firestore');
                coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">No courses available.</p>';
                myCoursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">No purchased courses.</p>';
            } else {
                snapshot.forEach((docSnap) => {
                    const course = docSnap.data();
                    const courseId = docSnap.id;
                    console.log('Course loaded:', course.title, courseId);
                    courses.push({
                        id: courseId,
                        title: course.title || 'Untitled Course',
                        description: course.description || 'No description available.',
                        thumbnail: course.image || '/images/course-placeholder.png'
                    });
                });
            }
            console.log('Courses array:', courses);
            renderCourses(document.querySelector('.tab-content:not(.hidden)').id || 'all-courses');
            loading.style.display = 'none';
            coursesGrid.style.display = 'grid';
            myCoursesGrid.style.display = 'grid';
        }, (error) => {
            console.error('Error listening for courses:', error);
            coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses: ' + error.message + '</p>';
            myCoursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses: ' + error.message + '</p>';
            loading.style.display = 'none';
        });
    } catch (error) {
        console.error('Error initializing course listener:', error);
        coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses: ' + error.message + '</p>';
        myCoursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading courses: ' + error.message + '</p>';
        loading.style.display = 'none';
    }
}

// Render courses for a specific tab with optional search filter
function renderCourses(tab, searchTerm = '') {
    const grid = tab === 'all-courses' ? coursesGrid : myCoursesGrid;
    grid.innerHTML = '';
    console.log('Rendering courses for tab:', tab, 'Search term:', searchTerm);
    console.log('User data:', userData);
    const filteredCourses = (tab === 'my-courses' ? courses.filter(c => userData.purchasedCourses.includes(c.id)) : courses)
        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    console.log('Filtered courses:', filteredCourses);

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
    console.log('Switching to tab:', tabId);
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
        alert('An error occurred while trying to access the course: ' + error.message);
    }
};

// Buy course function (simulated payment)
window.buyCourse = async (courseId) => {
    try {
        console.log('Attempting to buy course:', courseId);
        alert('Redirecting to payment... (Future: Integrate Razorpay/Stripe)');
        await updateDoc(doc(db, 'users', currentUser.uid), {
            purchasedCourses: arrayUnion(courseId)
        });
        userData.purchasedCourses.push(courseId);
        userData.purchasedCourses = cleanPurchasedCourses(userData.purchasedCourses);
        console.log('Updated purchased courses:', userData.purchasedCourses);
        renderCourses('all-courses', searchCoursesAll.value);
        if (!document.getElementById('my-courses').classList.contains('hidden')) {
            renderCourses('my-courses', searchCoursesMy.value);
        }
        if (!document.getElementById('profile').classList.contains('hidden')) {
            loadProfile();
        }
    } catch (error) {
        console.error('Error buying course:', error);
        alert('An error occurred while purchasing the course: ' + error.message);
    }
};

// Update course progress
window.updateCourseProgress = async (courseId) => {
    const progress = prompt('Enter progress percentage (0-100):', '0');
    if (progress && !isNaN(progress) && progress >= 0 && progress <= 100) {
        try {
            console.log('Updating progress for course:', courseId, 'to', progress);
            await updateDoc(doc(db, 'users', currentUser.uid), {
                [`${courseId}Progress`]: Number(progress),
                [`${courseId}Completed`]: progress >= 100
            });
            loadProfile();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Failed to update progress: ' + error.message);
        }
    } else {
        alert('Please enter a valid percentage (0-100).');
    }
};

// Load profile function
async function loadProfile() {
    console.log('Loading profile for user:', currentUser.uid);
    let displayName = currentUser.displayName || userData.name || currentUser.email || 'User';
    let joinDate = userData.createdAt ? userData.createdAt.toDate().toDateString() : 'October 18, 2025';
    let phone = userData.phone || 'Not provided';

    profileInfo.innerHTML = `
        <p><strong>Name:</strong> ${displayName}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Join Date:</strong> ${joinDate}</p>
    `;

    purchasedCoursesDiv.innerHTML = '';
    if (userData.purchasedCourses.length === 0) {
        purchasedCoursesDiv.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">No purchased courses.</p>';
        console.log('No purchased courses for user');
        return;
    }

    for (const courseId of userData.purchasedCourses) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const progress = userData[`${courseId}Progress`] || 0;
            const completed = userData[`${courseId}Completed`] || false;
            console.log('Course progress:', courseId, progress, 'Completed:', completed);
            const div = document.createElement('div');
            div.className = 'glass-card p-4 rounded';
            div.innerHTML = `
                <h4 class="font-bold glow">${course.title}</h4>
                <p>Progress: ${progress}%</p>
                <p>Completed: ${completed ? 'Yes' : 'No'}</p>
                <button onclick="updateCourseProgress('${courseId}')" class="mt-2 bg-[var(--accent)] px-4 py-1 rounded hover:bg-[#0891b2] pulse-cta text-slate-900 font-semibold" aria-label="Update progress for ${course.title}">Update Progress</button>
            `;
            purchasedCoursesDiv.appendChild(div);
        } else {
            console.log('Course not found for ID:', courseId);
        }
    }
}

// Update profile function
window.updateProfile = async () => {
    const newName = prompt('New name:', userData.name || currentUser.displayName || '');
    if (newName) {
        try {
            console.log('Updating profile name to:', newName);
            await authUpdateProfile(currentUser, { displayName: newName });
            await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
            userData.name = newName;
            userName.textContent = `Welcome, ${newName}`;
            loadProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
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
        alert('Failed to sign out: ' + error.message);
    }
});

// Search functionality
searchCoursesAll.addEventListener('input', (e) => {
    console.log('Search all courses:', e.target.value);
    renderCourses('all-courses', e.target.value);
});
searchCoursesMy.addEventListener('input', (e) => {
    console.log('Search my courses:', e.target.value);
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
                userData.purchasedCourses = cleanPurchasedCourses(userData.purchasedCourses || []);
            } else {
                console.log('User document not found, creating new:', user.uid);
                userData = { 
                    purchasedCourses: [], 
                    name: user.displayName || user.email, 
                    email: user.email,
                    createdAt: new Date(),
                    phone: ''
                };
                await setDoc(doc(db, 'users', user.uid), userData);
            }
            console.log('User data loaded:', userData);

            let displayName = user.displayName || userData.name || user.email || 'User';
            userName.textContent = `Welcome, ${displayName}`;
            profilePic.src = userData.profilePic && isValidUrl(userData.profilePic) ? userData.profilePic : defaultAvatar;
            profilePic.onerror = () => {
                profilePic.src = defaultAvatar;
                console.log('Profile picture fallback to default avatar');
            };

            listenForCourses();
            switchTab('all-courses');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            coursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error initializing dashboard: ' + error.message + '</p>';
            myCoursesGrid.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error initializing dashboard: ' + error.message + '</p>';
            profileInfo.innerHTML = '<p class="text-[#e6f6f8]/60 text-center">Error loading profile: ' + error.message + '</p>';
        }
    } else {
        console.log('No user logged in, redirecting to login');
        window.location.href = 'login.html';
    }
});
