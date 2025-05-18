document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const tableBody = document.getElementById('feedbackTableBody');
    const messageDiv = document.getElementById('message');

    async function loadFeedback() {
        try {
            const response = await fetch('/api/feedback');
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            const feedbackList = await response.json();
            tableBody.innerHTML = '';
            feedbackList.forEach(feedback => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${feedback.name}</td><td>${feedback.email}</td><td>${feedback.message}</td>`;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            messageDiv.textContent = `Error loading feedback: ${error.message}`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        messageDiv.textContent = 'Submitting...';
        if (!name || !email || !message) {
            messageDiv.textContent = 'Please fill out all fields';
            return;
        }
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            messageDiv.textContent = 'Feedback submitted successfully';
            form.reset();
            loadFeedback();
        } catch (error) {
            messageDiv.textContent = `Error submitting feedback: ${error.message}`;
        }
    });

    loadFeedback();
});