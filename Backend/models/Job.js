const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  titleHi: {
    type: String,
    default: '',
  },
  descriptionHi: {
    type: String,
    default: '',
  },
  skillsRequired: [String],
  workType: {
    type: String,
    enum: ['construction_labour', 'factory_helper', 'farm_worker', 'domestic_help', 'other'],
    required: true,
  },
  location: {
    village: String,
    district: String,
    state: String,
    latitude: Number,
    longitude: Number,
  },
  salary: {
    amount: Number,
    period: {
      type: String,
      enum: ['hourly', 'daily', 'monthly'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  workingHours: {
    startTime: String,
    endTime: String,
    daysPerWeek: Number,
  },
  numberOfPositions: {
    type: Number,
    default: 1,
  },
  startDate: Date,
  endDate: Date,
  jobStatus: {
    type: String,
    enum: ['open', 'closed', 'filled', 'cancelled'],
    default: 'open',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  experienceRequired: {
    type: Number,
    default: 0,
  },
  ageLimit: {
    minimum: Number,
    maximum: Number,
  },
  benefits: [String],
  accommodation: Boolean,
  mealProvided: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
