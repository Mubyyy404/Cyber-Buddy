const courses = [
    { id: "basic-xss", title: "Basic XSS", description: "Introduction to Cross-Site Scripting attacks.", thumbnail: "https://via.placeholder.com/300x200?text=Basic+XSS" },
    { id: "advanced-xss", title: "Advanced XSS", description: "Deep dive into advanced XSS techniques.", thumbnail: "https://via.placeholder.com/300x200?text=Advanced+XSS" },
    { id: "web-pentesting", title: "Web Application Penetration Testing", description: "Comprehensive web pentesting guide.", thumbnail: "https://via.placeholder.com/300x200?text=Web+Pentesting" },
    { id: "sql-injection", title: "SQL Injection Fundamentals", description: "Learn SQL injection basics and defenses.", thumbnail: "https://via.placeholder.com/300x200?text=SQL+Injection" },
    { id: "bug-bounty", title: "Bug Bounty Training", description: "Hunt bugs like a pro.", thumbnail: "https://via.placeholder.com/300x200?text=Bug+Bounty" },
    { id: "network-pentesting", title: "Network Pentesting Essentials", description: "Network security testing essentials.", thumbnail: "https://via.placeholder.com/300x200?text=Network+Pentesting" },
    { id: "osint-recon", title: "OSINT & Recon", description: "Open-source intelligence gathering.", thumbnail: "https://via.placeholder.com/300x200?text=OSINT" },
    { id: "mobile-security", title: "Mobile Application Security", description: "Secure mobile apps from threats.", thumbnail: "https://via.placeholder.com/300x200?text=Mobile+Security" },
    { id: "cyber-forensics", title: "Cyber Forensics", description: "Digital forensics investigation techniques.", thumbnail: "https://via.placeholder.com/300x200?text=Cyber+Forensics" },
    { id: "red-team", title: "Red Team Operations", description: "Simulate advanced attacks.", thumbnail: "https://via.placeholder.com/300x200?text=Red+Team" }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    loadCourses('all-courses');
    loadProfile();
    switchTab('all-courses');
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    if (tabId === 'my-courses') {
        loadCourses('my-courses');
    }
}

function loadCourses(tab) {
    const grid = document.getElementById(tab === 'my-courses' ? 'my-courses-grid' : 'courses-grid');
    grid.innerHTML = '';
    const filteredCourses = tab === 'my-courses' ? courses.filter(c => currentUser.purchasedCourses.includes(c.id)) : courses;
    
    filteredCourses.forEach(course => {
        const isPurchased = currentUser.purchasedCourses.includes(course.id);
        const card = document.createElement('div');
        card.className = 'glass-card rounded-lg overflow-hidden shadow-lg hover:shadow-[0_6px_16px_rgba(6,182,212,0.15)] transition';
        card.innerHTML = `
            <img src="${course.thumbnail}" alt="${course.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-bold glow">${course.title}</h3>
                <p class="text-[#e6f6f8]/60 mt-2">${course.description}</p>
                ${isPurchased ? 
                    `<button onclick="startCourse('${course.id}')" class="mt-4 bg-[var(--accent)] w-full py-2 rounded hover:bg-[#0891b2] pulse-cta text-slate-900 font-semibold">Start Course</button>` :
                    `<button onclick="buyCourse('${course.id}')" class="mt-4 bg-gray-600 w-full py-2 rounded cursor-not-allowed text-slate-900 font-semibold">Buy Now ($49)</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

function startCourse(courseId) {
    if (currentUser.purchasedCourses.includes(courseId)) {
        window.location.href = `courses/${courseId}.html`;
    }
}

function buyCourse(courseId) {
    alert('Redirecting to payment... (Future: Integrate Razorpay/Stripe)');
    currentUser.purchasedCourses.push(courseId);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadCourses('all-courses');
}

function loadProfile() {
    const profileInfo = document.getElementById('profile-info');
    profileInfo.innerHTML = `
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Join Date:</strong> ${currentUser.joinDate}</p>
    `;
    
    const purchasedGrid = document.getElementById('purchased-courses');
    purchasedGrid.innerHTML = '';
    currentUser.purchasedCourses.forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const progress = localStorage.getItem(`${courseId}-progress`) || '0%';
            const div = document.createElement('div');
            div.className = 'glass-card p-4 rounded';
            div.innerHTML = `
                <h4 class="font-bold glow">${course.title}</h4>
                <p>Progress: ${progress}</p>
            `;
            purchasedGrid.appendChild(div);
        }
    });
}

function updateProfile() {
    const newName = prompt('New name:');
    if (newName) {
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadProfile();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}