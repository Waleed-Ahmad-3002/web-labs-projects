// models/Tutor.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QualificationSchema = new Schema({
  degree: String,
  institution: String,
  year: Number,
  certificate: String
});

const ExperienceSchema = new Schema({
  title: String,
  organization: String,
  years: Number,
  description: String
});

const SubjectSchema = new Schema({
  name: String,
  level: { 
    type: String, 
    enum: ['Primary', 'Secondary', 'Higher Secondary', 'Undergraduate', 'Graduate'] 
  }
});

const TutorSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bio: String,
  qualifications: [QualificationSchema],
  experience: [ExperienceSchema],
  subjects: [SubjectSchema],
  hourlyRate: {
    min: Number,
    max: Number
  },
  teachingPreference: { 
    type: String, 
    enum: ['Online', 'In-person', 'Both'], 
    default: 'Both' 
  },
  ratingAverage: { 
    type: Number, 
    default: 0 
  },
  totalRatings: { 
    type: Number, 
    default: 0 
  },
  totalSessions: { 
    type: Number, 
    default: 0 
  },
  totalEarnings: { 
    type: Number, 
    default: 0 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
});

module.exports = mongoose.model('Tutor', TutorSchema, 'tutors');