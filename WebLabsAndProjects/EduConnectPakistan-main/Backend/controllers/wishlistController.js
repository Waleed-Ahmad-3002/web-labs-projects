// controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Add a tutor to student's wishlist
/*
const addToWishlist = async (req, res) => {
  try {
    const { studentId, tutorId } = req.body;
    console.log('Request to add to wishlist:', { studentId, tutorId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student or tutor ID'
      });
    }

    // Check if the entry already exists
    const existingEntry = await Wishlist.findOne({ studentId, tutorId });
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Tutor is already in wishlist'
      });
    }

    // Create wishlist entry
    const wishlistEntry = new Wishlist({
      studentId,
      tutorId,
      // Other fields will use default values
    });

    await wishlistEntry.save();

    // Find the student and update their wishlist array
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      // Even if student is not found, we'll still return success since the wishlist entry was created
    } else {
      // Make sure the student has a wishlist array
      if (!student.wishlist) {
        student.wishlist = [];
      }
      
      // Add tutorId to the wishlist array if not already present
      if (!student.wishlist.includes(tutorId)) {
        student.wishlist.push(tutorId);
        await student.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tutor added to wishlist',
      data: wishlistEntry
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist',
      error: error.message
    });
  }
};*/
// In wishlistController.js:
const addToWishlist = async (req, res) => {
    try {
      const { studentId, tutorId } = req.body;
      console.log('Request to add to wishlist:', { studentId, tutorId });
  
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tutorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student or tutor ID'
        });
      }
  
      // Check if the entry already exists
      const existingEntry = await Wishlist.findOne({ studentId, tutorId });
      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message: 'Tutor is already in wishlist'
        });
      }
  
      // Create wishlist entry
      const wishlistEntry = new Wishlist({
        studentId,
        tutorId,
      });
  
      await wishlistEntry.save();
  
      // Find the student and update their wishlist array - ADDING DEBUG LOGS
      console.log('Searching for student with ID:', studentId);
      
      // Try both direct ID and userId approaches
      let student = await Student.findById(studentId);
      
      if (!student) {
        console.log('Student not found by direct ID, trying by userId field');
        // Try to find by userId if direct ID fails
        student = await Student.findOne({ userId: studentId });
      }
      
      if (!student) {
        console.error('Student not found with either approach:', studentId);
        // Query all students to help debug
        const allStudents = await Student.find({});
        console.log('All students in DB:', allStudents.map(s => ({ _id: s._id, userId: s.userId })));
        
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      console.log('Found student:', student._id);
      
      // Make sure the student has a wishlist array
      if (!student.wishlist) {
        student.wishlist = [];
      }
      
      // Convert tutorId to string for comparison
      const tutorIdStr = tutorId.toString();
      
      // Check if tutor already in wishlist with proper string comparison
      const tutorExists = student.wishlist.some(id => id.toString() === tutorIdStr);
      
      if (!tutorExists) {
        console.log('Adding tutor to wishlist array:', tutorId);
        student.wishlist.push(tutorId);
        await student.save();
        console.log('Student saved successfully');
      } else {
        console.log('Tutor already in student wishlist array');
      }
  
      res.status(201).json({
        success: true,
        message: 'Tutor added to wishlist',
        data: wishlistEntry
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      console.error('Request body:', req.body);
      res.status(500).json({
        success: false,
        message: 'Server error adding to wishlist',
        error: error.message
      });
    }
  };

// Remove a tutor from student's wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { studentId, tutorId } = req.params;
    console.log('Request to remove from wishlist:', { studentId, tutorId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student or tutor ID'
      });
    }

    // Remove entry from Wishlist collection
    const result = await Wishlist.findOneAndDelete({ studentId, tutorId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist entry not found'
      });
    }

    // Find the student and update their wishlist array
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('Student not found when removing from wishlist:', studentId);
      // Even if student is not found, we'll still return success since the wishlist entry was deleted
    } else {
      // Make sure the student has a wishlist array
      if (student.wishlist && Array.isArray(student.wishlist)) {
        // Remove tutorId from the wishlist array
        student.wishlist = student.wishlist.filter(id => id.toString() !== tutorId.toString());
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Tutor removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from wishlist',
      error: error.message
    });
  }
};

// Check if a tutor is in student's wishlist
const checkWishlist = async (req, res) => {
  try {
    const { studentId, tutorId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student or tutor ID'
      });
    }

    // Check if the entry exists
    const wishlistEntry = await Wishlist.findOne({ studentId, tutorId });
    
    res.status(200).json({
      success: true,
      isWishlisted: !!wishlistEntry
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking wishlist',
      error: error.message
    });
  }
};

// Get all wishlisted tutors for a student
const getWishlist = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    // Get all wishlist entries for the student with tutor details
    const wishlistEntries = await Wishlist.find({ studentId })
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'username profilePicture city country'
        }
      });

    res.status(200).json({
      success: true,
      data: wishlistEntries
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting wishlist',
      error: error.message
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getWishlist
};