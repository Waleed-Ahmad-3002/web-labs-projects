// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { createSession,
     getSessionsByTutorAndDate,
    getTutorSessions,
  getPendingRequests,
  updateSessionStatus,
  getSessionById,
  getStudentSessions,       // Add this
  updatePaymentStatus ,
  getTutorIncome,
  rescheduleSession,
  deleteSession
 } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);
// Create a new session
router.post('/',  createSession);
router.get('/tutor/:tutorId/date/:date', getSessionsByTutorAndDate);

router.get('/tutor/:tutorId', getTutorSessions);

router.get('/student/:studentId', getStudentSessions);

router.delete('/:sessionId', deleteSession);
// Add to sessionRoutes.js
router.get('/tutor/:tutorId/income', getTutorIncome);

// In your routes file
router.patch('/:sessionId/reschedule',  rescheduleSession);

// Get pending session requests for a tutor
router.get('/tutor/:tutorId/pending',getPendingRequests);

// Get session details by ID
router.get('/:sessionId', getSessionById);

// Update session status (confirm or cancel)
router.patch('/:sessionId/status', updateSessionStatus);

router.patch('/:sessionId/payment', updatePaymentStatus); 

module.exports = router;