const Student = require('../models/Student');
const Course = require('../models/Course');
const Report = require('../models/Reports');

// Get all students
const getAllStudents = async (req, res) => {
    try {
        // Use populate to get the course names
        const students = await Student.find()
            .populate('registeredCourses', 'name') // Only get the name field from Course collection
            .populate('completedCourses', 'name')  // Only get the name field from Course collection
            .sort({ name: 1 });
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get student details
const getStudentDetails = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .populate('completedCourses', 'code name')
            .populate('registeredCourses', 'code name');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        console.error('Error fetching student details:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const registerCourses = async (req, res) => {
    try {
        // Add debug logs
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);
        
        // Get username from request body
        const username = req.body.username;
        
        if (!username) {
            return res.status(400).json({ message: 'Username not provided in request body' });
        }
        
        console.log('Looking up student with username:', username);
        
        // First, just check if the student exists
        const studentExists = await Student.exists({ username });
        
        if (!studentExists) {
            return res.status(404).json({ message: 'Student not found for username: ' + username });
        }
        
        const { courses } = req.body;
        console.log('Course codes to register:', courses);
        
        if (!Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ message: 'No courses provided or invalid format' });
        }
        
        // Validate courses and get their ObjectIds
        const validCourses = await Course.find({ code: { $in: courses } });
        console.log('Valid courses found:', validCourses.length);
        
        if (validCourses.length !== courses.length) {
            const foundCodes = validCourses.map(c => c.code);
            const missingCodes = courses.filter(code => !foundCodes.includes(code));
            return res.status(400).json({ 
                message: 'Invalid course codes provided',
                missingCodes
            });
        }
        
        // Get the course IDs
        const courseIds = validCourses.map(course => course._id);
        
        // Get the student's current registered courses (to calculate the difference later)
        const studentBefore = await Student.findOne({ username }, { registeredCourses: 1 });
        const registeredCoursesBefore = studentBefore.registeredCourses || [];
        const registeredCourseIdsBeforeSet = new Set(registeredCoursesBefore.map(id => id.toString()));
        
        // Use an atomic update operation with $addToSet to add courses while avoiding duplicates
        // This won't have version conflicts because we're using a direct update operation
        const result = await Student.findOneAndUpdate(
            { username },
            { $addToSet: { registeredCourses: { $each: courseIds } } },
            { new: true, upsert: false }
        );
        
        if (!result) {
            return res.status(404).json({ message: 'Failed to update student record' });
        }
        
        // Calculate which courses were actually added (to avoid incrementing enrolledStudents multiple times)
        const newlyRegisteredCourseIds = courseIds.filter(id => 
            !registeredCourseIdsBeforeSet.has(id.toString())
        );
        
        console.log(`Added ${newlyRegisteredCourseIds.length} new courses`);
        
        // Update enrolledStudents count for newly added courses only
        if (newlyRegisteredCourseIds.length > 0) {
            try {
                await Course.updateMany(
                    { _id: { $in: newlyRegisteredCourseIds } },
                    { $inc: { enrolledStudents: 1 } }
                );
            } catch (updateError) {
                console.error('Error updating course enrollment counts:', updateError);
                // Continue with the response even if enrollment count update fails
            }
        }
        
        res.status(200).json({ 
            message: `Success! Registered ${newlyRegisteredCourseIds.length} new course(s). Total registered courses: ${result.registeredCourses.length}`,
            newlyRegistered: newlyRegisteredCourseIds.length,
            totalRegistered: result.registeredCourses.length
        });
    } catch (err) {
        console.error('Error registering courses:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};
// Get registered courses
/*
const getRegisteredCourses = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .populate('registeredCourses', 'code name schedule seats enrolledStudents');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student.registeredCourses);
    } catch (err) {
        console.error('Error fetching registered courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};*/
const getRegisteredCourses = async (req, res) => {
    try {
        console.log('User from token:', req.user);
        
        // First try by ID if that's available
        let student;
        
        if (req.user.id) {
            console.log('Looking up student by ID:', req.user.id);
            student = await Student.findById(req.user.id)
                .populate('registeredCourses', 'code name schedule seats enrolledStudents');
        }
        
        // If not found by ID, try by username
        if (!student && req.user.username) {
            console.log('Looking up student by username:', req.user.username);
            student = await Student.findOne({ username: req.user.username })
                .populate('registeredCourses', 'code name schedule seats enrolledStudents');
        }
        
        if (!student) {
            console.log('No student found with provided credentials');
            return res.status(404).json({ message: 'Student not found' });
        }
        
        console.log(`Found ${student.registeredCourses.length} registered courses for student`);
        res.json(student.registeredCourses);
    } catch (err) {
        console.error('Error fetching registered courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get completed courses
const getCompletedCourses = async (req, res) => {
    try {
        // First try by ID if that's available
        let student;
        
        if (req.user.id) {
            student = await Student.findById(req.user.id)
                .populate('completedCourses', 'code name');
        }
        
        // If not found by ID, try by username
        if (!student && req.user.username) {
            student = await Student.findOne({ username: req.user.username })
                .populate('completedCourses', 'code name');
        }
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student.completedCourses);
    } catch (err) {
        console.error('Error fetching completed courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a course as completed
const markCourseAsCompleted = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { courseCode } = req.body;

        // Check if the course is registered
        if (!student.registeredCourses.includes(courseCode)) {
            return res.status(400).json({ message: 'Course not registered' });
        }

        // Check if the course is already marked as completed
        if (student.completedCourses.includes(courseCode)) {
            return res.status(400).json({ message: 'Course already marked as completed' });
        }

        // Add the course to completed courses
        student.completedCourses.push(courseCode);
        await student.save();

        res.json({ message: 'Course marked as completed successfully' });
    } catch (err) {
        console.error('Error marking course as completed:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add this function to your existing student controller
const removeCourseFromStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        
        console.log(`Removing course ${courseId} from student ${studentId}`);
        
        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Check if the course exists in the student's registeredCourses
        const courseIndex = student.registeredCourses.findIndex(
            course => course.toString() === courseId
        );
        
        if (courseIndex === -1) {
            return res.status(404).json({ message: 'Course not found in student\'s registered courses' });
        }
        
        // Remove the course from the student's registeredCourses array
        student.registeredCourses.splice(courseIndex, 1);
        
        // Save the updated student document
        await student.save();
        
        // Find the course to update the enrolledStudents count
        const course = await Course.findById(courseId);
        if (course) {
            // Decrement the enrolledStudents count
            if (course.enrolledStudents > 0) {
                course.enrolledStudents -= 1;
                await course.save();
            }
        }
        
        res.status(200).json({ 
            message: 'Course removed successfully',
            student: {
                _id: student._id,
                username: student.username,
                registeredCourses: student.registeredCourses
            }
        });
    } catch (error) {
        console.error('Error removing course from student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// BACKEND - Controller function to update a student's course

// Add this to your admin.js controller file

const updateStudentCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const { newCourseId } = req.body;
        
        console.log(`Updating course for student ${studentId}: ${courseId} -> ${newCourseId}`);
        
        // Validate the new course ID
        if (!newCourseId) {
            return res.status(400).json({ message: 'New course ID is required' });
        }
        
        // Check if the new course exists
        const newCourse = await Course.findById(newCourseId);
        if (!newCourse) {
            return res.status(404).json({ message: 'New course not found' });
        }
        
        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Check if the old course exists in the student's registeredCourses
        const courseIndex = student.registeredCourses.findIndex(
            course => course.toString() === courseId
        );
        
        if (courseIndex === -1) {
            return res.status(404).json({ message: 'Course not found in student\'s registered courses' });
        }
        
        // Check if the student is already registered for the new course
        if (student.registeredCourses.some(course => course.toString() === newCourseId)) {
            return res.status(400).json({ message: 'Student is already registered for the new course' });
        }
        
        // Update the course in the student's registeredCourses array
        student.registeredCourses[courseIndex] = newCourseId;
        
        // Save the updated student document
        await student.save();
        
        // Update enrolledStudents count for both courses
        const oldCourse = await Course.findById(courseId);
        if (oldCourse && oldCourse.enrolledStudents > 0) {
            oldCourse.enrolledStudents -= 1;
            await oldCourse.save();
        }
        
        newCourse.enrolledStudents += 1;
        await newCourse.save();
        
        // Return the updated student information
        const updatedStudent = await Student.findById(studentId)
            .populate('registeredCourses')
            .populate('completedCourses');
        
        res.status(200).json({
            message: 'Course updated successfully',
            student: {
                _id: updatedStudent._id,
                username: updatedStudent.username,
                registeredCourses: updatedStudent.registeredCourses
            }
        });
    } catch (error) {
        console.error('Error updating student course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// In your course controller file
const findCourseByCodeOrName = async (req, res) => {
    try {
        const query = req.params.query;
        
        // Try to find the course by code or name
        const course = await Course.findOne({
            $or: [
                { code: { $regex: new RegExp(query, 'i') } },
                { name: { $regex: new RegExp(query, 'i') } }
            ]
        });
        
        if (!course) {
            return res.status(404).json({ message: `Course not found with code or name: ${query}` });
        }
        
        res.json(course);
    } catch (err) {
        console.error('Error finding course by code or name:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// In your student controller file
/*
const getStudentProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have user ID in the auth token
        
        const student = await Student.findOne({ username: req.user.username })
            .populate('completedCourses', '_id name code')
            .populate('registeredCourses', '_id name code');
            
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        
        res.json(student);
    } catch (err) {
        console.error('Error fetching student profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
*/
const getStudentProfile = async (req, res) => {
    try {
        // Use req.user.username instead of req.user.id
        const username = req.user.username;

        // Find the student by username and populate the required fields
        const student = await Student.findOne({ username })
            .populate('completedCourses', '_id name code')
            .populate('registeredCourses', '_id name code');

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.json(student);
    } catch (err) {
        console.error('Error fetching student profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get course prerequisites
const getCoursePrerequisites = async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // If course has no prerequisites
        if (!course.prerequisites || course.prerequisites.length === 0) {
            return res.json({ prerequisites: [] });
        }
        
        // Find all prerequisite courses
        const prerequisiteCourses = [];
        
        for (const prereqCode of course.prerequisites) {
            const prereq = await Course.findOne({
                $or: [
                    { code: prereqCode },
                    { name: prereqCode }
                ]
            });
            
            if (prereq) {
                prerequisiteCourses.push(prereq);
            }
        }
        
        res.json({ prerequisites: prerequisiteCourses });
    } catch (err) {
        console.error('Error getting course prerequisites:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
/*
const subscribeToCourse = async (req, res) => {
    try {
        console.log('Subscribe request body:', req.body);
        
        const { username, courseCode } = req.body;
        
        if (!username || !courseCode) {
            return res.status(400).json({ message: 'Username and course code are required' });
        }
        
        // Find the student by username to get their ID
        const student = await Student.findOne({ username });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Check if there's already a subscription for this student and course
        const existingReport = await Report.findOne({
            student: student._id, // Using the actual student ObjectId here
            issue: `Unable to Register Course: ${courseCode}`,
            status: { $in: ['open', 'in-progress'] }
        });
        
        if (existingReport) {
            return res.status(400).json({ 
                message: 'You are already subscribed to this course',
                reportId: existingReport._id
            });
        }
        
        // Create a new report (subscription)
        const newReport = new Report({
            student: student._id, // Using the actual student ObjectId here
            issue: `Unable to Register Course: ${courseCode}`,
            status: 'open'
        });
        
        await newReport.save();
        
        res.status(201).json({
            message: `Successfully subscribed to ${courseCode}`,
            reportId: newReport._id
        });
        
    } catch (err) {
        console.error('Error subscribing to course:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};*/
const pendingSubscriptions = new Set();

async function subscribeToCourse(courseCode) {
    try {
        // Check if we're already processing a subscription for this course
        if (pendingSubscriptions.has(courseCode)) {
            console.log('Subscription already in progress for:', courseCode);
            return;
        }
        
        // Add to pending set
        pendingSubscriptions.add(courseCode);
        
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('userName');
        
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        if (!username) {
            throw new Error('Username not found. Please log in again.');
        }
        
        console.log('Subscribing to course:', courseCode);
        
        // Disable button immediately to prevent multiple clicks
        const subscribeButton = document.querySelector(`.subscribe-btn[data-code="${courseCode}"]`);
        if (subscribeButton) {
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Subscribing...';
        }
        
        const response = await fetch('http://localhost:3000/api/reports/subscribe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                courseCode: courseCode
            })
        });
        
        const responseData = await response.json();
        console.log('Subscription response:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to subscribe to course');
        }
        
        alert(`Successfully subscribed to ${courseCode}. You will be notified when a spot becomes available.`);
        
        // Update the button to show subscription status
        if (subscribeButton) {
            subscribeButton.textContent = 'Subscribed';
            subscribeButton.disabled = true;
            subscribeButton.classList.add('subscribed');
        }
    } catch (err) {
        console.error('Error subscribing to course:', err);
        alert(`Error: ${err.message}`);
        
        // Reset button if there was an error
        const subscribeButton = document.querySelector(`.subscribe-btn[data-code="${courseCode}"]`);
        if (subscribeButton) {
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Subscribe';
        }
    } finally {
        // Remove from pending set regardless of success/failure
        pendingSubscriptions.delete(courseCode);
    }
}





module.exports = {
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
};