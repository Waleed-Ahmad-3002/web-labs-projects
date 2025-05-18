const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    student: { // Changed from 'username' to 'student' for clarity
        type: mongoose.Schema.Types.ObjectId, // Store ObjectId of the Student
        required: true,
        ref: 'Student' // References the Student model
    },
    issue: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema, "reports");

module.exports = Report;