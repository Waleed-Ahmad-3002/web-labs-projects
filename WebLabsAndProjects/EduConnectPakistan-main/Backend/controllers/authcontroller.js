const User = require('../models/User');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Signup Controller
/*
const signup = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { 
            username, 
            email, 
            password, 
            phoneNumber = '', 
            city = '', 
            country = '',
            role = 'student'
        } = req.body;

        // Mandatory field validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            city,
            country,
            role,
            lastActive: new Date(),
            isActive: true
        });

        // Save user with session
        const savedUser = await newUser.save({ session });

        // Create profile based on role
        let specificProfile;
        if (role === 'student') {
            specificProfile = new Student({
                userId: savedUser._id
            });
            await specificProfile.save({ session });
        } else if (role === 'tutor') {
            specificProfile = new Tutor({
                userId: savedUser._id
            });
            await specificProfile.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: savedUser._id, 
                username: savedUser.username,
                role: savedUser.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'User created successfully', 
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                profileId: specificProfile ? specificProfile._id : null
            }
        });
    } catch (error) {
        // Abort transaction in case of error
        await session.abortTransaction();
        session.endSession();

        console.error('Signup Error:', error);

        res.status(500).json({ 
            message: 'Server error during signup', 
            error: error.message 
        });
    }
};*/
const signup = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { 
            username, 
            email, 
            password, 
            phoneNumber = '', 
            city = '', 
            country = '',
            role = 'student'
        } = req.body;

        // Mandatory field validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with empty profilePicture
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            city,
            country,
            role,
            profilePicture: '', // Explicitly set to empty string
            lastActive: new Date(),
            isActive: true
        });

        // Save user with session
        const savedUser = await newUser.save({ session });

        // Create profile based on role
        let specificProfile;
        if (role === 'student') {
            specificProfile = new Student({
                userId: savedUser._id
            });
            await specificProfile.save({ session });
        } else if (role === 'tutor') {
            specificProfile = new Tutor({
                userId: savedUser._id
            });
            await specificProfile.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: savedUser._id, 
                username: savedUser.username,
                role: savedUser.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'User created successfully', 
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                profilePicture: '', // Explicitly return empty string
                profileId: specificProfile ? specificProfile._id : null
            }
        });
    } catch (error) {
        // Abort transaction in case of error
        await session.abortTransaction();
        session.endSession();

        console.error('Signup Error:', error);

        res.status(500).json({ 
            message: 'Server error during signup', 
            error: error.message 
        });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Find specific profile based on role
        let specificProfile;
        if (user.role === 'student') {
            specificProfile = await Student.findOne({ userId: user._id });
        } else if (user.role === 'tutor') {
            specificProfile = await Tutor.findOne({ userId: user._id });
        }

        // Update last active timestamp
        user.lastActive = new Date();
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileId: specificProfile ? specificProfile._id : null
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error during login', 
            error: error.message 
        });
    }
};

module.exports = { signup, login };