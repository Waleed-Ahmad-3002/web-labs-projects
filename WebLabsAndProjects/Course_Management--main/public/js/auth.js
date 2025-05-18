document.addEventListener('DOMContentLoaded', function () {
    initLoginPage();
});

function initLoginPage() {
    const loginTabs = document.querySelectorAll('.login-tab');
    const studentForm = document.querySelector('.student-form');
    const adminForm = document.querySelector('.admin-form');

    loginTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabType = this.getAttribute('data-tab');
            loginTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (tabType === 'student') {
                studentForm.classList.remove('hidden');
                adminForm.classList.add('hidden');
            } else if (tabType === 'admin') {
                adminForm.classList.remove('hidden');
                studentForm.classList.add('hidden');
            }
        });
    });

    // Student Login
    const studentLoginBtn = document.getElementById('student-login-btn');
    studentLoginBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const studentId = document.getElementById('student-id').value;
        
        if (!studentId) {
            return showError('student-error', 'Please enter your roll number.');
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: studentId, 
                    password: 'student', // You may need to adjust this
                    role: 'student' 
                }),
            });

   

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.username);
                showStudentDashboard();
            } else {
                showError('student-error', data.message || 'Login failed');
            }
        } catch (err) {
            showError('student-error', 'Server error. Please try again later.');
        }
    });

    // Admin Login
    const adminLoginBtn = document.getElementById('admin-login-btn');
    adminLoginBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const adminUsername = document.getElementById('admin-username').value;
        const adminPassword = document.getElementById('admin-password').value;
        
        if (!adminUsername || !adminPassword) {
            return showError('admin-error', 'Please enter both username and password.');
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: adminUsername, 
                    password: adminPassword, 
                    role: 'admin' 
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.username);
                showAdminDashboard();
            } else {
                showError('admin-error', data.message || 'Login failed');
            }
        } catch (err) {
            showError('admin-error', 'Server error. Please try again later.');
        }
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
}

function showStudentDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('student-dashboard').classList.remove('hidden');
    initStudentDashboard();
}

function showAdminDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    initAdminDashboard();
}
