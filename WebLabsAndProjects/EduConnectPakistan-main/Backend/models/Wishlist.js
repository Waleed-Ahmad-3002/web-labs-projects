// models/Wishlist.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
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
  addedAt: { 
    type: Date, 
    default: Date.now 
  },
  notificationPreferences: {
    rateChanges: { 
      type: Boolean, 
      default: true 
    },
    newAvailability: { 
      type: Boolean, 
      default: false 
    }
  }
});

// Ensure a tutor is only added once to a student's wishlist
WishlistSchema.index({ studentId: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema, 'wishlists');