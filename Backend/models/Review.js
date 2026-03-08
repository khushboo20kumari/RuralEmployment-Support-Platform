const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  reviewType: {
    type: String,
    enum: ['worker_by_employer', 'employer_by_worker'],
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: String,
  punctuality: Number,
  workQuality: Number,
  communication: Number,
  professionalism: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index to prevent duplicate reviews
reviewSchema.index({ reviewerId: 1, applicationId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
