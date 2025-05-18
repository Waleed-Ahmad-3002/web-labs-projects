// models/Analytics.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectDistributionSchema = new Schema({
  subject: String,
  count: Number
});

const LocationDistributionSchema = new Schema({
  city: String,
  count: Number
});

const AnalyticsSchema = new Schema({
  date: { 
    type: Date, 
    required: true 
  },
  totalSessions: { 
    type: Number, 
    default: 0 
  },
  completedSessions: { 
    type: Number, 
    default: 0 
  },
  cancelledSessions: { 
    type: Number, 
    default: 0 
  },
  newUsers: {
    total: { 
      type: Number, 
      default: 0 
    },
    students: { 
      type: Number, 
      default: 0 
    },
    tutors: { 
      type: Number, 
      default: 0 
    }
  },
  totalRevenue: { 
    type: Number, 
    default: 0 
  },
  subjectDistribution: [SubjectDistributionSchema],
  locationDistribution: [LocationDistributionSchema],
  averageSessionDuration: Number, // In minutes
  averageRating: Number
});

// Make sure we have unique entries per day
AnalyticsSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema, 'analytics');