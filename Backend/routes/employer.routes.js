const express = require('express');
const {
	getEmployerProfile,
	updateEmployerProfile,
	uploadBusinessDocument,
	getAllEmployers,
	getEmployerById,
	getEmployerAssignmentGroups,
} = require('../controllers/employerController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Protected routes (employer only)
router.get('/profile/me', authMiddleware, checkUserType(['employer']), getEmployerProfile);
router.get('/assignment-groups', authMiddleware, checkUserType(['employer']), getEmployerAssignmentGroups);
router.put('/profile/update', authMiddleware, checkUserType(['employer']), updateEmployerProfile);
router.post('/upload-document', authMiddleware, checkUserType(['employer']), uploadBusinessDocument);

// Public routes
router.get('/', getAllEmployers);
router.get('/:id', getEmployerById);

module.exports = router;
