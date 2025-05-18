// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createReview,
  getTutorReviews,
  getStudentReviews,
  updateReview,
  deleteReview,
  respondToReview
} = require('../controllers/reviewController');

// Create a new review - for students only
router.post('/', protect, restrictTo('student'), createReview);

// Get all reviews for a tutor - public
router.get('/tutor/:tutorId', getTutorReviews);

// Get reviews created by the logged-in student
router.get('/student', protect, restrictTo('student'), getStudentReviews);

// Update a review - for students only
router.put('/:id', protect, restrictTo('student'), updateReview);

// Delete a review - for students only
router.delete('/:id', protect, restrictTo('student'), deleteReview);

// Add a response to a review - for tutors only
router.post('/:id/respond', protect, restrictTo('tutor'), respondToReview);

module.exports = router;