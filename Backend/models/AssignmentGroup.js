const mongoose = require('mongoose');

const assignmentGroupSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  assignedWorkerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
  }],
  requiredWorkers: {
    type: Number,
    default: 1,
  },
  assignmentStatus: {
    type: String,
    enum: ['planning', 'assigned', 'in_progress', 'completed', 'payment_pending', 'payment_received', 'workers_paid'],
    default: 'planning',
  },
  verificationStatus: {
    type: String,
    enum: ['not_started', 'contacted', 'verified', 'rejected'],
    default: 'not_started',
  },
  verificationMethod: {
    type: String,
    enum: ['call', 'message', 'call_and_message', 'other', ''],
    default: '',
  },
  workStatus: {
    type: String,
    enum: ['pending', 'ongoing', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['not_due', 'awaiting_employer_payment', 'received_on_platform', 'distributed_to_workers'],
    default: 'not_due',
  },
  paymentPerWorker: {
    type: Number,
    default: 0,
  },
  platformTotalPayment: {
    type: Number,
    default: 0,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  employerContactStatus: {
    type: String,
    enum: ['not_contacted', 'contacted', 'confirmed'],
    default: 'not_contacted',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('AssignmentGroup', assignmentGroupSchema);
