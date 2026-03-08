const express = require('express');
const { getWorkerProfile, updateWorkerProfile, uploadIdProof, getAllWorkers, getWorkerById } = require('../controllers/workerController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);

// Protected routes (worker only)
router.get('/profile/me', authMiddleware, checkUserType(['worker']), getWorkerProfile);
router.put('/profile/update', authMiddleware, checkUserType(['worker']), updateWorkerProfile);
router.post('/upload-id-proof', authMiddleware, checkUserType(['worker']), uploadIdProof);

module.exports = router;
