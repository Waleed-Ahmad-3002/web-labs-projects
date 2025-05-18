const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authcontroller');

// Input validation middleware for signup
const validateSignup = (req, res, next) => {
    const {
        username,
        email,
        password,
        phoneNumber = '',
        city = '',
        country = '',
        role = 'student'
    } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Role validation
    const validRoles = ['student', 'tutor'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role selected' });
    }

    next();
};

// Validation middleware for login remains the same
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    next();
};

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

module.exports = router;