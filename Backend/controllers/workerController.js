const Worker = require('../models/Worker');
const User = require('../models/User');

// Get Worker Profile
exports.getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.userId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    res.status(200).json({ worker });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update Worker Profile
exports.updateWorkerProfile = async (req, res) => {
  try {
    const { skills, experience, experienceDetails, hourlyRate, dailyRate, monthlyRate, availability, workPreferences } = req.body;

    const worker = await Worker.findOneAndUpdate(
      { userId: req.userId },
      {
        skills,
        experience,
        experienceDetails,
        hourlyRate,
        dailyRate,
        monthlyRate,
        availability,
        workPreferences,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Worker profile updated successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Upload ID Proof
exports.uploadIdProof = async (req, res) => {
  try {
    const { idProofType, idProofNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }

    const worker = await Worker.findOneAndUpdate(
      { userId: req.userId },
      {
        idProof: idProofType,
        idProofNumber,
        idProofDocument: req.file.path,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'ID proof uploaded successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading ID proof', error: error.message });
  }
};

// Get All Workers (for search/filter)
exports.getAllWorkers = async (req, res) => {
  try {
    const { skill, location, availability, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };

    if (skill) {
      filter.skills = { $in: [skill] };
    }

    if (availability) {
      filter.availability = availability;
    }

    const workers = await Worker.find(filter)
      .populate('userId', 'name email phone address')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Worker.countDocuments(filter);

    res.status(200).json({
      workers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error: error.message });
  }
};

// Get Worker by ID
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('userId', 'name email phone address');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.status(200).json({ worker });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker', error: error.message });
  }
};
