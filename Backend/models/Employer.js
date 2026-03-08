const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: String,
  companyType: {
    type: String,
    enum: ['factory', 'construction', 'farm', 'business', 'other'],
  },
  businessRegistration: String,
  businessDocument: String,
  contactPerson: String,
  websiteUrl: String,
  workersHired: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocument: String,
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

module.exports = mongoose.model('Employer', employerSchema);
