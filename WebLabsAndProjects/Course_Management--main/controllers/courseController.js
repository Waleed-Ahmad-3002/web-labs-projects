// controllers/courseController.js
const Course = require('../models/Course');

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ code: 1 });
        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json(course);
    } catch (err) {
        console.error('Error fetching course:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const { code, name, department, level, schedule, seats, prerequisites } = req.body;
        
        // Check if course already exists
        const existingCourse = await Course.findOne({ code });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }
        
        const newCourse = new Course({
            code,
            name,
            department,
            level,
            schedule,
            seats,
            prerequisites: prerequisites || []
        });
        
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a course
const updateCourse = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const { name, department, level, schedule, seats, prerequisites } = req.body;
        
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Update course fields
        if (name) course.name = name;
        if (department) course.department = department;
        if (level) course.level = level;
        if (schedule) course.schedule = schedule;
        if (seats !== undefined) course.seats = seats;
        if (prerequisites) course.prerequisites = prerequisites;
        
        await course.save();
        res.json(course);
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteCourse = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Use deleteOne() or findByIdAndDelete()
        await Course.deleteOne({ _id: req.params.id }); // or use findByIdAndDelete(req.params.id)
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const incrementCourseSeat = async (req, res) => {
    try {
        const { courseCode } = req.params;
        
        console.log(`Incrementing seat for course: ${courseCode}`);
        
        // Find the course by code
        const course = await Course.findOne({ code: courseCode });
        
        if (!course) {
            console.log('Course not found');
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Increment the seats by 1
        course.seats += 1;
        
        // Save the updated course
        await course.save();
        
        console.log(`Seat incremented successfully. New seat count: ${course.seats}`);
        res.json(course);
    } catch (err) {
        console.error('Error incrementing course seat:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    incrementCourseSeat
};