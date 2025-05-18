// routes/availabilityRoutes.js
const express = require('express');
const router = express.Router();
const {
        getAvailabilities,
        createAvailability,
        deleteAvailability,
        updateAvailability,
        getTutorAvailability
       
} = 
require('../controllers/availabilitycontroller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/:tutorId', getTutorAvailability);
// All routes require authentication
router.use(protect);

// All routes require tutor role
router.use(restrictTo('tutor'));

// GET all availabilities for the logged-in tutor
router.get('/', getAvailabilities);

// routes/availabilityRoutes.js





// POST create a new availability
router.post('/', createAvailability);

// DELETE remove an availability
router.delete('/:id', deleteAvailability);

// PUT update an availability
router.put('/:id', updateAvailability);

module.exports = router;