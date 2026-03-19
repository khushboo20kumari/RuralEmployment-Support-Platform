const express = require('express');
const { postJob, getAllJobs, getJobById, getEmployerJobs, updateJob, closeJob } = require('../controllers/jobController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes (employer only)
router.post('/', authMiddleware, checkUserType(['employer']), postJob);
router.get('/employer/my-jobs', authMiddleware, checkUserType(['employer']), getEmployerJobs);
router.put('/:id', authMiddleware, checkUserType(['employer']), updateJob);
router.patch('/:id/close', authMiddleware, checkUserType(['employer']), closeJob);

module.exports = router;
