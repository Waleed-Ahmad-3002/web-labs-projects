// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EducationSchema = new Schema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  from: Date,
  to: Date,
  current: Boolean
});

const StudentSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  education: [EducationSchema],
  interests: [String],
  wishlist: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Tutor' 
  }],
  sessionHistory: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Session' 
  }]
});

module.exports = mongoose.model('Student', StudentSchema, 'students');