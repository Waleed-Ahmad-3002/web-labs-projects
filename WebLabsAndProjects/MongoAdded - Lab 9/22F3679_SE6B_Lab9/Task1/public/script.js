/**
 * Student Registration Form Handler
 *
 * This script handles the student registration form submission process.
 * It performs client-side validation, checks email availability,
 * and submits registration data to the server.
 */

// Add event listener to the registration form for the submit event
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    // Prevent the default form submission behavior (page reload)
    e.preventDefault();

    // Get form field values from the DOM
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const department = document.getElementById('department').value;

    // Get reference to the message display div for showing feedback
    const messageDiv = document.getElementById('message');

    try {
        // Step 1: Check if the email is already registered
        // Make API request to check email availability
        const check = await fetch(`http://localhost:3000/api/students/check-email/${email}`);
        const { available } = await check.json();

        if (available) {
            // Step 2: If email is available, proceed with registration
            // Send POST request to the registration endpoint with user data
            const res = await fetch('http://localhost:3000/api/students/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
                body: JSON.stringify({ name, email, password, department }) // Convert data to JSON string
            });

            // Parse the server response
            const data = await res.json();

            // Display success or error message based on server response
            messageDiv.innerHTML = `<div class="alert alert-${data.success ? 'success' : 'danger'}">${data.success ? 'Registration successful!' : data.error}</div>`;

            // If registration was successful, reset the form
            if (data.success) document.getElementById('registrationForm').reset();
        } else {
            // If email is already taken, show error message
            messageDiv.innerHTML = '<div class="alert alert-danger">Email is already taken.</div>';
        }
    } catch (err) {
        // Handle any errors that occur during the API requests
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    }
});