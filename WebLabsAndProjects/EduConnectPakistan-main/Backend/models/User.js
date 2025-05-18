// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'tutor', 'admin'], 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  phoneNumber: String,
  profilePicture: String,
  city: String,
  country: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActive: Date,
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

module.exports = mongoose.model('User', UserSchema, 'users');