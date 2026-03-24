const User = require('../models/User');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const Chat = require('../models/Chat');
const AssignmentGroup = require('../models/AssignmentGroup');

const getWorkTypeFromText = (text = '') => {
  const normalized = String(text).toLowerCase();

  if (normalized.includes('construction') || normalized.includes('mason') || normalized.includes('labour')) {
    return 'construction_labour';
  }
  if (normalized.includes('factory') || normalized.includes('machine') || normalized.includes('helper')) {
    return 'factory_helper';
  }
  if (normalized.includes('farm') || normalized.includes('agri') || normalized.includes('field')) {
    return 'farm_worker';
  }
  if (normalized.includes('home') || normalized.includes('house') || normalized.includes('domestic')) {
    return 'domestic_help';
  }

  return 'other';
};

const calculateGroupStatus = ({ requiredWorkers, assignedWorkersCount, completedApplications, pendingPayments, paidPayments }) => {
  if (pendingPayments > 0) return 'payment_received';
  if (paidPayments > 0 && pendingPayments === 0 && completedApplications > 0) return 'workers_paid';
  if (completedApplications > 0 && pendingPayments === 0 && paidPayments === 0) return 'payment_pending';
  if (assignedWorkersCount >= requiredWorkers) return 'assigned';
  if (assignedWorkersCount > 0) return 'in_progress';
  return 'planning';
};

