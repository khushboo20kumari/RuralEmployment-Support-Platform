const Employer = require('../models/Employer');

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
