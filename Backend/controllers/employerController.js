const Employer = require('../models/Employer');
const AssignmentGroup = require('../models/AssignmentGroup');
const Application = require('../models/Application');
const Payment = require('../models/Payment');

// Get Employer Profile
exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    res.status(200).json({ employer });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update Employer Profile
exports.updateEmployerProfile = async (req, res) => {
  try {
    const { companyName, companyType, contactPerson, websiteUrl } = req.body;

    const employer = await Employer.findOneAndUpdate(
      { userId: req.userId },
      {
        companyName,
        companyType,
        contactPerson,
        websiteUrl,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Employer profile updated successfully',
      employer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Upload Business Document
exports.uploadBusinessDocument = async (req, res) => {
  try {
    const { businessRegistration } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }

    const employer = await Employer.findOneAndUpdate(
      { userId: req.userId },
      {
        businessRegistration,
        businessDocument: req.file.path,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Business document uploaded successfully',
      employer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

// Get All Employers
exports.getAllEmployers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const employers = await Employer.find({ isActive: true })
      .populate('userId', 'name email phone address')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employer.countDocuments({ isActive: true });

    res.status(200).json({
      employers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employers', error: error.message });
  }
};

// Get Employer by ID
exports.getEmployerById = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).populate('userId', 'name email phone address');

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.status(200).json({ employer });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employer', error: error.message });
  }
};

// Get employer assignment groups with progress/payment visibility
exports.getEmployerAssignmentGroups = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const groups = await AssignmentGroup.find({ employerId: employer._id })
      .populate('jobId', 'title workType numberOfPositions jobStatus location salary startDate endDate')
      .populate({
        path: 'assignedWorkerIds',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ updatedAt: -1 });

    const result = [];

    for (const group of groups) {
      const jobId = group.jobId?._id;
      if (!jobId) continue;

      const jobApplications = await Application.find({ jobId })
        .select('status progressUpdates')
        .lean();

      const applicationIds = jobApplications.map((a) => a._id);
      const completedApplications = jobApplications.filter((a) => a.status === 'completed').length;
      const acceptedApplications = jobApplications.filter((a) => ['accepted', 'completed'].includes(a.status)).length;

      const pendingPayments = await Payment.countDocuments({
        applicationId: { $in: applicationIds },
        status: { $in: ['pending', 'advance_paid'] },
      });

      const completedPayments = await Payment.countDocuments({
        applicationId: { $in: applicationIds },
        status: 'completed',
      });

      const assignedWorkersCount = group.assignedWorkerIds?.length || 0;

      let autoWorkStatus = 'pending';
      if (completedApplications > 0 && completedApplications >= assignedWorkersCount && assignedWorkersCount > 0) {
        autoWorkStatus = 'completed';
      } else if (acceptedApplications > 0) {
        autoWorkStatus = 'ongoing';
      }

      let autoPaymentStatus = 'not_due';
      if (completedPayments >= assignedWorkersCount && assignedWorkersCount > 0) {
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

      result.push({
        ...group.toObject(),
        autoWorkStatus,
        autoPaymentStatus,
        recentUpdates,
        progress: {
          requiredWorkers: group.requiredWorkers,
          assignedWorkers: assignedWorkersCount,
          acceptedApplications,
          completedApplications,
          pendingPayments,
          completedPayments,
        },
      });
    }

    return res.status(200).json({ groups: result });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching assignment groups', error: error.message });
  }
};