const pushAdminProgressToJobApplications = async (jobId, progressPercent, note) => {
  if (!jobId) return;

  await Application.updateMany(
    { jobId, status: { $in: ['accepted', 'completed'] } },
    {
      $push: {
        progressUpdates: {
          progressPercent,
          note,
          updatedBy: 'admin',
          updatedAt: new Date(),
        },
      },
    }
  );
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      openJobs,
      totalApplications,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Worker.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ jobStatus: 'open' }),
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
        openJobs,
        pendingJobs: 0,
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

    const enrichedApplications = await Promise.all(
      applications.map(async (application) => {
        const latestPayment = await Payment.findOne({ applicationId: application._id })
          .select('status paymentType amount netAmount updatedAt createdAt completionPaymentDate adminReleaseDate employerFinalPaymentDate')
          .sort({ createdAt: -1 });

        return {
          ...application.toObject(),
          latestPayment,
        };
      })
    );

    const total = await Application.countDocuments();

    res.status(200).json({
      applications: enrichedApplications,
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

// Get jobs that need worker assignment
exports.getAssignmentJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const jobs = await Job.find({
      jobStatus: { $in: ['open', 'filled'] },
    })
      .populate({
        path: 'employerId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);

    const acceptedByJob = await Application.aggregate([
      { $match: { jobId: { $in: jobIds }, status: { $in: ['accepted', 'completed'] } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);

    const acceptedMap = acceptedByJob.reduce((acc, row) => {
      acc[row._id.toString()] = row.count;
      return acc;
    }, {});

    const jobsWithNeeds = jobs.map((job) => {
      const requiredWorkers = Math.max(1, Number(job.numberOfPositions) || 1);
      const assignedWorkers = acceptedMap[job._id.toString()] || 0;
      const neededWorkers = Math.max(0, requiredWorkers - assignedWorkers);

      return {
        ...job.toObject(),
        requiredWorkers,
        assignedWorkers,
        neededWorkers,
      };
    });

    const total = await Job.countDocuments({ jobStatus: { $in: ['open', 'filled'] } });

    res.status(200).json({
      jobs: jobsWithNeeds,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment jobs', error: error.message });
  }
};

// Get suggested workers for a job based on work type/title matching
exports.getSuggestedWorkersForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 15 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const inferredWorkType = getWorkTypeFromText(`${job.title} ${job.description || ''}`);
    const matchingType = job.workType || inferredWorkType;

    const acceptedApplications = await Application.find({
      jobId,
      status: { $in: ['accepted', 'completed'] },
    }).select('workerId');

    const alreadyAssignedWorkerIds = acceptedApplications.map((a) => a.workerId);

    const workers = await Worker.find({
      isActive: true,
      _id: { $nin: alreadyAssignedWorkerIds },
      $or: [
        { skills: matchingType },
        { skills: 'other' },
      ],
    })
      .populate('userId', 'name email phone address')
      .sort({ totalJobsCompleted: -1, averageRating: -1, createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      job: {
        _id: job._id,
        title: job.title,
        workType: job.workType,
        numberOfPositions: job.numberOfPositions,
      },
      workers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggested workers', error: error.message });
  }
};

// Admin assigns workers to job and creates coordination group
exports.assignWorkersToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { workerIds = [], adminNotes = '', employerContactStatus = 'contacted' } = req.body;

    if (!Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ message: 'workerIds array is required' });
    }

    const uniqueWorkerIds = [...new Set(workerIds.map((id) => id.toString()))];

    const job = await Job.findById(jobId).populate('employerId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (!job.employerId || !job.employerId._id) {
      return res.status(400).json({ message: 'Job is missing employerId or employer is invalid. Please check job data.' });
    }

    const employer = await Employer.findById(job.employerId._id).populate('userId', 'name email phone');
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found for job' });
    }

    const currentAcceptedCount = await Application.countDocuments({
      jobId,
      status: { $in: ['accepted', 'completed'] },
    });

    const requiredWorkers = Math.max(1, Number(job.numberOfPositions) || 1);
    const remainingSlots = Math.max(0, requiredWorkers - currentAcceptedCount);

    if (remainingSlots === 0) {
      return res.status(400).json({ message: 'Required workers already assigned for this job' });
    }

    if (uniqueWorkerIds.length > remainingSlots) {
      return res.status(400).json({
        message: `Only ${remainingSlots} more worker(s) can be assigned for this job`,
      });
    }


    const workers = await Worker.find({ _id: { $in: uniqueWorkerIds }, isActive: true }).populate('userId', 'name email phone');
    if (workers.length !== uniqueWorkerIds.length) {
      return res.status(400).json({ message: 'Some workers are invalid or inactive' });
    }

    // Check if any worker is already assigned to another ongoing/pending job
    for (const worker of workers) {
      // Find any application for this worker with status 'accepted' or 'completed' (excluding this job)
      const activeApp = await Application.findOne({
        workerId: worker._id,
        jobId: { $ne: jobId },
        status: { $in: ['accepted', 'completed'] },
      });
      if (activeApp) {
        // Check if the assignment group for that job is still ongoing or pending
        const group = await AssignmentGroup.findOne({ jobId: activeApp.jobId });
        if (group && ['ongoing', 'pending'].includes(group.workStatus)) {
          return res.status(400).json({
            message: `Worker ${worker.userId.name || worker._id} is already assigned to another ongoing job and is not free.`,
            workerId: worker._id,
          });
        }
      }
    }

    const createdApplications = [];
    for (const worker of workers) {
      let application = await Application.findOne({ jobId, workerId: worker._id });
      if (!application) {
        application = await Application.create({
          workerId: worker._id,
          jobId,
          employerId: employer._id,
          status: 'accepted',
          acceptedDate: new Date(),
          workStarted: true,
          workStartedDate: new Date(),
          startDate: new Date(),
          employerNotes: `Assigned by admin. ${adminNotes || ''}`.trim(),
          applicationDate: new Date(),
        });
      } else if (!['accepted', 'completed'].includes(application.status)) {
        application.status = 'accepted';
        application.acceptedDate = new Date();
        application.workStarted = true;
        application.workStartedDate = new Date();
        application.startDate = new Date();
        application.employerNotes = `Assigned by admin. ${adminNotes || ''}`.trim();
        await application.save();
      } else if (application.status === 'accepted' && !application.workStarted) {
        application.workStarted = true;
        application.workStartedDate = new Date();
        application.startDate = application.startDate || new Date();
        await application.save();
      }

      createdApplications.push(application);

      // Ensure worker-employer direct chat exists so they can coordinate call/message
      const workerUserId = worker.userId?._id || worker.userId;
      const employerUserId = employer.userId?._id || employer.userId;

      const existingChat = await Chat.findOne({
        $or: [
          { workerId: workerUserId, employerId: employerUserId },
          { workerId: employerUserId, employerId: workerUserId },
        ],
      });

      if (!existingChat) {
        await Chat.create({
          workerId: workerUserId,
          employerId: employerUserId,
          jobId: job._id,
          lastMessage: 'Admin created this coordination chat for assigned work.',
          lastMessageTime: new Date(),
          lastMessageSenderId: req.userId,
        });
      }
    }

    const allAcceptedApplications = await Application.find({
      jobId,
      status: { $in: ['accepted', 'completed'] },
    }).select('workerId');

    const allAssignedWorkerIds = [...new Set(allAcceptedApplications.map((a) => a.workerId.toString()))];

    const groupData = {
      employerId: employer._id,
      assignedWorkerIds: allAssignedWorkerIds,
      requiredWorkers,
      adminNotes,
      employerContactStatus,
      verificationStatus: employerContactStatus === 'confirmed' ? 'verified' : 'contacted',
      verificationMethod: 'call_and_message',
      workStatus: 'ongoing',
      paymentStatus: 'awaiting_employer_payment',
      paymentPerWorker: 0,
      platformTotalPayment: 0,
      createdBy: req.userId,
      assignmentStatus: 'in_progress',
    };

    const assignmentGroup = await AssignmentGroup.findOneAndUpdate(
      { jobId },
      { $set: groupData, $setOnInsert: { jobId } },
      { new: true, upsert: true }
    );

    await pushAdminProgressToJobApplications(
      jobId,
      10,
      `Admin assigned workers and created coordination group (${allAssignedWorkerIds.length}/${requiredWorkers})`
    );

    const shouldMarkFilled = allAssignedWorkerIds.length >= requiredWorkers;
    if (shouldMarkFilled && job.jobStatus === 'open') {
      await Job.findByIdAndUpdate(jobId, {
        jobStatus: 'filled',
        isApproved: true,
        approvedBy: req.userId,
        approvedAt: new Date(),
      });
    }

    return res.status(200).json({
      message: 'Workers assigned successfully and coordination group created',
      assignmentGroup,
      assignedCount: allAssignedWorkerIds.length,
      requiredWorkers,
      newlyAssignedApplications: createdApplications.length,
    });
  } catch (error) {
    console.error('ASSIGN WORKERS ERROR:', error);
    return res.status(500).json({ message: 'Error assigning workers to job', error: error.message });
  }
};

// List assignment groups with progress and payment visibility
exports.getAssignmentGroups = async (req, res) => {
  try {
    const groups = await AssignmentGroup.find()
      .populate('jobId', 'title description numberOfPositions workType jobStatus startDate endDate')
      .populate({
        path: 'employerId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'assignedWorkerIds',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    const enrichedGroups = [];

    for (const group of groups) {
      const jobId = group.jobId?._id;
      if (!jobId) continue;

      const jobApplications = await Application.find({ jobId })
        .select('status progressUpdates')
        .lean();

      const acceptedApplications = jobApplications.filter((a) => ['accepted', 'completed'].includes(a.status)).length;

      const completedApplications = jobApplications.filter((a) => a.status === 'completed').length;

      const pendingPayments = await Payment.countDocuments({
        applicationId: { $in: await Application.find({ jobId }).distinct('_id') },
        status: { $in: ['pending', 'advance_paid'] },
      });

      const paidPayments = await Payment.countDocuments({
        applicationId: { $in: await Application.find({ jobId }).distinct('_id') },
        status: 'completed',
      });

      const assignmentStatus = calculateGroupStatus({
        requiredWorkers: group.requiredWorkers,
        assignedWorkersCount: group.assignedWorkerIds?.length || 0,
        completedApplications,
        pendingPayments,
        paidPayments,
      });

      const assignedWorkersCount = group.assignedWorkerIds?.length || 0;

      let autoWorkStatus = 'pending';
      if (completedApplications > 0 && completedApplications >= assignedWorkersCount && assignedWorkersCount > 0) {
        autoWorkStatus = 'completed';
      } else if (acceptedApplications > 0) {
        autoWorkStatus = 'ongoing';
      }

      let autoPaymentStatus = 'not_due';
      if (paidPayments >= assignedWorkersCount && assignedWorkersCount > 0) {
        autoPaymentStatus = 'distributed_to_workers';
      } else if (pendingPayments > 0) {
        autoPaymentStatus = 'received_on_platform';
      } else if (completedApplications > 0) {
        autoPaymentStatus = 'awaiting_employer_payment';
      }

      const recentUpdates = jobApplications
        .flatMap((application) => (application.progressUpdates || []).map((update) => ({
          ...update,
          applicationStatus: application.status,
        })))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .slice(0, 5);

      enrichedGroups.push({
        ...group.toObject(),
        assignmentStatus,
        autoWorkStatus,
        autoPaymentStatus,
        recentUpdates,
        progress: {
          requiredWorkers: group.requiredWorkers,
          assignedWorkers: assignedWorkersCount,
          acceptedApplications,
          completedApplications,
          pendingPayments,
          paidPayments,
        },
      });
    }

    res.status(200).json({ groups: enrichedGroups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment groups', error: error.message });
  }
};

// Update assignment verification after admin call/message with employer
exports.updateAssignmentVerification = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { verificationStatus, verificationMethod, employerContactStatus, adminNotes } = req.body;

    const allowedVerificationStatuses = ['not_started', 'contacted', 'verified', 'rejected'];
    const allowedVerificationMethods = ['call', 'message', 'call_and_message', 'other', ''];
    const allowedContactStatuses = ['not_contacted', 'contacted', 'confirmed'];

    if (verificationStatus && !allowedVerificationStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verificationStatus' });
    }

    if (verificationMethod !== undefined && !allowedVerificationMethods.includes(verificationMethod)) {
      return res.status(400).json({ message: 'Invalid verificationMethod' });
    }

    if (employerContactStatus && !allowedContactStatuses.includes(employerContactStatus)) {
      return res.status(400).json({ message: 'Invalid employerContactStatus' });
    }

    const update = {};
    if (verificationStatus) update.verificationStatus = verificationStatus;
    if (verificationMethod !== undefined) update.verificationMethod = verificationMethod;
    if (employerContactStatus) update.employerContactStatus = employerContactStatus;
    if (typeof adminNotes === 'string') update.adminNotes = adminNotes;

    const group = await AssignmentGroup.findByIdAndUpdate(groupId, update, { new: true });
    if (!group) {
      return res.status(404).json({ message: 'Assignment group not found' });
    }

    if (verificationStatus) {
      await pushAdminProgressToJobApplications(
        group.jobId,
        verificationStatus === 'verified' ? 20 : verificationStatus === 'rejected' ? 0 : 15,
        `Admin verification updated: ${verificationStatus}`
      );
    }

    return res.status(200).json({ message: 'Verification updated successfully', group });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating verification', error: error.message });
  }
};

// Update assignment work status
exports.updateAssignmentWorkStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { workStatus } = req.body;

    const allowed = ['pending', 'ongoing', 'completed'];
    if (!allowed.includes(workStatus)) {
      return res.status(400).json({ message: 'Invalid workStatus' });
    }

    const group = await AssignmentGroup.findByIdAndUpdate(
      groupId,
      {
        workStatus,
        assignmentStatus: workStatus === 'completed' ? 'completed' : workStatus === 'ongoing' ? 'in_progress' : 'assigned',
      },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Assignment group not found' });
    }

    const progressByWorkStatus = {
      pending: 20,
      ongoing: 50,
      completed: 100,
    };

    await pushAdminProgressToJobApplications(
      group.jobId,
      progressByWorkStatus[workStatus] || 20,
      `Admin updated group work status: ${workStatus}`
    );

    return res.status(200).json({ message: 'Work status updated successfully', group });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating work status', error: error.message });
  }
};

// Update payment lifecycle status for assignment group
exports.updateAssignmentPaymentStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { paymentStatus, paymentPerWorker, platformTotalPayment } = req.body;

    const allowed = ['not_due', 'awaiting_employer_payment', 'received_on_platform', 'distributed_to_workers'];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid paymentStatus' });
    }

    const statusMap = {
      not_due: 'assigned',
      awaiting_employer_payment: 'payment_pending',
      received_on_platform: 'payment_received',
      distributed_to_workers: 'workers_paid',
    };

    const update = {
      paymentStatus,
      assignmentStatus: statusMap[paymentStatus],
    };

    if (typeof paymentPerWorker === 'number' && paymentPerWorker >= 0) {
      update.paymentPerWorker = paymentPerWorker;
    }

    if (typeof platformTotalPayment === 'number' && platformTotalPayment >= 0) {
      update.platformTotalPayment = platformTotalPayment;
    }

    const group = await AssignmentGroup.findByIdAndUpdate(
      groupId,
      update,
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Assignment group not found' });
    }

    const progressByPaymentStatus = {
      not_due: 40,
      awaiting_employer_payment: 60,
      received_on_platform: 80,
      distributed_to_workers: 100,
    };

    await pushAdminProgressToJobApplications(
      group.jobId,
      progressByPaymentStatus[paymentStatus] || 50,
      `Admin updated payment stage: ${paymentStatus}`
    );

    return res.status(200).json({ message: 'Payment status updated successfully', group });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};
