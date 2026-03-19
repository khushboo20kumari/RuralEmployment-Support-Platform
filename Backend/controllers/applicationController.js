const Application = require('../models/Application');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Payment = require('../models/Payment');

const autoCloseApplicationByEndDate = async (application) => {
  const endDate = application?.jobId?.endDate;
  if (!endDate) return false;
  if (application.status !== 'accepted') return false;

  const now = new Date();
  if (now < new Date(endDate)) return false;

  await Application.findByIdAndUpdate(
    application._id,
    {
      status: 'completed',
      completionDate: now,
      $push: {
        progressUpdates: {
          progressPercent: 100,
          note: 'Work auto-completed as assigned end date reached',
          updatedBy: 'admin',
          updatedAt: now,
        },
      },
    }
  );

  const advancePayment = await Payment.findOne({
    applicationId: application._id,
    status: 'advance_paid',
  }).sort({ createdAt: -1 });

  if (advancePayment) {
    advancePayment.status = 'pending';
    advancePayment.employerFinalPaymentDate = now;
    await advancePayment.save();

    await Application.findByIdAndUpdate(
      application._id,
      {
        $push: {
          progressUpdates: {
            progressPercent: 100,
            note: 'Payment auto-moved to platform after work end date',
            updatedBy: 'admin',
            updatedAt: now,
          },
        },
      }
    );
  }

  return true;
};

// Apply for a Job (Worker)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { appliedMessage } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const worker = await Worker.findOne({ userId: req.userId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ workerId: worker._id, jobId });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      workerId: worker._id,
      jobId,
      employerId: job.employerId,
      appliedMessage,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
};

// Get Worker Applications
exports.getWorkerApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const worker = await Worker.findOne({ userId: req.userId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    let filter = { workerId: worker._id };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title workType salary location startDate endDate')
      .populate('employerId', 'companyName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const autoUpdated = await Promise.all(applications.map((application) => autoCloseApplicationByEndDate(application)));

    const shouldRefetch = autoUpdated.some(Boolean);

    const finalApplications = shouldRefetch
      ? await Application.find(filter)
        .populate('jobId', 'title workType salary location startDate endDate')
        .populate('employerId', 'companyName')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
      : applications;

    const enrichedApplications = await Promise.all(
      finalApplications.map(async (application) => {
        const latestPayment = await Payment.findOne({ applicationId: application._id })
          .select('status paymentType amount netAmount updatedAt createdAt completionPaymentDate adminReleaseDate employerFinalPaymentDate')
          .sort({ createdAt: -1 });

        return {
          ...application.toObject(),
          latestPayment,
        };
      })
    );

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      applications: enrichedApplications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Get Job Applications (Employer)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to view these applications' });
    }

    let filter = { jobId };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title startDate endDate salary')
      .populate('workerId', 'skills experience averageRating')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const autoUpdated = await Promise.all(applications.map((application) => autoCloseApplicationByEndDate(application)));

    const shouldRefetch = autoUpdated.some(Boolean);

    const finalApplications = shouldRefetch
      ? await Application.find(filter)
        .populate('jobId', 'title startDate endDate salary')
        .populate('workerId', 'skills experience averageRating')
        .populate({
          path: 'workerId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
      : applications;

    const enrichedApplications = await Promise.all(
      finalApplications.map(async (application) => {
        const latestPayment = await Payment.findOne({ applicationId: application._id })
          .select('status paymentType amount netAmount updatedAt createdAt completionPaymentDate adminReleaseDate employerFinalPaymentDate')
          .sort({ createdAt: -1 });

        return {
          ...application.toObject(),
          latestPayment,
        };
      })
    );

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      applications: enrichedApplications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Update Application Status (Employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, employerNotes, rejectionReason } = req.body;

    const allowedStatuses = ['shortlisted', 'rejected', 'accepted', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }

    const updateData = { status, employerNotes };

    if (status === 'accepted') {
      updateData.acceptedDate = new Date();
      updateData.workStarted = false;
    }

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'completed') {
      updateData.completionDate = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
};

// Start Work (Employer)
exports.startWork = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to start this work' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications can be started' });
    }

    if (application.workStarted) {
      return res.status(400).json({ message: 'Work has already been started' });
    }

    application.workStarted = true;
    application.workStartedDate = new Date();
    application.startDate = new Date();
    application.progressUpdates.push({
      progressPercent: 10,
      note: 'Employer started the work',
      updatedBy: 'employer',
      updatedAt: new Date(),
    });
    await application.save();

    return res.status(200).json({
      message: 'Work started successfully',
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error starting work', error: error.message });
  }
};

