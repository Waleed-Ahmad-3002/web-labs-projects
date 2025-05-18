const express = require('express');
const auth = require('../middleware/auth');
const {
    getAllStudents,
    getStudentDetails,
    registerCourses,
    getRegisteredCourses,
    getCompletedCourses,
    markCourseAsCompleted,
    removeCourseFromStudent,
    updateStudentCourse,
    findCourseByCodeOrName,
    getStudentProfile,
    getCoursePrerequisites,
    subscribeToCourse,
} = require('../controllers/studentController');

const router = express.Router();

// Protect all routes with auth middleware
router.use(auth);


// Admin route to get all students
router.get('/all', getAllStudents);
//bonus task
router.post('/subscribe', subscribeToCourse);

router.get('/findByCodeOrName/:query', findCourseByCodeOrName);

router.get('/profile',getStudentProfile);

// In your student routes file
// In your course routes file
router.get('/courses/:id/prerequisites', getCoursePrerequisites);
// Get student details
router.get('/', getStudentDetails);

router.delete(
    '/:studentId/courses/:courseId',removeCourseFromStudent);

// Student unregisters their own course
//router.delete('/courses/:courseId', unregisterSpecificCourse);

// Admin unregisters a course for a specific student
// This is what your frontend is calling
//router.delete('/:studentId/courses/:courseId', adminUnregisterCourse);
router.put('/:studentId/courses/:courseId', updateStudentCourse);
// Register for courses
router.post('/register', registerCourses);

// Get registered courses
router.get('/registered', getRegisteredCourses);

// Get completed courses
router.get('/completed', getCompletedCourses);

// Mark a course as completed
router.post('/complete', markCourseAsCompleted);

module.exports = router;