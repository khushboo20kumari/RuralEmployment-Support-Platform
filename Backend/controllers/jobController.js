const Job = require('../models/Job');
const Employer = require('../models/Employer');
const { translateDescription } = require('../utils/translator');

// Post a Job
exports.postJob = async (req, res) => {
  try {
    const { title, description, titleHi, descriptionHi, skillsRequired, workType, location, salary, workingHours, numberOfPositions, startDate, endDate, experienceRequired, benefits, accommodation, mealProvided } = req.body;

    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Auto-translate if Hindi version not provided
    let translatedTitleHi = titleHi;
    let translatedDescriptionHi = descriptionHi;

    if (!translatedTitleHi) {
      translatedTitleHi = translateDescription(title, 'hi');
    }

    if (!translatedDescriptionHi && description) {
      translatedDescriptionHi = translateDescription(description, 'hi');
    }

    const job = await Job.create({
      employerId: employer._id,
      title,
      description,
      titleHi: translatedTitleHi,
      descriptionHi: translatedDescriptionHi,
      skillsRequired,
      workType,
      location,
      salary,
      workingHours,
      numberOfPositions,
      startDate,
      endDate,
      experienceRequired,
      benefits,
      accommodation,
      mealProvided,
    });

    res.status(201).json({
      message: 'Job posted successfully and sent for admin approval',
      job,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
};

// Get All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { workType, location, minSalary, maxSalary, page = 1, limit = 10 } = req.query;

    let filter = { jobStatus: 'open', isApproved: true };

    if (workType) {
      filter.workType = workType;
    }

    if (location) {
      filter['location.district'] = location;
    }

    if (minSalary || maxSalary) {
      filter['salary.amount'] = {};
      if (minSalary) filter['salary.amount'].$gte = minSalary;
      if (maxSalary) filter['salary.amount'].$lte = maxSalary;
    }

    const jobs = await Job.find(filter)
      .populate('employerId', 'companyName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get Job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'companyName contactPerson');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isApproved) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

// Get Employer's Posted Jobs
exports.getEmployerJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const jobs = await Job.find({ employerId: employer._id }).sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Update Job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, salary, workingHours, numberOfPositions } = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { title, description, salary, workingHours, numberOfPositions },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

// Close Job
exports.closeJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employer = await Employer.findOne({ userId: req.userId });

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to close this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { jobStatus: 'closed' },
      { new: true }
    );

    res.status(200).json({
      message: 'Job closed successfully',
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error closing job', error: error.message });
  }
};
