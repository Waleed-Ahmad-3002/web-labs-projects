const name = localStorage.getItem('registrationName');
const email = localStorage.getItem('registrationEmail');

if (!name || !email) {
    alert('Please complete step 1 first.');
    window.location.href = 'step1.html';
}

document.getElementById('displayName').textContent = name;
document.getElementById('displayEmail').textContent = email;

document.getElementById('backBtn').addEventListener('click', function () {
    window.location.href = 'step1.html';
});

document.getElementById('submitBtn').addEventListener('click', function () {
    const phone = document.getElementById('phone').value.trim();

    const phonePattern = /^\d{10,15}$/;
    if (!phonePattern.test(phone.replace(/[\s-()]/g, ''))) {
        document.getElementById('phoneError').style.display = 'block';
        return;
    } else {
        document.getElementById('phoneError').style.display = 'none';
    }

    localStorage.setItem('registrationPhone', phone);

    document.getElementById('confirmName').textContent = name;
    document.getElementById('confirmEmail').textContent = email;
    document.getElementById('confirmPhone').textContent = phone;
    document.getElementById('confirmation').style.display = 'block';

    document.getElementById('step2Form').style.display = 'none';
});