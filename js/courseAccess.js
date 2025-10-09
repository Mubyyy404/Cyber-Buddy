let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let courseId = window.courseId;
let modules = [];
let currentModuleIndex = 0;
let progressData = JSON.parse(localStorage.getItem(`${courseId}-progress`) || '{}');

if (!currentUser) {
    window.location.href = '../index.html';
}

modules = [
    { title: "Module 1: Introduction", videoId: "dQw4w9WgXcQ" },
    { title: "Module 2: Tools Setup", videoId: "abcd1234" },
    { title: "Module 3: Basic Attacks", videoId: "efgh5678" },
    { title: "Module 4: Reporting", videoId: "ijkl9012" }
];

document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    disableRightClick();
});

function checkAccess() {
    const isPurchased = currentUser.purchasedCourses.includes(courseId);
    const denied = document.getElementById('access-denied');
    const content = document.getElementById('course-content');
    
    if (!isPurchased) {
        denied.classList.remove('hidden');
        content.classList.add('hidden');
        return;
    }
    
    denied.classList.add('hidden');
    content.classList.remove('hidden');
    loadModule(0);
    updateProgress();
}

function loadModule(index) {
    if (index < 0 || index >= modules.length) return;
    currentModuleIndex = index;
    
    const module = modules[index];
    const player = document.getElementById('video-player');
    player.src = `https://www.youtube.com/embed/${module.videoId}`;
    
    document.getElementById('module-indicator').textContent = `Module ${index + 1}: ${module.title}`;
    
    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').disabled = index === modules.length - 1;
    
    document.getElementById('watermark').classList.remove('hidden');
    document.getElementById('watermark').style.color = 'var(--accent)';
    
    progressData[`module${index + 1}`] = true;
    localStorage.setItem(`${courseId}-progress`, JSON.stringify(progressData));
    updateProgress();
}

function prevModule() {
    loadModule(currentModuleIndex - 1);
}

function nextModule() {
    loadModule(currentModuleIndex + 1);
}

function updateProgress() {
    const total = modules.length;
    const completed = Object.values(progressData).filter(Boolean).length;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-text').textContent = `Progress: ${percentage}%`;
    
    localStorage.setItem(`${courseId}-progress`, JSON.stringify({ ...progressData, overall: percentage }));
}

function markComplete() {
    if (Object.values(progressData).filter(Boolean).length === modules.length) {
        alert('Course completed! (Future: Issue certificate)');
    } else {
        alert('Complete all modules first.');
    }
}

function disableRightClick() {
    document.addEventListener('contextmenu', e => e.preventDefault());
}
