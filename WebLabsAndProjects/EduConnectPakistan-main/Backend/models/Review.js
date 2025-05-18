// models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  sessionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Session', 
    required: true 
  },
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  tutorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  reply: {
    content: String,
    createdAt: Date
  }
});

// Each session can only have one review
ReviewSchema.index({ sessionId: 1 }, { unique: true });
// Indexes for efficient queries
ReviewSchema.index({ tutorId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema, 'reviews');