const signupContainer = document.getElementById('signupContainer');
const loginContainer = document.getElementById('loginContainer');

document.getElementById('showLogin').addEventListener('click', e => {
  e.preventDefault();
  signupContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});

document.getElementById('showSignup').addEventListener('click', e => {
  e.preventDefault();
  loginContainer.style.display = 'none';
  signupContainer.style.display = 'block';
});

document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    alert('Please fill all fields.');
    return;
  }
  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  localStorage.setItem('user', JSON.stringify({ name, email, password }));
  alert('Signup successful! Please login.');
  signupContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});


document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const loginEmail = document.getElementById('loginEmail').value.trim();
  const loginPassword = document.getElementById('loginPassword').value.trim();
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser) {
    alert('No user found. Please signup first.');
    return;
  }
  if (loginEmail === storedUser.email && loginPassword === storedUser.password) {
    alert(`Welcome, ${storedUser.name}!`);
  } else {
    alert('Invalid credentials.');
  }
});
