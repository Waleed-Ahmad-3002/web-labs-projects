const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // For students, username is their roll number
        const user = await User.findOne({ username, role });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('Invalid credentials - user not found');
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // For students, we skip password verification
        if (role === 'student') {
            console.log('Student login successful');
            const token = jwt.sign(
                { id: user._id, role: user.role, username: user.username }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );
            
            return res.json({ 
                token, 
                role: user.role,
                username: user.username
            });
        }
        
        // For admins, manually compare password since we might have issues with the model method
        let isMatch = false;
        
        if (user.password) {
            // If the password in DB is already hashed (starts with $2a$ or $2b$)
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                isMatch = await bcrypt.compare(password, user.password);
                console.log('Using bcrypt.compare:', isMatch ? 'Matched' : 'Did not match');
            } else {
                // Direct comparison if password isn't hashed
                isMatch = (password === user.password);
                console.log('Using direct comparison:', isMatch ? 'Matched' : 'Did not match');
            }
        }
        
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        if (!isMatch) {
            console.log('Invalid credentials - password mismatch');
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.json({ 
            token, 
            role: user.role,
            username: user.username
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { login };