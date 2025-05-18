// routes/courseRoutes.js
const express = require('express');
const { 
    getAllCourses, 
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse ,
    incrementCourseSeat
} = require('../controllers/courseController');
const auth = require('../middleware/auth');

const router = express.Router();

// Protect all routes with auth middleware
router.use(auth);

router.put('/:courseCode/increment-seat', incrementCourseSeat);
// Get all courses
router.get('/', getAllCourses);

// Get a specific course
router.get('/:id', getCourseById);

// Create a new course
router.post('/', createCourse);

// Update a course
router.put('/:id', updateCourse);

// Delete a course
router.delete('/:id', deleteCourse);

module.exports = router;