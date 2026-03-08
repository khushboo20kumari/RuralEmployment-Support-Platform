const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'bank_transfer', 'digital_wallet', 'cash'],
  },
  status: {
    type: String,
    enum: ['pending', 'advance_paid', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentType: {
    type: String,
    enum: ['advance', 'final', 'bonus'],
    default: 'advance',
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  platformCommission: {
    type: Number,
    default: 0,
  },
  netAmount: Number,
  advancePaymentDate: Date,
  completionPaymentDate: Date,
  transactionId: String,
  upiId: String,
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    bankName: String,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
