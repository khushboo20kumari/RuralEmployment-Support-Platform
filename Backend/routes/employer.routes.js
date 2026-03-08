const express = require('express');
const { getEmployerProfile, updateEmployerProfile, uploadBusinessDocument, getAllEmployers, getEmployerById } = require('../controllers/employerController');
const { authMiddleware, checkUserType } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllEmployers);
router.get('/:id', getEmployerById);

// Protected routes (employer only)
router.get('/profile/me', authMiddleware, checkUserType(['employer']), getEmployerProfile);
router.put('/profile/update', authMiddleware, checkUserType(['employer']), updateEmployerProfile);
router.post('/upload-document', authMiddleware, checkUserType(['employer']), uploadBusinessDocument);

module.exports = router;
