// models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'session_request', 'session_confirmed', 'session_cancelled', 
      'session_reminder', 'rate_change', 'verification_status',
      'new_review', 'payment_received', 'wishlist_update'
    ],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedTo: {
    model: { 
      type: String, 
      enum: ['Session', 'Tutor', 'Review', 'Payment'] 
    },
    id: Schema.Types.ObjectId
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for quick retrieval of user notifications
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema, 'notifications');