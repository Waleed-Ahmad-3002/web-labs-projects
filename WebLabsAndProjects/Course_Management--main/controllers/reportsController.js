// reports.controller.js
const Student = require('../models/Student');
const Course = require('../models/Course');
const Report = require('../models/Reports');
// Get all complaints with student names
const getAllComplaints = async (req, res) => {
    try {
        // Use populate to get the student names
        const complaints = await Report.find()
            .populate('student', 'username name') // Get both username and name from Student collection
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.json(complaints);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get a specific report by ID
const getReportById = async (req, res) => {
    try {
        const reportId = req.params.id;
        
        const report = await Report.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json(report);
    } catch (err) {
        console.error('Error fetching report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new report/complaint
const createReport = async (req, res) => {
    try {
        const { issue } = req.body;
        const username = req.user.username;
        
        // Find the student by username
        const student = await Student.findOne({ username });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Create new report
        const newReport = new Report({
            student: student._id,
            issue,
            status: 'open'
        });
        
        await newReport.save();
        
        res.status(201).json({ 
            message: 'Report created successfully',
            report: newReport
        });
    } catch (err) {
        console.error('Error creating report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a report
const updateReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { status, response } = req.body;
        
        // Find and update the report
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { 
                status, 
                response,
                ...(status === 'resolved' && { resolvedAt: Date.now() })
            },
            { new: true }
        );
        
        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ 
            message: 'Report updated successfully',
            report: updatedReport
        });
    } catch (err) {
        console.error('Error updating report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a report as resolved (shortcut method)
const resolveReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        
        // Find and update the report
        const resolvedReport = await Report.findByIdAndUpdate(
            reportId,
            { 
                status: 'resolved',
                resolvedAt: Date.now()
            },
            { new: true }
        );
        
        if (!resolvedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ 
            message: 'Report resolved successfully',
            report: resolvedReport
        });
    } catch (err) {
        console.error('Error resolving report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a report
const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        
        const deletedReport = await Report.findByIdAndDelete(reportId);
        
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error('Error deleting report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get reports by student ID
const getReportsByStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        
        const reports = await Report.find({ student: studentId })
            .sort({ createdAt: -1 });
        
        res.json(reports);
    } catch (err) {
        console.error('Error fetching student reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Subscribe to course notifications (for when a course has available seats)
const subscribeToCourse = async (req, res) => {
    try {
        const { username, courseCode } = req.body;
        
        // Find the student by username
        const student = await Student.findOne({ username });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Find the course by code
        const course = await Course.findOne({ code: courseCode });
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Check if subscription already exists
        const existingSubscription = await Report.findOne({
            student: student._id,
            issue: `Course Notification: ${courseCode}`,
            status: 'open'
        });
        
        if (existingSubscription) {
            return res.status(400).json({ message: 'Already subscribed to this course' });
        }
        
        // Create new subscription report
        const newSubscription = new Report({
            student: student._id,
            issue: `Course Notification: ${courseCode}`,
            status: 'open'
        });
        
        await newSubscription.save();
        
        res.status(201).json({ 
            message: 'Subscription created successfully',
            subscription: newSubscription
        });
    } catch (err) {
        console.error('Error creating subscription:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update your existing updateComplaintStatus controller method
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedComplaint = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('student'); // Make sure to populate student to get the ID
        
        if (!updatedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        
        res.json(updatedComplaint);
    } catch (err) {
        console.error('Error updating complaint:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Attempting to delete complaint with ID: ${id}`);
        
        // First check if the complaint exists
        const complaint = await Report.findById(id);
        
        if (!complaint) {
            console.log(`Complaint with ID ${id} not found`);
            return res.status(404).json({ message: 'Complaint not found' });
        }
        
        // Delete the complaint
        await Report.findByIdAndDelete(id);
        
        console.log(`Successfully deleted complaint with ID: ${id}`);
        res.json({ message: 'Complaint deleted successfully' });
    } catch (err) {
        console.error('Error deleting complaint:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single complaint by ID
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const complaint = await Report.findById(id)
            .populate('student', '_id name'); // Populate student info
        
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        
        res.json(complaint);
    } catch (err) {
        console.error('Error fetching complaint:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
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
};