const Review = require('../models/Review');
const Application = require('../models/Application');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const User = require('../models/User');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { applicationId, rating, comment, punctuality, workQuality, communication, professionalism } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed jobs' });
    }

    const reviewer = await User.findById(req.userId);
    const user = await User.findById(req.userId);

    let reviewType;
    let revieweeId;

    // Determine if reviewer is employer or worker
    if (user.userType === 'employer') {
      const employer = await Employer.findOne({ userId: req.userId });
      if (application.employerId.toString() !== employer._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to review this application' });
      }
      reviewType = 'worker_by_employer';
      revieweeId = application.workerId;
    } else if (user.userType === 'worker') {
      const worker = await Worker.findOne({ userId: req.userId });
      if (application.workerId.toString() !== worker._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to review this application' });
      }
      reviewType = 'employer_by_worker';
      revieweeId = application.employerId;
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reviewerId: req.userId, applicationId });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this application' });
    }

    const review = await Review.create({
      reviewerId: req.userId,
      revieweeId,
      applicationId,
      reviewType,
      rating,
      comment,
      punctuality,
      workQuality,
      communication,
      professionalism,
    });

    // Update average rating
    if (reviewType === 'worker_by_employer') {
      const worker = await Worker.findById(revieweeId);
      const allReviews = await Review.find({ revieweeId, reviewType: 'worker_by_employer' });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Worker.findByIdAndUpdate(revieweeId, { averageRating: avgRating });
    } else {
      const employer = await Employer.findById(revieweeId);
      const allReviews = await Review.find({ revieweeId, reviewType: 'employer_by_worker' });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Employer.findByIdAndUpdate(revieweeId, { averageRating: avgRating });
    }

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get Reviews for a User
exports.getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let reviews;

    if (user.userType === 'worker') {
      reviews = await Review.find({ revieweeId: userId, reviewType: 'worker_by_employer' })
        .populate('reviewerId', 'name')
        .populate('applicationId', 'jobId');
    } else {
      reviews = await Review.find({ revieweeId: userId, reviewType: 'employer_by_worker' })
        .populate('reviewerId', 'name')
        .populate('applicationId', 'jobId');
    }

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    res.status(200).json({
      reviews,
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get My Reviews
exports.getMyReviews = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    let reviews;

    if (user.userType === 'worker') {
      reviews = await Review.find({ revieweeId: user._id, reviewType: 'worker_by_employer' })
        .populate('reviewerId', 'name')
        .populate('applicationId', 'jobId')
        .sort({ createdAt: -1 });
    } else if (user.userType === 'employer') {
      const employer = await Employer.findOne({ userId: req.userId });
      reviews = await Review.find({ revieweeId: employer._id, reviewType: 'employer_by_worker' })
        .populate('reviewerId', 'name')
        .populate('applicationId', 'jobId')
        .sort({ createdAt: -1 });
    }

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    res.status(200).json({
      reviews,
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};
