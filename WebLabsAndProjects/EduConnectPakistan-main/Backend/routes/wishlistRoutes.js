// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, checkWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all wishlist routes
router.use(protect);

// Add a tutor to wishlist
router.post('/', addToWishlist);

// Remove a tutor from wishlist
router.delete('/:studentId/:tutorId', removeFromWishlist);

// Check if a tutor is in a student's wishlist
router.get('/check/:studentId/:tutorId', checkWishlist);

// Get all wishlisted tutors for a student
router.get('/:studentId', getWishlist);

router.get('/wishlist/:studentId', getWishlist);

module.exports = router;

// Don't forget to include this in your main app.js or server.js file:
// app.use('/api/wishlist', require('./routes/wishlistRoutes'));