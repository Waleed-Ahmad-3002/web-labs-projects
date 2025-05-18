// controllers/sessionController.js
const Session = require('../models/Session');
const Tutor = require('../models/Tutor');

// Create a new session booking
const createSession = async (req, res) => {
  try {
    const {
      tutorId,
      studentId, // Accept studentId from request body
      subject,
      sessionType,
      date,
      startTime,
      endTime,
      location,
      hourlyRate
    } = req.body;
    
    // Get student ID from authenticated user OR from request body
    const actualStudentId = studentId || (req.user && req.user.profileId);
    
    if (!actualStudentId || !tutorId) {
      return res.status(400).json({
        message: 'Student ID and Tutor ID are required',
        status: 'error'
      });
    }
    
    // Parse times for comparison
    const startTimeParts = startTime.split(':').map(Number);
    const endTimeParts = endTime.split(':').map(Number);
        
    const startMinutes = startTimeParts[0] * 60 + startTimeParts[1];
    const endMinutes = endTimeParts[0] * 60 + endTimeParts[1];
        
    const duration = endMinutes - startMinutes;

    // Format the date as YYYY-MM-DD for query
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Check for existing sessions that overlap with the requested time slot
    // and have status 'requested', 'confirmed', or 'no_show'
    const existingSessions = await Session.find({
      tutorId,
      date: { $eq: new Date(formattedDate) },
      $or: [
        // Case 1: Start time of existing session falls within new session time
        {
          startTime: {
            $gte: startTime,
            $lt: endTime
          }
        },
        // Case 2: End time of existing session falls within new session time
        {
          endTime: {
            $gt: startTime,
            $lte: endTime
          }
        },
        // Case 3: Existing session completely encompasses new session
        {
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ],
      // Only include sessions with these statuses
      status: { $in: ['requested', 'confirmed', 'no_show'] }
    });

    // If there's an existing session in this time slot with relevant status, return an error
    if (existingSessions.length > 0) {
      return res.status(409).json({
        message: 'This time slot is already booked. Please select another time.',
        status: 'error',
        conflict: true
      });
    }
    
    // Create a default meeting link for online sessions
    const meetingLink = sessionType === 'Online'
      ? 'https://zoom.us/j/defaultlink'
      : null;
    
    // Create new session
    const session = new Session({
      studentId: actualStudentId, // Use the resolved student ID
      tutorId,
      subject,
      topicDescription: null, // Default as specified
      sessionType,
      location: sessionType === 'In-person' ? location : null,
      meetingLink,
      date: new Date(date),
      startTime,
      endTime,
      duration: duration > 0 ? duration : 60, // Default to a 60-minute session if calculation fails
      price: hourlyRate, // Default as specified
      status: 'requested',
      paymentStatus: 'pending'
    });
    
    await session.save();
    
    res.status(201).json({
      message: 'Session booked successfully',
      status: 'success',
      data: session
    });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({
      message: 'Server error during session booking',
      error: error.message,
      status: 'error'
    });
  }
};

const getSessionsByTutorAndDate = async (req, res) => {
    try {
      const { tutorId, date } = req.params;
      
      // Update to also filter by statuses that block new bookings
      const sessions = await Session.find({
        tutorId,
        date: new Date(date),
        status: { $in: ['requested', 'confirmed', 'no_show'] }
      });
      
      res.status(200).json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({
        message: 'Server error while fetching sessions',
        error: error.message,
        status: 'error'
      });
    }
};
  
  // Then modify your generateTimeSlots function to exclude booked slots
  // Get all sessions for a tutor with optional filters
  /*
  const getTutorSessions = async (req, res) => {
    try {
      const { tutorId } = req.params;
      const { status, dateFrom, dateTo } = req.query;
      
      // Build query object
      const query = { tutorId };
      
      // Add status filter if provided
      if (status) {
        query.status = status;
      }
      
      // Add date range filter if provided
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) {
          query.date.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.date.$lte = new Date(dateTo);
        }
      }
      
      // Find sessions and populate student information
      const sessions = await Session.find(query)
        .populate('studentId', 'username email profilePicture')
        .sort({ date: 1, startTime: 1 }) // Sort by date and time
        .exec();
      
      res.status(200).json({
        status: 'success',
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      console.error('Error fetching tutor sessions:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve sessions',
        error: error.message
      });
    }
  };*/
  
  // Get pending session requests for a tutor
  /*
  const getPendingRequests = async (req, res) => {
    try {
      const { tutorId } = req.params;
      
      const pendingRequests = await Session.find({
        tutorId,
        status: 'requested'
      })
        .populate('studentId', 'username email profilePicture')
        .sort({ date: 1, startTime: 1 })
        .exec();
      
      res.status(200).json({
        status: 'success',
        count: pendingRequests.length,
        data: pendingRequests
      });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve pending requests',
        error: error.message
      });
    }
  };*/
  // In getTutorSessions and getPendingRequests controllers
const getTutorSessions = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { status, dateFrom, dateTo } = req.query;
    
    // Build query object
    const query = { tutorId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Find sessions and populate student information with user details
    const sessions = await Session.find(query)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username email' // Select the user fields you need
        }
      })
      .sort({ date: 1, startTime: 1 })
      .exec();
    
    res.status(200).json({
      status: 'success',
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error.message
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const pendingRequests = await Session.find({
      tutorId,
      status: 'requested'
    })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username email'
        }
      })
      .sort({ date: 1, startTime: 1 })
      .exec();
    
    res.status(200).json({
      status: 'success',
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve pending requests',
      error: error.message
    });
  }
};
  
  // Update session status (confirm or cancel)
  /*
  const updateSessionStatus = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { status, cancellationReason } = req.body;
      
      // Validate status
      if (!['confirmed', 'cancelled_by_tutor', 'completed'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be "confirmed", "cancelled_by_tutor" or "completed"'
        });
      }
      
      // If cancelling, require a reason
      if (status === 'cancelled_by_tutor' && !cancellationReason) {
        return res.status(400).json({
          status: 'error',
          message: 'Cancellation reason is required when cancelling a session'
        });
      }
      
      // Find and update session
      const updateData = {
        status,
        updatedAt: Date.now()
      };
      
      // Add cancellation reason if provided
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
      
      const session = await Session.findByIdAndUpdate(
        sessionId,
        updateData,
        { new: true, runValidators: true }
      ).populate('studentId', 'username email');
      
      if (!session) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }
      
      const statusMessages = {
        confirmed: 'Session confirmed successfully',
        cancelled_by_tutor: 'Session cancelled successfully',
        completed: 'Session marked as completed successfully'
      };
      
      res.status(200).json({
        status: 'success',
        message: statusMessages[status],
        data: session
      });
      
      // TODO: Add notification to student about session status change
      
    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update session status',
        error: error.message
      });
    }
  };*/
  // Update session status (confirm or cancel)
