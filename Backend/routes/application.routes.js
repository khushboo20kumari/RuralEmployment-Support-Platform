const express = require('express');
const { applyForJob, getWorkerApplications, getJobApplications, updateApplicationStatus, cancelApplication, markJobAsCompleted, markAttendance } = require('../controllers/applicationController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Worker routes
router.post('/apply/:jobId', authMiddleware, checkUserType(['worker']), applyForJob);
router.get('/my-applications/list', authMiddleware, checkUserType(['worker']), getWorkerApplications);
router.put('/:applicationId/complete', authMiddleware, checkUserType(['worker']), markJobAsCompleted);
router.put('/:applicationId/attendance', authMiddleware, checkUserType(['worker']), markAttendance);
router.delete('/:applicationId/cancel', authMiddleware, checkUserType(['worker']), cancelApplication);

// Employer routes
router.get('/job/:jobId/applications', authMiddleware, checkUserType(['employer']), getJobApplications);
router.put('/:applicationId/status', authMiddleware, checkUserType(['employer']), updateApplicationStatus);

module.exports = router;
