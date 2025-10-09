document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit');
    const formMsg = document.getElementById('form-message');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                formMsg.textContent = 'Please fill out all fields.';
                formMsg.style.color = 'tomato';
                return;
            }

            submitBtn.classList.add('form-loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                const userData = {
                    name: email.split('@')[0] || 'Mubeen',
                    email: email,
                    joinDate: new Date().toISOString().split('T')[0],
                    purchasedCourses: ['web-pentesting']
                };

                localStorage.setItem('currentUser', JSON.stringify(userData));

                formMsg.style.color = 'var(--accent)';
                formMsg.textContent = 'Login successful! Redirecting...';

                loginForm.reset();

                setTimeout(() => {
                    formMsg.textContent = '';
                    window.location.href = 'dashboard.html';
                }, 1500);

                submitBtn.classList.remove('form-loading');
                submitBtn.disabled = false;
            }, 1000);
        });
    }
});