const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, cancellationReason } = req.body;
    
    // Validate status
    if (!['confirmed', 'cancelled_by_tutor', 'completed','cancelled_by_student'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be "confirmed", "cancelled_by_tutor" or "completed"'
      });
    }
    
    // If cancelling, require a reason
    if (status === 'cancelled_by_tutor' && !cancellationReason) {
      return res.status(400).json({
        status: 'error',
        message: 'Cancellation reason is required when cancelling a session'
      });
    }
    
    // Find and update session
    const updateData = {
      status,
      updatedAt: Date.now()
    };
    
    // Add cancellation reason if provided
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }
    
    const session = await Session.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('studentId', 'username email');
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // If status is being updated to 'completed', increment tutor's totalSessions
    if (status === 'completed') {
      try {
        await Tutor.findByIdAndUpdate(
          session.tutorId,
          { $inc: { totalSessions: 1 } }
        );
      } catch (tutorError) {
        console.error('Error updating tutor total sessions:', tutorError);
        // Continue with the response even if totalSessions update fails
      }
    }
    
    const statusMessages = {
      confirmed: 'Session confirmed successfully',
      cancelled_by_tutor: 'Session cancelled successfully',
      completed: 'Session marked as completed successfully'
    };
    
    res.status(200).json({
      status: 'success',
      message: statusMessages[status],
      data: session
    });
    
    // TODO: Add notification to student about session status change
    
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update session status',
      error: error.message
    });
  }
};
  
  // Get session details by ID
  const getSessionById = async (req, res) => {
    try {
      const { sessionId } = req.params;
      /*
      const session = await Session.findById(sessionId)
        .populate('studentId', 'username email profilePicture')
        .exec();*/
        const sessions = await Session.find(query)
  .populate({
    path: 'tutorId',
    select: 'userId', // Include any other tutor fields you need
    populate: {
      path: 'userId',
      select: 'username email' // Select the user fields you need
    }
  })
  .sort({ date: 1, startTime: 1 })
  .exec();
      
      if (!session) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      console.error('Error fetching session details:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve session details',
        error: error.message
      });
    }
  };
  // Add these new methods to your sessionController.js

// Get all sessions for a student
/*
const getStudentSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, dateFrom, dateTo } = req.query;
    
    // Build query object
    const query = { studentId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Add payment status filter for pending payments
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    
    // Find sessions and populate tutor information
    const sessions = await Session.find(query)
      .populate('tutorId', 'username email profilePicture')
      .sort({ date: 1, startTime: 1 })
      .exec();
    
    res.status(200).json({
      status: 'success',
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error.message
    });
  }
};*/
const getStudentSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, dateFrom, dateTo } = req.query;
    
    // Build query object
    const query = { studentId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Add payment status filter for pending payments
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    
    // Find sessions and populate tutor information with user details
    const sessions = await Session.find(query)
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'username email' // Select the user fields you need
        }
      })
      .sort({ date: 1, startTime: 1 })
      .exec();
    
    res.status(200).json({
      status: 'success',
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error.message
    });
  }
};

// Update session payment status
// At the top of sessionController.js