// Mark Application as Completed (Worker)
exports.markJobAsCompleted = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'अर्ज़ी नहीं मिली' });
    }

    const worker = await Worker.findOne({ userId: req.userId });

    if (application.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'आपको यह अनुमति नहीं है' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'सिर्फ स्वीकृत काम को पूरा किया जा सकता है' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { 
        status: 'completed',
        completionDate: new Date(),
        $push: {
          progressUpdates: {
            progressPercent: 100,
            note: 'Worker marked work as completed',
            updatedBy: 'worker',
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate('jobId', 'title salary');

    res.status(200).json({
      message: 'काम सफलतापूर्वक पूरा किया गया। अब मालिक को अंतिम भुगतान जारी करना है।',
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: 'काम पूरा करने में दिक्कत हुई', error: error.message });
  }
};

// Mark Attendance (Employer - once per day per accepted application)
exports.markAttendance = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to mark attendance for this application' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Attendance can be marked only for accepted jobs' });
    }

    if (!application.workStarted) {
      return res.status(400).json({ message: 'Start work first, then mark daily attendance' });
    }

    const today = new Date();
    const alreadyMarkedToday = (application.attendanceRecords || []).some((record) => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === today.toDateString();
    });

    if (alreadyMarkedToday) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    application.attendanceRecords.push({ date: today, status: 'present', markedBy: 'employer' });
    application.attendanceCount = (application.attendanceCount || 0) + 1;
    application.lastAttendanceDate = today;
    application.progressUpdates.push({
      progressPercent: Math.min(95, Math.max(15, application.attendanceCount * 10)),
      note: `Attendance marked by employer (day ${application.attendanceCount})`,
      updatedBy: 'employer',
      updatedAt: new Date(),
    });
    await application.save();

    return res.status(200).json({
      message: 'Attendance marked successfully',
      attendanceCount: application.attendanceCount,
      lastAttendanceDate: application.lastAttendanceDate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

// Mark Application as Completed (Employer)
exports.completeByEmployer = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to complete this work' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted work can be completed' });
    }

    application.status = 'completed';
    application.completionDate = new Date();
    application.progressUpdates.push({
      progressPercent: 100,
      note: 'Employer confirmed work completed',
      updatedBy: 'employer',
      updatedAt: new Date(),
    });

    const existingAdvancePayment = await Payment.findOne({
      applicationId: application._id,
      status: 'advance_paid',
    }).sort({ createdAt: -1 });

    if (existingAdvancePayment) {
      existingAdvancePayment.status = 'pending';
      existingAdvancePayment.employerFinalPaymentDate = new Date();
      await existingAdvancePayment.save();

      application.progressUpdates.push({
        progressPercent: 100,
        note: 'Payment moved to platform for worker payout',
        updatedBy: 'employer',
        updatedAt: new Date(),
      });
    }

    await application.save();

    return res.status(200).json({
      message: existingAdvancePayment
        ? 'Work completed and payment moved to platform successfully.'
        : 'Work marked as completed. Advance payment was not found on platform.',
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error completing work', error: error.message });
  }
};

// Update Work Progress (Worker)
exports.updateWorkProgress = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { progressPercent, note } = req.body;

    if (typeof progressPercent !== 'number' || progressPercent < 0 || progressPercent > 100) {
      return res.status(400).json({ message: 'progressPercent must be a number between 0 and 100' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const worker = await Worker.findOne({ userId: req.userId });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    if (application.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this work progress' });
    }

    if (!['accepted', 'completed'].includes(application.status)) {
      return res.status(400).json({ message: 'Progress can be updated only for accepted/completed work' });
    }

    application.progressUpdates.push({
      progressPercent,
      note: note || '',
      updatedBy: 'worker',
      updatedAt: new Date(),
    });

    if (progressPercent >= 100 && application.status === 'accepted') {
      application.status = 'completed';
      application.completionDate = new Date();
    }

    await application.save();

    return res.status(200).json({
      message: 'Work progress updated successfully',
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating work progress', error: error.message });
  }
};

// Cancel Application (Worker)
exports.cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const worker = await Worker.findOne({ userId: req.userId });

    if (application.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to cancel this application' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status: 'cancelled' },
      { new: true }
    );

    res.status(200).json({
      message: 'Application cancelled successfully',
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling application', error: error.message });
  }
};
