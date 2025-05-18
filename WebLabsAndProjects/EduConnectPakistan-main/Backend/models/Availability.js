// models/Availability.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvailabilitySchema = new Schema({
  tutorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true 
  },
  dayOfWeek: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 6 
  }, // 0 = Sunday, 6 = Saturday
  startTime: { 
    type: String, 
    required: true 
  }, // Format: "HH:MM" in 24h
  endTime: { 
    type: String, 
    required: true 
  }, // Format: "HH:MM" in 24h
  isRecurring: { 
    type: Boolean, 
    default: true 
  },
  specificDate: Date // Optional, used for non-recurring availability
});

// Compound index for efficient querying of availability
AvailabilitySchema.index({ tutorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Availability', AvailabilitySchema, 'availabilities');