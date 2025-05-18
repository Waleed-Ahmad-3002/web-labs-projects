// models/Session.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
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
  subject: { 
    type: String, 
    required: true 
  },
  topicDescription: String,
  sessionType: { 
    type: String, 
    enum: ['Online', 'In-person'], 
    required: true 
  },
  location: String, // Required if sessionType is 'In-person'
  meetingLink: String, // Required if sessionType is 'Online'
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  }, // In minutes
  price: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['requested', 'confirmed', 'cancelled_by_student', 'cancelled_by_tutor', 'completed', 'no_show'],
    default: 'requested'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  cancellationReason: String,
  notes: String,
  isReviewed: { 
    type: Boolean, 
    default: false 
  }
});

// Update the updatedAt field on save
SessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for common queries
SessionSchema.index({ studentId: 1, date: -1 });
SessionSchema.index({ tutorId: 1, date: -1 });
SessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', SessionSchema, 'sessions');