const express = require('express');
const { createReview, getReviewsForUser, getMyReviews } = require('../controllers/reviewController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Create review (authenticated users)
router.post('/', authMiddleware, createReview);

// Get reviews for a specific user
router.get('/user/:userId', getReviewsForUser);

// Get my reviews
router.get('/my-reviews/list', authMiddleware, getMyReviews);

module.exports = router;
