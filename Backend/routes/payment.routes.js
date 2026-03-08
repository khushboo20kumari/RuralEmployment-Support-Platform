const express = require('express');
const {
	createAdvancePayment,
	releasePayment,
	getWorkerPayments,
	getEmployerPayments,
	getPlatformRevenue,
	getPaymentDetails,
	getEligibleApplicationsForPayment,
} = require('../controllers/paymentController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Employer routes
router.post('/advance', authMiddleware, checkUserType(['employer']), createAdvancePayment);
router.get('/my-payments/list', authMiddleware, checkUserType(['employer']), getEmployerPayments);
router.get('/eligible-applications/list', authMiddleware, checkUserType(['employer']), getEligibleApplicationsForPayment);

// Worker routes
router.get('/worker/earnings', authMiddleware, checkUserType(['worker']), getWorkerPayments);

// Release payment (employer)
router.put('/:paymentId/release', authMiddleware, checkUserType(['employer']), releasePayment);

// Admin routes (can be protected differently)
router.get('/platform/revenue', authMiddleware, checkUserType(['admin']), getPlatformRevenue);

// Get payment details
router.get('/:paymentId/details', authMiddleware, getPaymentDetails);

module.exports = router;
