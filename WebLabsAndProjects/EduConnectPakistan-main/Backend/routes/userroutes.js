const express = require('express');
const router = express.Router();
const {getUserProfile,updateUserProfile,uploadProfileImage,getUserById} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
// Get user profile (protected route)
router.get('/profile',  getUserProfile);

// Update user profile (protected route)
router.put('/profile',  updateUserProfile);

router.post('/upload-profile-image',uploadProfileImage);

router.get('/:id', getUserById);

module.exports = router;