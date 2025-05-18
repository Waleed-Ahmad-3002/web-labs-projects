// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        required: true,
        trim: true
    },
    schedule: {
        type: String,
        required: true,
        trim: true
    },
    seats: {
        type: Number,
        required: true,
        min: 0
    },
    enrolledStudents: {
        type: Number,
        default: 0
    },
    prerequisites: [{
        type: String,
        ref: 'Course'
    }]
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema, 'courses');

module.exports = Course;