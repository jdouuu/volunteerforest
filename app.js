document.addEventListener('DOMContentLoaded', () => {
    // Page navigation
    const pages = {
        'home-link': 'dashboard-page',
        'events-link': 'dashboard-page', // Update with events page if created
        'profile-link': 'profile-page',
        'history-link': 'dashboard-page', // Update with history page if created
        'admin-link': 'dashboard-page', // Admin dashboard already included
        'register-link': 'login-page' // Update with register page if created
    };

    Object.keys(pages).forEach(linkId => {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(pages[linkId]);
            });
        }
    });

    // Show a specific page and hide others
    function showPage(pageId) {
        const pageElements = document.querySelectorAll('#app > div');
        pageElements.forEach(page => page.classList.add('hidden'));
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.classList.remove('hidden');
        }
    }

    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // Placeholder for login logic (replace with actual backend API call)
            console.log('Login attempt:', { email, password });
            showPage('dashboard-page');
            document.getElementById('username-display').textContent = email.split('@')[0];
            document.getElementById('dashboard-username').textContent = email.split('@')[0];
        });
    }

    // Profile form character count
    const inputs = [
        { id: 'full-name', countId: 'name-count', max: 50 },
        { id: 'address1', countId: 'address1-count', max: 100 },
        { id: 'address2', countId: 'address2-count', max: 100 },
        { id: 'city', countId: 'city-count', max: 100 }
    ];

    inputs.forEach(({ id, countId, max }) => {
        const input = document.getElementById(id);
        const count = document.getElementById(countId);
        if (input && count) {
            input.addEventListener('input', () => {
                count.textContent = `${input.value.length}/${max} characters`;
            });
        }
    });

    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const data = Object.fromEntries(formData);
            // Placeholder for profile update logic (replace with backend API call)
            console.log('Profile update:', data);
            alert('Profile updated successfully!');
        });
    }

    // Profile image preview
    const profileImageInput = document.getElementById('profile-image');
    const profileImagePreview = document.getElementById('profile-image-preview');
    if (profileImageInput && profileImagePreview) {
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Notification button toggle
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            const dot = notificationBtn.querySelector('.notification-dot');
            if (dot) {
                dot.classList.toggle('hidden');
            }
        });
    }
});