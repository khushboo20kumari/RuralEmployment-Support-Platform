const express = require('express');
const {
	applyForJob,
	getWorkerApplications,
	getJobApplications,
	updateApplicationStatus,
	cancelApplication,
	markJobAsCompleted,
	markAttendance,
	startWork,
	completeByEmployer,
	updateWorkProgress,
} = require('../controllers/applicationController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Worker routes
router.post('/apply/:jobId', authMiddleware, checkUserType(['worker']), applyForJob);
router.get('/my-applications/list', authMiddleware, checkUserType(['worker']), getWorkerApplications);
router.put('/:applicationId/complete', authMiddleware, checkUserType(['worker']), markJobAsCompleted);
router.put('/:applicationId/progress', authMiddleware, checkUserType(['worker']), updateWorkProgress);
router.delete('/:applicationId/cancel', authMiddleware, checkUserType(['worker']), cancelApplication);

// Employer routes
router.get('/job/:jobId/applications', authMiddleware, checkUserType(['employer']), getJobApplications);
router.put('/:applicationId/status', authMiddleware, checkUserType(['employer']), updateApplicationStatus);
router.put('/:applicationId/start-work', authMiddleware, checkUserType(['employer']), startWork);
router.put('/:applicationId/attendance', authMiddleware, checkUserType(['employer']), markAttendance);
router.put('/:applicationId/employer-complete', authMiddleware, checkUserType(['employer']), completeByEmployer);

module.exports = router;
