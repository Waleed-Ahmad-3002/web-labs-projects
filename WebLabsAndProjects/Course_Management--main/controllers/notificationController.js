// notificationController.js
const Notification = require('../models/Notification');
const Student = require('../models/Student'); // Assuming this is your Student model

// Create a notification
const createNotification = async (req, res) => {
    try {
        const { studentId, message } = req.body;
        
        // Validate input
        if (!studentId || !message) {
            return res.status(400).json({ message: 'Student ID and message are required' });
        }
        
        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Create the notification
        const notification = new Notification({
            student: studentId,
            message,
            status: 'unread'
        });
        
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get notifications for a specific student
const getStudentNotifications = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const notifications = await Notification.find({ student: studentId })
            .sort({ createdAt: -1 }); // Most recent first
            
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByIdAndUpdate(
            id,
            { status: 'read' },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Internal function to create notifications (for use by other controllers)
const createSystemNotification = async (studentId, message) => {
    try {
        const notification = new Notification({
            student: studentId,
            message,
            status: 'unread'
        });
        
        return await notification.save();
    } catch (err) {
        console.error('Error creating system notification:', err);
        throw err;
    }
};


module.exports = {
    createNotification,
    getStudentNotifications,
    markNotificationAsRead,
    createSystemNotification // Export for use by other controllers
};