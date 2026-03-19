const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const Worker = require('../models/Worker');
const Application = require('../models/Application');

const getTwoUserChatQuery = (userA, userB) => ({
  $or: [
    { participants: { $all: [userA, userB] } },
    { workerId: userA, employerId: userB },
    { workerId: userB, employerId: userA },
  ],
});

const resolveUserAlias = async (userIdOrAlias) => {
  if (String(userIdOrAlias) !== 'admin') {
    return userIdOrAlias;
  }

  const adminUser = await User.findOne({ userType: 'admin' }).select('_id');
  if (!adminUser) {
    throw new Error('Admin contact not available');
  }

  return adminUser._id;
};

const getOrCreateSupportGroupChat = async ({ userId, jobId }) => {
  const requester = await User.findById(userId).select('userType');
  if (!requester) {
    throw new Error('Requester not found');
  }

  const job = await Job.findById(jobId)
    .populate({
      path: 'employerId',
      populate: { path: 'userId', select: '_id name email phone userType' },
    });

  if (!job) {
    throw new Error('Job not found');
  }

  const employerUserId = job.employerId?.userId?._id?.toString();

  let isAllowed = requester.userType === 'admin' || employerUserId === String(userId);

  if (!isAllowed && requester.userType === 'worker') {
    const workerProfile = await Worker.findOne({ userId });
    if (workerProfile) {
      const hasApplication = await Application.exists({
        jobId,
        workerId: workerProfile._id,
        status: { $in: ['accepted', 'completed'] },
      });
      isAllowed = !!hasApplication;
    }
  }

  if (!isAllowed) {
    throw new Error('You are not allowed to access this support group');
  }

  const adminUsers = await User.find({ userType: 'admin' }).select('_id');
  const adminIds = adminUsers.map((a) => a._id.toString());

  const acceptedApplications = await Application.find({
    jobId,
    status: { $in: ['accepted', 'completed'] },
  }).populate({ path: 'workerId', select: 'userId' });

  const workerUserIds = acceptedApplications
    .map((a) => a.workerId?.userId?.toString())
    .filter(Boolean);

  const participants = [...new Set([
    ...adminIds,
    employerUserId,
    ...workerUserIds,
  ].filter(Boolean))];

  let chat = await Chat.findOne({ chatType: 'group', jobId, isActive: true });

  if (!chat) {
    chat = await Chat.create({
      chatType: 'group',
      groupName: `${job.title} Support Group`,
      participants,
      jobId,
      lastMessage: 'Support group created for this job.',
      lastMessageTime: new Date(),
      lastMessageSenderId: userId,
    });
  } else {
    const mergedParticipants = [...new Set([...(chat.participants || []).map((p) => p.toString()), ...participants])];
    chat.participants = mergedParticipants;
    if (!chat.groupName) {
      chat.groupName = `${job.title} Support Group`;
    }
    await chat.save();
  }

  return chat;
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, jobId } = req.body;
    const senderId = req.userId;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'संदेश और प्राप्तकर्ता आवश्यक हैं' });
    }

    const resolvedReceiverId = await resolveUserAlias(receiverId);

    // Check if receiver exists
    const receiver = await User.findById(resolvedReceiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'प्राप्तकर्ता नहीं मिला' });
    }

    // Find or create chat
    let chat = await Chat.findOne(getTwoUserChatQuery(senderId, resolvedReceiverId));

    if (!chat) {
      const sender = await User.findById(senderId);
      const senderType = sender?.userType;
      const receiverType = receiver?.userType;

      const workerId = senderType === 'worker'
        ? senderId
        : receiverType === 'worker'
        ? resolvedReceiverId
        : undefined;

      const employerId = senderType === 'employer'
        ? senderId
        : receiverType === 'employer'
        ? resolvedReceiverId
        : undefined;
      
      chat = await Chat.create({
        participants: [senderId, resolvedReceiverId],
        workerId,
        employerId,
        jobId,
        lastMessage: message,
        lastMessageTime: new Date(),
        lastMessageSenderId: senderId,
      });
    } else {
      // Update last message
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: message,
        lastMessageTime: new Date(),
        lastMessageSenderId: senderId,
      });
    }

    // Create message
    const newMessage = await Message.create({
      chatId: chat._id,
      senderId,
      receiverId: resolvedReceiverId,
      message,
      messageType: 'direct',
    });

    res.status(201).json({
      message: 'संदेश भेजा गया',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ message: 'संदेश भेजने में त्रुटि', error: error.message });
  }
};

