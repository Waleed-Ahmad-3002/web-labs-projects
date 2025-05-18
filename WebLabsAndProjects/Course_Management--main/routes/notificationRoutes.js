// notificationRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createNotification, 
    getStudentNotifications, 
    markNotificationAsRead ,
    createSystemNotification,
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');





// Apply authentication middleware to all routes
router.use(auth);

router.use('/api/notifications',  createSystemNotification);

// Create a new notification
router.post('/', createNotification);

// Get notifications for a specific student
router.get('/student/:studentId', getStudentNotifications);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

module.exports = router;