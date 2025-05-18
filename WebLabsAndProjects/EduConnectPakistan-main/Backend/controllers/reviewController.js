// controllers/reviewController.js
const Review = require('../models/Review');
const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');

// Create a new review
const createReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
  //  const studentId = req.user.profileId; // Assuming the student profile ID is stored in user object
    const { sessionId, tutorId, rating, comment,studentId } = req.body;
    
    // Check if all required fields are provided
    if (!sessionId || !tutorId || !rating || !studentId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'SessionId, tutorId and rating are required fields'
      });
    }
    
    // Check if review for this session already exists
    const existingReview = await Review.findOne({ sessionId }).session(session);
    if (existingReview) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'A review for this session already exists'
      });
    }
    
    // Create new review
    const review = new Review({
      sessionId,
      studentId,
      tutorId,
      rating,
      comment: comment || '',
      isPublic: true,
      reply: {
        content: '',
        createdAt: null
      }
    });
    
    // Save the review
    await review.save({ session });
    
    // Update tutor's rating statistics
    const tutor = await Tutor.findById(tutorId).session(session);
    if (tutor) {
      // Calculate new average rating
      const totalRatingsNew = tutor.totalRatings + 1;
      const ratingSum = tutor.ratingAverage * tutor.totalRatings;
      const newRatingAverage = (ratingSum + rating) / totalRatingsNew;
      
      // Update tutor document
      await Tutor.findByIdAndUpdate(
        tutorId,
        {
          $inc: { totalRatings: 1 },
          $set: { ratingAverage: parseFloat(newRatingAverage.toFixed(2)) }
        },
        { session }
      );
    }
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
};

// Get reviews for a tutor
const getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const reviews = await Review.find({ tutorId, isPublic: true })
      .populate('studentId', 'userId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username profilePicture'  // Changed avatar to profilePicture
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching tutor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get reviews by student
const getStudentReviews = async (req, res) => {
  try {
    const studentId = req.user.profileId;
    
    const reviews = await Review.find({ studentId })
      .populate('tutorId', 'userId')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'username profilePicture'  // Changed avatar to profilePicture
        }
      })
      .populate('sessionId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching student reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const reviewId = req.params.id;
    const studentId = req.user.profileId;
    const { rating, comment } = req.body;
    
    // Find the review
    const review = await Review.findById(reviewId).session(session);
    
    if (!review) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if the review belongs to the current student
    if (review.studentId.toString() !== studentId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }
    
    // Get old rating for average calculation
    const oldRating = review.rating;
    
    // Update review
    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    
    await review.save({ session });
    
    // Update tutor's rating statistics if rating has changed
    if (oldRating !== rating && rating) {
      const tutorId = review.tutorId;
      const tutor = await Tutor.findById(tutorId).session(session);
      
      if (tutor && tutor.totalRatings > 0) {
        // Calculate new average
        const ratingSum = tutor.ratingAverage * tutor.totalRatings;
        const adjustedSum = ratingSum - oldRating + rating;
        const newAverage = adjustedSum / tutor.totalRatings;
        
        await Tutor.findByIdAndUpdate(
          tutorId,
          { $set: { ratingAverage: parseFloat(newAverage.toFixed(2)) } },
          { session }
        );
      }
    }
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const reviewId = req.params.id;
    const studentId = req.user.profileId;
    
    // Find the review
    const review = await Review.findById(reviewId).session(session);
    
    if (!review) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if the review belongs to the current student
    if (review.studentId.toString() !== studentId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    
    // Get review details before deleting
    const { tutorId, rating } = review;
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId).session(session);
    
    // Update tutor's rating statistics
    const tutor = await Tutor.findById(tutorId).session(session);
    
    if (tutor && tutor.totalRatings > 0) {
      // Calculate new total and average
      const totalRatingsNew = tutor.totalRatings - 1;
      
      if (totalRatingsNew > 0) {
        const ratingSum = tutor.ratingAverage * tutor.totalRatings;
        const newRatingAverage = (ratingSum - rating) / totalRatingsNew;
        
        await Tutor.findByIdAndUpdate(
          tutorId,
          {
            $inc: { totalRatings: -1 },
            $set: { ratingAverage: parseFloat(newRatingAverage.toFixed(2)) }
          },
          { session }
        );
      } else {
        // If this was the last review, reset ratings
        await Tutor.findByIdAndUpdate(
          tutorId,
          {
            totalRatings: 0,
            ratingAverage: 0
          },
          { session }
        );
      }
    }
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Tutor responding to a review
const respondToReview = async (req, res) => {
  const session = await mongoose.startSession();  // Added session
  session.startTransaction();  // Added transaction
  
  try {
    const reviewId = req.params.id;
    const { content } = req.body;
    const tutorId = req.user.profileId;
    
    // Find the review
    const review = await Review.findById(reviewId).session(session);  // Added session
    
    if (!review) {
      await session.abortTransaction();  // Added abort
      session.endSession();  // Added end session
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if the review is for this tutor
    if (review.tutorId.toString() !== tutorId.toString()) {
      await session.abortTransaction();  // Added abort
      session.endSession();  // Added end session
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews for your profile'
      });
    }
    
    // Update the reply
    review.reply = {
      content,
      createdAt: Date.now()
    };
    
    await review.save({ session });  // Added session
    
    // Commit transaction
    await session.commitTransaction();  // Added commit
    session.endSession();  // Added end session
    
    res.status(200).json({
      success: true,
      message: 'Response added to review',
      data: review
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();  // Added abort
    session.endSession();  // Added end session
    
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to review',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getTutorReviews,
  getStudentReviews,
  updateReview,
  deleteReview,
  respondToReview
};