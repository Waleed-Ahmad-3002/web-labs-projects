// models/Payment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
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
  amount: { 
    type: Number, 
    required: true 
  },
  platformFee: { 
    type: Number, 
    required: true 
  },
  tutorEarnings: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  transactionId: String,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: Date,
  refundedAt: Date,
  refundReason: String
});

// Index for transactions lookup
PaymentSchema.index({ transactionId: 1 });
// Index for tutor earnings reports
PaymentSchema.index({ tutorId: 1, status: 1, createdAt: -1 });
// Index for session payments
PaymentSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema, 'payments');