// Then modify your updatePaymentStatus function:
const updatePaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { paymentStatus } = req.body;
    
    // Validate payment status
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment status'
      });
    }
    
    // Find and update session
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { 
        paymentStatus,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('tutorId', 'username email');
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Only update tutor earnings if payment is being marked as paid
    if (paymentStatus === 'paid') {
      try {
        const earnings = session.price * (session.duration / 60);
        await Tutor.findByIdAndUpdate(
          session.tutorId,
          { $inc: { totalEarnings: earnings } }
        );
      } catch (tutorError) {
        console.error('Error updating tutor earnings:', tutorError);
        // Continue with the response even if earnings update fails
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Payment status updated successfully',
      data: session
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Add to sessionController.js

const getTutorIncome = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { period } = req.query; // 'week', 'month', or 'all'
    
    // Calculate date range based on period
    let dateFilter = {};
    if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { date: { $gte: oneWeekAgo } };
    } else if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { date: { $gte: oneMonthAgo } };
    }
    
    // Get sessions with either confirmed or completed status
    const sessions = await Session.find({
      tutorId,
      ...dateFilter,
      status: { $in: ['confirmed', 'completed'] } // Updated to include both statuses
    })
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'username' // Only get the username
      }
    })
    .sort({ date: -1 })
    
    
    // Calculate totals
    const totalEarnings = sessions.reduce((sum, session) => {
      return sum + (session.price * (session.duration / 60));
    }, 0);
    
    // Breakdown by payment status
    const paidSessions = sessions.filter(s => s.paymentStatus === 'paid');
    const pendingSessions = sessions.filter(s => s.paymentStatus === 'pending');
    
    const paidAmount = paidSessions.reduce((sum, session) => {
      return sum + (session.price * (session.duration / 60));
    }, 0);
    
    const pendingAmount = pendingSessions.reduce((sum, session) => {
      return sum + (session.price * (session.duration / 60));
    }, 0);

    // Breakdown by session status
    const confirmedSessions = sessions.filter(s => s.status === 'confirmed');
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    res.status(200).json({
      status: 'success',
      data: {
        sessions,
        summary: {
          totalEarnings,
          paidAmount,
          pendingAmount,
          totalSessions: sessions.length,
          paidSessions: paidSessions.length,
          pendingSessions: pendingSessions.length,
          // Added status breakdown
          confirmedSessions: confirmedSessions.length,
          completedSessions: completedSessions.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tutor income:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch income data',
      error: error.message
    });
  }
};
// Add to your sessionController.js
const rescheduleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newDate, newStartTime, newEndTime, status } = req.body;

    // Validate inputs
    if (!newDate || !newStartTime) {
      return res.status(400).json({
        status: 'error',
        message: 'New date and start time are required'
      });
    }

    // Get the existing session
    const existingSession = await Session.findById(sessionId);
    if (!existingSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Calculate end time if not provided (default to 1 hour after start)
    const calculatedEndTime = newEndTime || 
      (() => {
        const [hours, minutes] = newStartTime.split(':').map(Number);
        return `${hours + 1}:${minutes.toString().padStart(2, '0')}`;
      })();

    // Check for time slot conflicts (excluding current session)
    const conflictingSessions = await Session.find({
      tutorId: existingSession.tutorId,
      date: new Date(newDate),
      _id: { $ne: sessionId },
      status: { $in: ['requested', 'confirmed', 'reschedule_requested'] },
      $or: [
        { startTime: { $lt: calculatedEndTime, $gte: newStartTime } },
        { endTime: { $gt: newStartTime, $lte: calculatedEndTime } },
        { 
          startTime: { $lte: newStartTime }, 
          endTime: { $gte: calculatedEndTime } 
        }
      ]
    });

    if (conflictingSessions.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'The requested time slot is already booked',
        conflicts: conflictingSessions
      });
    }

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          'rescheduleRequest.date': new Date(newDate),
          'rescheduleRequest.startTime': newStartTime,
          'rescheduleRequest.endTime': calculatedEndTime,
          status: status || 'reschedule_requested'
        }
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'tutorId',
      populate: { path: 'userId', select: 'username email' }
    });

    res.status(200).json({
      status: 'success',
      message: 'Reschedule request submitted',
      data: updatedSession
    });

  } catch (error) {
    console.error('Error rescheduling session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reschedule session',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// Add to sessionController.js
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // First verify the session exists and belongs to the student
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if the session can be deleted (only requested or confirmed status)
    if (!['requested', 'confirmed'].includes(session.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Only requested or confirmed sessions can be deleted'
      });
    }
    
    // Delete the session
    await Session.findByIdAndDelete(sessionId);
    
    res.status(200).json({
      status: 'success',
      message: 'Session deleted successfully',
      data: {
        tutorId: session.tutorId // Return tutorId for redirection
      }
    });
    
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete session',
      error: error.message
    });
  }
};


// Add to module.exports
module.exports = {
  createSession,
  getSessionsByTutorAndDate,
   getTutorSessions,
    getPendingRequests,
    updateSessionStatus,
    getSessionById,
    getStudentSessions,       // Add this
    updatePaymentStatus ,
    getTutorIncome,
    rescheduleSession,
    deleteSession
};