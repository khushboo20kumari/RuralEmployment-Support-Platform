const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getAllWorkersAdmin,
  getAllEmployersAdmin,
  getAllJobsAdmin,
  approveJob,
  rejectJob,
  getPendingJobs,
  getAllApplicationsAdmin,
  verifyUser,
  deleteUser,
  getAllPaymentsAdmin,
  getAnalytics,
} = require('../controllers/adminController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);
router.use(checkUserType(['admin']));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users Management
router.get('/users', getAllUsers);
router.put('/users/:userId/verify', verifyUser);
router.delete('/users/:userId', deleteUser);

// Workers Management
router.get('/workers', getAllWorkersAdmin);

// Employers Management
router.get('/employers', getAllEmployersAdmin);

// Jobs Management
router.get('/jobs', getAllJobsAdmin);
router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:jobId/approve', approveJob);
router.put('/jobs/:jobId/reject', rejectJob);

// Applications Management
router.get('/applications', getAllApplicationsAdmin);

// Payments Management
router.get('/payments', getAllPaymentsAdmin);

module.exports = router;
