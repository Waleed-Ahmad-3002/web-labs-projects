// reports.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
    getAllComplaints,
    getReportById,
    createReport,
    updateReport,
    resolveReport,
    deleteReport,
    getReportsByStudent,
    subscribeToCourse,
    updateComplaintStatus,
    deleteComplaint ,
    getComplaintById
} = require('../controllers/reportsController');

const router = express.Router();

// Protect all routes with auth middleware
router.use(auth);

router.get('/complaints/:id',  getComplaintById);

router.delete('/complaints/:id', deleteComplaint );

router.get('/complaints', auth, getAllComplaints);

router.put('/complaints/:id', updateComplaintStatus);


// Get a specific report by ID
router.get('/:id', getReportById);

// Create a new report
router.post('/', createReport);

// Update a report
router.put('/:id', updateReport);

// Mark a report as resolved (shortcut method)
router.put('/:id/resolve', resolveReport);

// Delete a report
router.delete('/:id', deleteReport);

// Get reports by student ID
router.get('/student/:studentId', getReportsByStudent);

// Subscribe to course notifications
router.post('/subscribe', subscribeToCourse);

module.exports = router;