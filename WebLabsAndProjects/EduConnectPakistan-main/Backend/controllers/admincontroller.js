// controllers/adminController.js

const VerificationRequest = require('../models/VerificationRequest');
const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');

// Get all verification requests with basic tutor info
const getAllVerificationRequests = async (req, res) => {
  try {
    // Find all verification requests
    // Populate with basic tutor info and related user info
    const requests = await VerificationRequest.find()
      .populate({
        path: 'tutorId',
        select: 'userId bio',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ requestDate: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verification requests',
      error: error.message
    });
  }
};

// Get detailed info about a single tutor (for preview)
const getTutorForVerification = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const tutor = await Tutor.findById(tutorId)
      .populate('userId', 'name email phone city country');
    
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
    console.error('Error fetching tutor for verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutor details',
      error: error.message
    });
  }
};

// Update verification request status
const updateVerificationStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminComments } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const request = await VerificationRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }
    
    // Update request
    request.status = status;
    request.adminComments = adminComments || '';
    request.processedBy = req.user.id;
    request.processedDate = Date.now();
    
    await request.save();
    
    // If approved, update tutor verification status
    if (status === 'approved') {
      await Tutor.findByIdAndUpdate(request.tutorId, {
        verificationStatus: 'approved',
        isVerified: true
      });
    } else if (status === 'rejected') {
      await Tutor.findByIdAndUpdate(request.tutorId, {
        verificationStatus: 'rejected',
        isVerified: false
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Verification request ${status}`,
      data: request
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
};

module.exports = {
  getAllVerificationRequests,
  getTutorForVerification,
  updateVerificationStatus
};