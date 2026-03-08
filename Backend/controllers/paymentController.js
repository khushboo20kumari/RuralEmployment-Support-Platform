const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Employer = require('../models/Employer');
const Worker = require('../models/Worker');

// Create Advance Payment (Employer)
exports.createAdvancePayment = async (req, res) => {
  try {
    const { applicationId, amount, paymentMethod, transactionId, upiId, bankDetails, description } = req.body;

    if (!applicationId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'applicationId, amount and paymentMethod are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to make this payment' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications can be paid' });
    }

    const existingPayment = await Payment.findOne({
      applicationId,
      status: { $in: ['pending', 'advance_paid', 'completed'] },
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this application' });
    }

    // Calculate fees and commission
    const normalizedAmount = Number(amount);
    const platformFee = Math.round(normalizedAmount * 0.05); // 5% platform fee
    const platformCommission = 0;
    const netAmount = normalizedAmount - platformFee - platformCommission;

    const payment = await Payment.create({
      applicationId,
      employerId: employer._id,
      workerId: application.workerId,
      amount: normalizedAmount,
      paymentMethod,
      status: 'advance_paid',
      paymentType: 'advance',
      platformFee,
      platformCommission,
      netAmount,
      transactionId,
      upiId,
      bankDetails,
      description,
      advancePaymentDate: new Date(),
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, { status: 'accepted', startDate: new Date() });

    res.status(201).json({
      message: 'Advance payment created successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Release Payment to Worker (After Job Completion)
exports.releasePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'advance_paid') {
      return res.status(400).json({ message: 'Payment cannot be released' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    if (payment.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to release this payment' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        status: 'completed',
        completionPaymentDate: new Date(),
      },
      { new: true }
    );

    // Update application status
    await Application.findByIdAndUpdate(
      payment.applicationId,
      { status: 'completed', completionDate: new Date() }
    );

    res.status(200).json({
      message: 'Payment released to worker successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error releasing payment', error: error.message });
  }
};

// Get Payment History (Worker)
exports.getWorkerPayments = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.userId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const payments = await Payment.find({ workerId: worker._id })
      .populate('applicationId', 'jobId')
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    const totalEarned = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.netAmount, 0);

    res.status(200).json({
      payments,
      totalEarnings: totalEarned,
      totalEarned,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get Eligible Applications for Payment (Employer)
exports.getEligibleApplicationsForPayment = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const applications = await Application.find({
      employerId: employer._id,
      status: 'accepted',
    })
      .populate('jobId', 'title salary location')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ acceptedDate: -1, createdAt: -1 });

    const applicationIds = applications.map((a) => a._id);
    const existingPayments = await Payment.find({
      applicationId: { $in: applicationIds },
      status: { $in: ['pending', 'advance_paid', 'completed'] },
    }).select('applicationId');

    const paidApplicationIds = new Set(existingPayments.map((p) => p.applicationId.toString()));
    const eligibleApplications = applications.filter((a) => !paidApplicationIds.has(a._id.toString()));

    res.status(200).json({ applications: eligibleApplications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching eligible applications', error: error.message });
  }
};

// Get Payment History (Employer)
exports.getEmployerPayments = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const payments = await Payment.find({ employerId: employer._id })
      .populate('applicationId', 'jobId')
      .populate('workerId', 'userId')
      .sort({ createdAt: -1 });

    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      payments,
      totalPaid,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get Platform Revenue
exports.getPlatformRevenue = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'completed' });

    const totalFees = payments.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const totalCommission = payments.reduce((sum, p) => sum + (p.platformCommission || 0), 0);
    const totalRevenue = totalFees + totalCommission;

    res.status(200).json({
      totalFees,
      totalCommission,
      totalRevenue,
      totalTransactions: payments.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue', error: error.message });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('applicationId')
      .populate('employerId', 'companyName')
      .populate('workerId', 'userId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
};
