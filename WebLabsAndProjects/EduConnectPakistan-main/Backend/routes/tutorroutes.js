const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { 
    getTutorProfile,
    updateTutorProfile,
    verifyTutor,
    applyForVerification,
    getAllTutors,
    getTutorById
  } = require('../controllers/tutorController');

  // Protected routes (require authentication)
router.use(protect);

router.get('/profile', getTutorProfile);
router.put('/profile', updateTutorProfile);
router.post('/verify', verifyTutor);
router.post('/apply', applyForVerification);
router.get('/', getAllTutors);

// Public route - get tutor by ID
router.get('/:id', getTutorById);

module.exports = router;