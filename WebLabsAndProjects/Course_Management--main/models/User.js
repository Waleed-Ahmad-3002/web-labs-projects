// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return this.role === 'admin'; // Password only required for admins
        }
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        required: true
    }
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
    if (this.role === 'admin' && this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
    if (this.role === 'student') return true; // For students, we might skip password verification
    return await bcrypt.compare(password, this.password);
};

// Set the collection name explicitly to 'users'
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;