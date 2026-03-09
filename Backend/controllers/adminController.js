const User = require('../models/User');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Payment = require('../models/Payment');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      pendingJobs,
      totalApplications,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Worker.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ isApproved: false }),
      Application.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
    ]);

    const platformRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: [
                { $ifNull: ['$platformFee', 0] },
                { $ifNull: ['$platformCommission', 0] },
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalWorkers,
        totalEmployers,
        totalJobs,
        pendingJobs,
        totalApplications,
        totalPayments,
        platformRevenue: platformRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, isVerified, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (userType) filter.userType = userType;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get All Workers with Details
exports.getAllWorkersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const workers = await Worker.find()
      .populate('userId', 'name email phone address isVerified createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Worker.countDocuments();

    res.status(200).json({
      workers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error: error.message });
  }
};

// Get All Employers with Details
exports.getAllEmployersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const employers = await Employer.find()
      .populate('userId', 'name email phone address isVerified createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Employer.countDocuments();

    res.status(200).json({
      employers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employers', error: error.message });
  }
};

// Get All Jobs
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    const jobs = await Job.find(filter)
      .populate('employerId')
      .populate({
        path: 'employerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('approvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Approve/Unapprove Job
exports.approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be true or false' });
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        isApproved,
        approvedBy: isApproved ? req.userId : null,
        approvedAt: isApproved ? new Date() : null,
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      message: `Job ${isApproved ? 'approved' : 'unapproved'} successfully`,
      job,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job approval', error: error.message });
  }
};

// Get All Applications
exports.getAllApplicationsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const applications = await Application.find()
      .populate('workerId')
      .populate('employerId')
      .populate('jobId')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'employerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments();

    res.status(200).json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Verify User (Worker or Employer)
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also update worker/employer verification
    if (user.userType === 'worker') {
      await Worker.findOneAndUpdate({ userId }, { isActive: isVerified });
    } else if (user.userType === 'employer') {
      await Employer.findOneAndUpdate({ userId }, { isVerified });
    }

    res.status(200).json({
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying user', error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated data
    if (user.userType === 'worker') {
      await Worker.findOneAndDelete({ userId });
      await Application.deleteMany({ workerId: userId });
    } else if (user.userType === 'employer') {
      await Employer.findOneAndDelete({ userId });
      await Job.deleteMany({ employerId: userId });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get All Payments
exports.getAllPaymentsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const payments = await Payment.find()
      .populate('employerId')
      .populate('workerId')
      .populate('applicationId')
      .populate({
        path: 'employerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments();

    res.status(200).json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get Pending Jobs (for approval)
exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isApproved: false })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending jobs', error: error.message });
  }
};

// Reject Job
exports.rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndUpdate(
      jobId,
      { isApproved: false, jobStatus: 'closed' },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job rejected successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting job', error: error.message });
  }
};

// Get Analytics (comprehensive stats)
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalJobs,
      approvedJobs,
      pendingJobs,
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalPayments,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ isApproved: true }),
      Job.countDocuments({ isApproved: false }),
      User.countDocuments(),
      Worker.countDocuments(),
      Employer.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
    ]);

    const platformFeeData = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalFee: { $sum: '$platformFee' } } },
    ]);

    const platformRevenue = platformFeeData[0]?.totalFee || 0;

    res.status(200).json({
      totalJobs,
      approvedJobs,
      pendingJobs,
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalPayments,
      platformRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
