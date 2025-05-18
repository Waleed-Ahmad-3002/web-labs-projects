// models/VerificationRequest.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const VerificationRequestSchema = new Schema({
  tutorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminComments: String,
  requestDate: { 
    type: Date, 
    default: Date.now 
  },
  processedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  processedDate: Date
});

// Index for admin dashboard to see pending verifications
VerificationRequestSchema.index({ status: 1, requestDate: 1 });
// Index for tutor to check their verification status
VerificationRequestSchema.index({ tutorId: 1 });

module.exports = mongoose.model('VerificationRequest', VerificationRequestSchema, 'verificationRequests');