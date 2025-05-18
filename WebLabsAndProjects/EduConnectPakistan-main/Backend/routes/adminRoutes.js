// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { 
  getAllVerificationRequests, 
  getTutorForVerification,
  updateVerificationStatus
} = require('../controllers/admincontroller');

// All routes should be protected and only accessible by admins
router.use(protect);
router.use(restrictTo('admin'));

// Get all verification requests
router.get('/verification-requests', getAllVerificationRequests);

// Get detailed info about a single tutor
router.get('/tutor-verification/:tutorId', getTutorForVerification);

// Update verification request status
router.put('/verification-requests/:requestId', updateVerificationStatus);

module.exports = router;