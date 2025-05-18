document.getElementById('submit-btn').onclick = () => {
    if (document.getElementById('name').value && document.getElementById('email').value) {
        document.getElementById('form-message').classList.remove('hidden');
    } else {
        alert('Please fill out all fields.');
    }
};
