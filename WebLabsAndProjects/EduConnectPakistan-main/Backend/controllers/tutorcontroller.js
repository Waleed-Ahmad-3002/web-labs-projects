// controllers/tutorController.js
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const mongoose = require('mongoose');

// Get Tutor Profile
// Make sure your controller handles both id and _id
const getTutorProfile = async (req, res) => {
    try {
      const userId = req.user.id || req.user._id; // Handle both formats
      
      const tutor = await Tutor.findOne({ userId }).populate('userId', 'name email');
      
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: 'Tutor profile not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: tutor
      });
    } catch (error) {
      console.error('Error in getTutorProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tutor profile',
        error: error.message
      });
    }
  };
// Update Tutor Profile
const updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Find and update tutor profile
    const tutor = await Tutor.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating tutor profile', 
      error: error.message 
    });
  }
};

// Verify Tutor
const verifyTutor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.user._id;
    const {
      bio,
      qualifications,
      experience,
      subjects,
      hourlyRate,
      teachingPreference
    } = req.body;

    // Validate required fields
    if (!bio || !qualifications || !experience || !subjects || !hourlyRate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be provided' 
      });
    }

    // Find existing tutor profile or create new one
    let tutor = await Tutor.findOne({ userId }).session(session);

    if (tutor) {
      // Update existing profile
      tutor.bio = bio;
      tutor.qualifications = qualifications;
      tutor.experience = experience;
      tutor.subjects = subjects;
      tutor.hourlyRate = hourlyRate;
      tutor.teachingPreference = teachingPreference || 'Both';
      tutor.verificationStatus = 'pending';
      tutor.isVerified = false;
    } else {
      // Create new tutor profile
      tutor = new Tutor({
        userId,
        bio,
        qualifications,
        experience,
        subjects,
        hourlyRate,
        teachingPreference: teachingPreference || 'Both',
        verificationStatus: 'pending',
        isVerified: false
      });
    }

    // Save tutor profile
    const savedTutor = await tutor.save({ session });

    // Update user role to tutor if not already set
    if (req.user.role !== 'tutor') {
      await User.findByIdAndUpdate(
        userId, 
        { role: 'tutor' }, 
        { session }
      );
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      success: true,
      message: 'Tutor profile submitted for verification', 
      data: savedTutor 
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Tutor Verification Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during tutor verification', 
      error: error.message 
    });
  }
};
// Add this function to your tutorController.js

// Create verification request
const applyForVerification = async (req, res) => {
    try {
      const { tutorId } = req.body;
      
      // Check if a pending request already exists
      const existingRequest = await VerificationRequest.findOne({
        tutorId,
        status: 'pending'
      });
      
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending verification request'
        });
      }
      
      // Create new verification request
    const verificationRequest = new VerificationRequest({
  tutorId,
  status: 'pending',
  requestDate: new Date(),
  adminComments: '',  // Set empty string instead of undefined
  processedBy: null,  // Set null instead of undefined
  processedDate: null // Set null instead of undefined
});
      
      await verificationRequest.save();
      
      res.status(201).json({
        success: true,
        message: 'Verification request submitted successfully',
        data: verificationRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating verification request',
        error: error.message
      });
    }
  };
  
// Get all tutors
/*
const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ isVerified: true })
      .select('-__v')
      .sort({ ratingAverage: -1 });
    
    res.status(200).json({
      success: true,
      count: tutors.length,
      data: tutors
    });
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutors',
      error: error.message
    });
  }
};*/
// Get all tutors with filtering capability
const getAllTutors = async (req, res) => {
  try {
    // Extract filter parameters from query string
    const {
      subject,
      location,
      priceMin,
      priceMax,
      ratingThreshold,
    } = req.query;

    // Build filter object
    const filter = { isVerified: true };

    // Add subject filter if provided
    if (subject) {
      filter.subjects = subject;
    }

    // Add price range filter if provided
    if (priceMin !== undefined || priceMax !== undefined) {
      filter.hourlyRate = {};
      if (priceMin !== undefined) {
        filter.hourlyRate.min = { $gte: parseInt(priceMin) };
      }
      if (priceMax !== undefined) {
        filter.hourlyRate.max = { $lte: parseInt(priceMax) };
      }
    }

    // Add rating threshold filter if provided
    if (ratingThreshold) {
      filter.ratingAverage = { $gte: parseFloat(ratingThreshold) };
    }

    // Execute query with filters
    const tutors = await Tutor.find(filter)
      .select('-__v')
      .sort({ ratingAverage: -1 });

    // If location filter is provided, we need to filter after fetching
    // because location data is stored in the User model
    let filteredTutors = tutors;
    
    if (location) {
      // For location filtering, we need to check each tutor's associated user
      filteredTutors = [];
      
      for (const tutor of tutors) {
        // Get user data for this tutor
        const user = await User.findById(tutor.userId).select('city country');
        
        // Check if location matches
        if (location.toLowerCase() === 'online') {
          // Check if tutor teaches online
          if (tutor.teachingPreference === 'Online' || tutor.teachingPreference === 'Both') {
            filteredTutors.push(tutor);
          }
        } else if (user && user.city && user.city.toLowerCase() === location.toLowerCase()) {
          // Check if city matches
          filteredTutors.push(tutor);
        }
      }
    }

    res.status(200).json({
      success: true,
      count: filteredTutors.length,
      data: filteredTutors
    });
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutors',
      error: error.message
    });
  }
};
const getTutorById = async (req, res) => {
  try {
    const tutorId = req.params.id;
    
    const tutor = await Tutor.findById(tutorId);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Error fetching tutor by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutor',
      error: error.message
    });
  }
};


module.exports = {
  getTutorProfile,
  updateTutorProfile,
  verifyTutor,
  applyForVerification,
  getAllTutors,
  getTutorById
};