// Get chat messages
exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 50 } = req.query;

    const resolvedOtherUserId = await resolveUserAlias(otherUserId);

    // Find chat
    const chat = await Chat.findOne(getTwoUserChatQuery(userId, resolvedOtherUserId));

    if (!chat) {
      return res.status(200).json({
        messages: [],
        totalPages: 0,
        currentPage: page,
        chatId: null,
      });
    }

    // Get messages
    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'name userType phone')
      .populate('receiverId', 'name userType phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Mark messages as read
    await Message.updateMany(
      { chatId: chat._id, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const total = await Message.countDocuments({ chatId: chat._id });

    res.status(200).json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      chatId: chat._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'संदेश प्राप्त करने में त्रुटि', error: error.message });
  }
};

// Get all chats for user
exports.getAllChats = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const chats = await Chat.find({
      $or: [
        { participants: userId },
        { workerId: userId },
        { employerId: userId },
      ],
      isActive: true,
    })
      .populate('participants', 'name userType')
      .populate('workerId', 'name userType')
      .populate('employerId', 'name userType')
      .populate('jobId', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastMessageTime: -1 });

    const total = await Chat.countDocuments({
      $or: [
        { participants: userId },
        { workerId: userId },
        { employerId: userId },
      ],
      isActive: true,
    });

    res.status(200).json({
      chats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'चैट प्राप्त करने में त्रुटि', error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'अपठित संदेश गिनने में त्रुटि', error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.status(200).json({ message: 'संदेश पढ़ा गया हुआ', data: message });
  } catch (error) {
    res.status(500).json({ message: 'संदेश चिह्नित करने में त्रुटि', error: error.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Chat.findByIdAndUpdate(chatId, { isActive: false });
    await Message.deleteMany({ chatId });

    res.status(200).json({ message: 'चैट हटा दिया गया' });
  } catch (error) {
    res.status(500).json({ message: 'चैट हटाने में त्रुटि', error: error.message });
  }
};

// Get one admin contact for worker/employer support chat
exports.getAdminContact = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Prefer admin user who already has an active chat with current user
    const existingChats = await Chat.find({
      isActive: true,
      $or: [
        { participants: currentUserId },
        { workerId: currentUserId },
        { employerId: currentUserId },
      ],
    })
      .populate('participants', '_id name email phone userType')
      .sort({ lastMessageTime: -1 });

    let adminUser = null;

    for (const chat of existingChats) {
      const fromParticipants = (chat.participants || []).find((participant) => participant.userType === 'admin');
      if (fromParticipants) {
        adminUser = fromParticipants;
        break;
      }
    }

    // Fallback to any admin
    if (!adminUser) {
      adminUser = await User.findOne({ userType: 'admin' }).select('_id name email phone userType');
    }

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin contact not available' });
    }

    return res.status(200).json({ admin: adminUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin contact', error: error.message });
  }
};

// Get or create support group chat for a job
exports.getOrCreateJobSupportGroup = async (req, res) => {
  try {
    const { jobId } = req.params;
    const chat = await getOrCreateSupportGroupChat({ userId: req.userId, jobId });

    return res.status(200).json({ chat });
  } catch (error) {
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('not allowed')) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error opening support group', error: error.message });
  }
};

// Get group messages
exports.getGroupMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId).populate('jobId', 'title');
    if (!chat || chat.chatType !== 'group' || !chat.isActive) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    const isParticipant = (chat.participants || []).some((p) => p.toString() === String(req.userId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this group' });
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'name userType phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ chatId: chat._id });

    return res.status(200).json({
      chat,
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching group messages', error: error.message });
  }
};

// Send group message
exports.sendGroupMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || chat.chatType !== 'group' || !chat.isActive) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    const isParticipant = (chat.participants || []).some((p) => p.toString() === String(req.userId));
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this group' });
    }

    const newMessage = await Message.create({
      chatId: chat._id,
      senderId: req.userId,
      message: String(message).trim(),
      messageType: 'group',
    });

    chat.lastMessage = String(message).trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSenderId = req.userId;
    await chat.save();

    return res.status(201).json({ message: 'Message sent', data: newMessage });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending group message', error: error.message });
  }
};
