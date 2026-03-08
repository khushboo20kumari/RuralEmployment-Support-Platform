const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  skills: [{
    type: String,
    enum: ['construction_labour', 'factory_helper', 'farm_worker', 'domestic_help', 'other'],
  }],
  experience: {
    type: Number,
    default: 0,
  },
  experienceDetails: String,
  idProof: {
    type: String,
    enum: ['aadhar', 'pan', 'driving_license', 'other'],
  },
  idProofNumber: String,
  idProofDocument: String,
  hourlyRate: Number,
  dailyRate: Number,
  monthlyRate: Number,
  availability: {
    type: String,
    enum: ['full_time', 'part_time', 'seasonal', 'flexible'],
    default: 'flexible',
  },
  workPreferences: {
    maxDistance: Number, // in kilometers
    preferredLocations: [String],
    workTypes: [String],
  },
  totalJobsCompleted: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
