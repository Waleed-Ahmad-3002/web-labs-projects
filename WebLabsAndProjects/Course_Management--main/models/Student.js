const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    completedCourses: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to Course model
        ref: 'Course' // Name of the referenced model
    }],
    registeredCourses: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to Course model
        ref: 'Course' // Name of the referenced model
    }]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema, "students");

module.exports = Student;