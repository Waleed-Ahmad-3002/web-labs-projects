document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const department = document.getElementById('department').value;
    const messageDiv = document.getElementById('message');
    try {
        const check = await fetch(`/api/students/check-email/${email}`);
        const { available } = await check.json();
        if (available) {
            const res = await fetch('/api/students/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, department })
            });
            const data = await res.json();
            messageDiv.innerHTML = `<div class="alert alert-${data.success ? 'success' : 'danger'}">${data.success ? 'Registration successful!' : data.error}</div>`;
            if (data.success) document.getElementById('registrationForm').reset();
        } else {
            messageDiv.innerHTML = '<div class="alert alert-danger">Email is already taken.</div>';
        }
    } catch (err) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    }
});