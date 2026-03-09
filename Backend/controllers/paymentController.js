const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Employer = require('../models/Employer');
const Worker = require('../models/Worker');
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');

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

    const application = await Application.findById(payment.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found for this payment' });
    }

    if (application.status !== 'completed') {
      return res.status(400).json({ message: 'Worker has not marked the job as completed yet' });
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
        status: 'pending',
        employerFinalPaymentDate: new Date(),
      },
      { new: true }
    );

    // Update application status
    await Application.findByIdAndUpdate(
      payment.applicationId,
      { status: 'completed', completionDate: new Date() }
    );

    res.status(200).json({
      message: 'Final payment received on platform. Admin will release it to worker shortly.',
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error releasing payment', error: error.message });
  }
};

// Admin Release Payment to Worker
exports.adminReleaseToWorker = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Only platform-received pending payments can be released by admin' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'completed',
        adminReleaseDate: new Date(),
        completionPaymentDate: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Payment released to worker successfully by admin',
      payment: updatedPayment,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error releasing payment to worker', error: error.message });
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
      .populate({
        path: 'applicationId',
        select: 'jobId status completionDate',
        populate: {
          path: 'jobId',
          select: 'title',
        },
      })
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
      .populate({
        path: 'applicationId',
        select: 'status attendanceCount completionDate jobId',
        populate: {
          path: 'jobId',
          select: 'title',
        },
      })
      .populate({
        path: 'workerId',
        select: 'skills experience userId',
        populate: {
          path: 'userId',
          select: 'name phone',
        },
      })
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

// ==================== RAZORPAY INTEGRATION ====================

// Create Razorpay Order (Employer pays to platform)
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { applicationId, amount } = req.body;
    console.log('[createRazorpayOrder] request', {
      userId: req.userId?.toString?.() || req.userId,
      applicationId,
      amount,
    });

    if (!applicationId || !amount) {
      console.warn('[createRazorpayOrder] missing fields', { applicationId, amount });
      return res.status(400).json({ message: 'applicationId and amount are required' });
    }

    const normalizedAmount = Number(amount);
    if (normalizedAmount <= 0) {
      console.warn('[createRazorpayOrder] invalid amount', { amount: normalizedAmount });
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    if (normalizedAmount < 100) {
      console.warn('[createRazorpayOrder] amount too low', { amount: normalizedAmount });
      return res.status(400).json({ message: 'Minimum payment amount is ₹100' });
    }

    const application = await Application.findById(applicationId)
      .populate('workerId')
      .populate('jobId', 'title employerId');

    if (!application) {
      console.warn('[createRazorpayOrder] application not found', { applicationId });
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });
    if (!employer) {
      console.warn('[createRazorpayOrder] employer profile missing', {
        userId: req.userId?.toString?.() || req.userId,
      });
      return res.status(404).json({ message: 'Employer profile not found for this account' });
    }

    const applicationEmployerId = application.employerId?._id
      ? application.employerId._id.toString()
      : application.employerId?.toString();

    const jobEmployerId = application.jobId?.employerId?._id
      ? application.jobId.employerId._id.toString()
      : application.jobId?.employerId?.toString();

    const employerId = employer._id.toString();
    const employerMatchesApplication = applicationEmployerId === employerId;
    const employerMatchesJob = jobEmployerId === employerId;

    if (!employerMatchesApplication && !employerMatchesJob) {
      console.warn('[createRazorpayOrder] employer mismatch', {
        employerId,
        applicationEmployerId,
        jobEmployerId,
      });
      return res.status(403).json({
        message: 'This application does not belong to your employer account',
        debug: {
          employerId,
          applicationEmployerId,
          jobEmployerId,
        },
      });
    }

    if (application.status !== 'accepted') {
      console.warn('[createRazorpayOrder] invalid application status', {
        applicationId,
        status: application.status,
      });
      return res.status(400).json({ message: 'Only accepted applications can be paid' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      applicationId,
      status: { $in: ['pending', 'advance_paid', 'completed'] },
    });

    if (existingPayment) {
      console.warn('[createRazorpayOrder] payment already exists', { applicationId });
      return res.status(400).json({ message: 'Payment already exists for this application' });
    }

    // Create Razorpay order (amount in paise/smallest currency unit)
    const shortApplicationId = String(applicationId).slice(-10);
    const shortTs = Date.now().toString().slice(-8);
    const receipt = `rcpt_${shortApplicationId}_${shortTs}`;

    const safeJobTitle = String(application.jobId?.title || 'Job Payment').slice(0, 80);

    const razorpayOrder = await razorpay.orders.create({
      amount: normalizedAmount * 100, // Convert rupees to paise
      currency: 'INR',
      receipt,
      notes: {
        applicationId: String(applicationId),
        employerId: employer._id.toString(),
        workerId: application.workerId._id.toString(),
        jobTitle: safeJobTitle,
      },
    });

    res.status(200).json({
      message: 'Razorpay order created successfully',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      applicationId,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
    console.log('[createRazorpayOrder] success', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      applicationId,
    });
  } catch (error) {
    const razorpayStatus = error?.statusCode;
    const razorpayDescription = error?.error?.description;
    const razorpayCode = error?.error?.code;

    console.error('[createRazorpayOrder] error', {
      statusCode: razorpayStatus,
      code: razorpayCode,
      description: razorpayDescription,
      raw: error,
    });

    if (razorpayStatus) {
      return res.status(razorpayStatus).json({
        message: razorpayDescription || 'Razorpay order creation failed',
        code: razorpayCode,
      });
    }

    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
};

// Verify Razorpay Payment and Transfer to Worker
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId || !amount) {
      return res.status(400).json({ message: 'All Razorpay fields and applicationId are required' });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxxxx')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified, now create payment record
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Calculate fees
    const normalizedAmount = Number(amount);
    const platformFee = Math.round(normalizedAmount * 0.05); // 5% platform fee
    const netAmount = normalizedAmount - platformFee;

    // Create payment record
    const payment = await Payment.create({
      applicationId,
      employerId: employer._id,
      workerId: application.workerId,
      amount: normalizedAmount,
      paymentMethod: 'razorpay',
      status: 'advance_paid',
      paymentType: 'advance',
      platformFee,
      platformCommission: 0,
      netAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      description: 'Advance payment via Razorpay',
      advancePaymentDate: new Date(),
    });

    // Update application
    await Application.findByIdAndUpdate(applicationId, { 
      status: 'accepted', 
      startDate: new Date() 
    });

    res.status(201).json({
      message: '✅ Payment successful! ₹' + netAmount + ' will be transferred to worker after job completion.',
      payment,
      platformFee,
      netAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};
