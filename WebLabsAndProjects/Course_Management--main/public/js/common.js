// common.js

// Utility Functions
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

function hideModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.classList.add('hidden'));
}

// Initialize Navigation
function initNavigation(navItems, contentPages) {
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            contentPages.forEach(content => content.classList.add('hidden'));
            document.getElementById(`${page}-page`).classList.remove('hidden');
        });
    });
}

// Export functions if using ES6 modules
export { showError, hideError, hideModal, initNavigation };// Utility Functions
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

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
}

function hideModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.classList.add('hidden'));
}

// Initialize Navigation
function initNavigation(navItems, contentPages) {
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            contentPages.forEach(content => content.classList.add('hidden'));
            document.getElementById(`${page}-page`).classList.remove('hidden');
        });
    });
}

// Initialize Modals
function initModals() {
    // Close modals when clicking the close button or outside the modal
    document.querySelectorAll('.close-button, .modal-overlay').forEach(element => {
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-button') || e.target.classList.contains('modal-overlay')) {
                hideModal();
            }
        });
    });

    // Handle form submissions
    document.getElementById('course-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add logic to save course
        hideModal();
    });

    document.getElementById('student-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add logic to save student registration
        hideModal();
    });
}

// Export functions if using ES6 modules
export { showError, hideError, showModal, hideModal, initNavigation, initModals };