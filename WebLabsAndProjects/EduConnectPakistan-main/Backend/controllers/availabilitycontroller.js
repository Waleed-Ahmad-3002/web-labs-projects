// controllers/availabilityController.js
const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');

// Helper function to validate time format (HH:MM)
const isValidTimeFormat = (time) => {
  const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(time);
};

// Helper to check if time ranges overlap
const doTimesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Get all availabilities for the currently logged-in tutor
const getAvailabilities = async (req, res) => {
  try {
    // Ensure the user is a tutor
    if (req.user.role !== 'tutor') {
      return res.status(403).json({
        status: 'error',
        message: 'Only tutors can access availability information'
      });
    }

    // Find the tutor profile associated with this user
    const tutorProfile = await Tutor.findOne({ userId: req.user._id });
    
    if (!tutorProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Tutor profile not found'
      });
    }

    // Get all availabilities for this tutor
    const availabilities = await Availability.find({ tutorId: tutorProfile._id })
      .sort({ dayOfWeek: 1, startTime: 1 }); // Sort by day, then by start time
    
    res.status(200).json({
      status: 'success',
      data: availabilities
    });
  } catch (error) {
    console.error('Error in getAvailabilities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve availabilities',
      error: error.message
    });
  }
};

// Create a new availability slot
const createAvailability = async (req, res) => {
  try {
    // Extract availability data from request body
    const { 
      dayOfWeek, 
      startTime, 
      endTime, 
      isRecurring, 
      specificDate 
    } = req.body;

    // Validation
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid time format. Please use HH:MM format (24h).'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Start time must be before end time'
      });
    }

    // Validate dayOfWeek for recurring availabilities
    if (isRecurring) {
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        });
      }
    } else {
      // For non-recurring, validate date
      if (!specificDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Specific date is required for non-recurring availability'
        });
      }
      
      const dateObj = new Date(specificDate);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }
      
      // Ensure the date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateObj < today) {
        return res.status(400).json({
          status: 'error',
          message: 'Availability date cannot be in the past'
        });
      }
    }

    // Find the tutor profile
    const tutorProfile = await Tutor.findOne({ userId: req.user._id });
    
    if (!tutorProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Tutor profile not found'
      });
    }

    // Check for overlapping availability
    let overlapQuery;
    
    if (isRecurring) {
      // For recurring availability, check same day of week
      overlapQuery = {
        tutorId: tutorProfile._id,
        isRecurring: true,
        dayOfWeek: dayOfWeek
      };
    } else {
      // For specific date, check that exact date
      const dateObj = new Date(specificDate);
      dateObj.setHours(0, 0, 0, 0);
      
      // Find availabilities for the same specific date
      overlapQuery = {
        tutorId: tutorProfile._id,
        isRecurring: false,
        specificDate: {
          $gte: dateObj,
          $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      };
    }
    
    const existingAvailabilities = await Availability.find(overlapQuery);
    
    // Check each existing availability for time overlap
    for (const existing of existingAvailabilities) {
      if (doTimesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        return res.status(400).json({
          status: 'error',
          message: 'This availability overlaps with an existing time slot'
        });
      }
    }

    // Create the new availability
    const newAvailability = new Availability({
      tutorId: tutorProfile._id,
      dayOfWeek: isRecurring ? dayOfWeek : new Date(specificDate).getDay(),
      startTime,
      endTime,
      isRecurring,
      specificDate: isRecurring ? null : specificDate
    });

    await newAvailability.save();

    res.status(201).json({
      status: 'success',
      message: 'Availability created successfully',
      data: newAvailability
    });
  } catch (error) {
    console.error('Error in createAvailability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create availability',
      error: error.message
    });
  }
};

// Delete an availability slot
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid availability ID'
      });
    }

    // Find the tutor profile
    const tutorProfile = await Tutor.findOne({ userId: req.user._id });
    
    if (!tutorProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Tutor profile not found'
      });
    }

    // Find the availability and ensure it belongs to this tutor
    const availability = await Availability.findOne({
      _id: id,
      tutorId: tutorProfile._id
    });

    if (!availability) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability not found or you do not have permission to delete it'
      });
    }

    // Delete the availability
    await Availability.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAvailability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete availability',
      error: error.message
    });
  }
};

// Update an availability slot
const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      dayOfWeek, 
      startTime, 
      endTime, 
      isRecurring, 
      specificDate 
    } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid availability ID'
      });
    }

    // Validate time format
    if (startTime && endTime) {
      if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid time format. Please use HH:MM format (24h).'
        });
      }

      if (startTime >= endTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Start time must be before end time'
        });
      }
    }

    // Find the tutor profile
    const tutorProfile = await Tutor.findOne({ userId: req.user._id });
    
    if (!tutorProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Tutor profile not found'
      });
    }

    // Find the availability and ensure it belongs to this tutor
    const availability = await Availability.findOne({
      _id: id,
      tutorId: tutorProfile._id
    });

    if (!availability) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability not found or you do not have permission to update it'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (dayOfWeek !== undefined && isRecurring) {
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        });
      }
      updateData.dayOfWeek = dayOfWeek;
    }
    
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    
    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring;
      
      if (!isRecurring && specificDate) {
        const dateObj = new Date(specificDate);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid date format'
          });
        }
        
        // Ensure the date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateObj < today) {
          return res.status(400).json({
            status: 'error',
            message: 'Availability date cannot be in the past'
          });
        }
        
        updateData.specificDate = specificDate;
        updateData.dayOfWeek = dateObj.getDay(); // Update day of week based on the specific date
      } else if (isRecurring) {
        updateData.specificDate = null;
      }
    }

    // Update the availability
    const updatedAvailability = await Availability.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Availability updated successfully',
      data: updatedAvailability
    });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

// controllers/availabilityController.js (additional function)

// Get public availability for a specific tutor

const getTutorAvailability = async (req, res) => {
    try {
      const { tutorId } = req.params;
      
      
      // Validate tutorId
      if (!tutorId) {
        return res.status(400).json({
          status: 'error',
          message: 'Tutor ID is required'
        });
      }
      
      // First, check if this tutor exists and is verified
      const tutor = await Tutor.findById(tutorId);
      
      if (!tutor) {
        return res.status(404).json({
          status: 'error',
          message: 'Tutor not found'
        });
      }
      
      if (tutor.verificationStatus !== 'approved') {
        return res.status(403).json({
          status: 'error',
          message: 'This tutor is not verified yet'
        });
      }
      
      // Get all availabilities for this tutor
      const availabilities = await Availability.find({ tutorId })
        .sort({ dayOfWeek: 1, startTime: 1 }); // Sort by day, then by start time
        
      res.status(200).json({
        status: 'success',
        data: availabilities
      });
    } catch (error) {
      console.error('Error in getTutorAvailability:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve tutor availabilities',
        error: error.message
      });
    }
  };

  
// controllers/availabilityController.js

// Add this new method




module.exports = {
    getAvailabilities,
    createAvailability,
    deleteAvailability,
    updateAvailability,
    getTutorAvailability
   
};