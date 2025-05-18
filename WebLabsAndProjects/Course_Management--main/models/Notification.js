const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    student: { // Changed from 'username' to 'student' for consistency with the Report schema
        type: mongoose.Schema.Types.ObjectId, // Store ObjectId of the Student
        required: true,
        ref: 'Student' // References the Student model
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema, "notifications");

module.exports = Notification;