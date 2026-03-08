const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'accepted', 'cancelled', 'completed'],
    default: 'applied',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  appliedMessage: String,
  employerNotes: String,
  rejectionReason: String,
  acceptedDate: Date,
  startDate: Date,
  completionDate: Date,
  attendanceCount: {
    type: Number,
    default: 0,
  },
  lastAttendanceDate: Date,
  attendanceRecords: [
    {
      date: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['present'],
        default: 'present',
      },
      markedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index to prevent duplicate applications
applicationSchema.index({ workerId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
