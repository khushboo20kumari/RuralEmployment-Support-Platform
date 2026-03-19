const express = require('express');
const {
  sendMessage,
  getMessages,
  getAllChats,
  getUnreadCount,
  markAsRead,
  deleteChat,
  getAdminContact,
  getOrCreateJobSupportGroup,
  getGroupMessages,
  sendGroupMessage,
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/send', sendMessage);

// Get all chats
router.get('/', getAllChats);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Get admin support contact
router.get('/admin/contact', getAdminContact);

// Group chat routes
router.get('/group/job/:jobId', getOrCreateJobSupportGroup);
router.get('/group/:chatId', getGroupMessages);
router.post('/group/:chatId/send', sendGroupMessage);

// Get messages with specific user
router.get('/:otherUserId', getMessages);

// Mark message as read
router.put('/:messageId/read', markAsRead);

// Delete chat
router.delete('/:chatId', deleteChat);

module.exports = router;
