const Application = require('../models/Application');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');

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
      .populate('jobId', 'title workType salary location')
      .populate('employerId', 'companyName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      applications,
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
      .populate('workerId', 'skills experience averageRating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      applications,
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

// Mark Attendance (Worker - once per day per accepted application)
exports.markAttendance = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const worker = await Worker.findOne({ userId: req.userId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    if (application.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to mark attendance for this application' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Attendance can be marked only for accepted jobs' });
    }

    const today = new Date();
    const alreadyMarkedToday = (application.attendanceRecords || []).some((record) => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === today.toDateString();
    });

    if (alreadyMarkedToday) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    application.attendanceRecords.push({ date: today, status: 'present' });
    application.attendanceCount = (application.attendanceCount || 0) + 1;
    application.lastAttendanceDate = today;
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
