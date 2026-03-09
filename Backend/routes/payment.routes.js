const express = require('express');
const {
	createAdvancePayment,
	releasePayment,
	getWorkerPayments,
	getEmployerPayments,
	getPlatformRevenue,
	getPaymentDetails,
	getEligibleApplicationsForPayment,
	createRazorpayOrder,
	verifyRazorpayPayment,
	adminReleaseToWorker,
} = require('../controllers/paymentController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Employer routes
router.post('/advance', authMiddleware, checkUserType(['employer']), createAdvancePayment);
router.get('/my-payments/list', authMiddleware, checkUserType(['employer']), getEmployerPayments);
router.get('/eligible-applications/list', authMiddleware, checkUserType(['employer']), getEligibleApplicationsForPayment);

// Razorpay routes (Employer)
router.post('/razorpay/create-order', authMiddleware, checkUserType(['employer']), createRazorpayOrder);
router.post('/razorpay/verify-payment', authMiddleware, checkUserType(['employer']), verifyRazorpayPayment);

// Worker routes
router.get('/worker/earnings', authMiddleware, checkUserType(['worker']), getWorkerPayments);

// Release payment (employer)
router.put('/:paymentId/release', authMiddleware, checkUserType(['employer']), releasePayment);

// Admin routes (can be protected differently)
router.get('/platform/revenue', authMiddleware, checkUserType(['admin']), getPlatformRevenue);
router.put('/admin/:paymentId/release-to-worker', authMiddleware, checkUserType(['admin']), adminReleaseToWorker);

// Get payment details
router.get('/:paymentId/details', authMiddleware, getPaymentDetails);

module.exports = router;
