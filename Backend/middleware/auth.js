const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const checkUserType = (allowedTypes) => {
  return (req, res, next) => {
    const normalizedUserType = String(req.user.userType || '').trim().toLowerCase();
    const normalizedAllowedTypes = allowedTypes.map((type) => String(type).trim().toLowerCase());

    if (!normalizedAllowedTypes.includes(normalizedUserType)) {
      return res.status(403).json({
        message: `Access denied for role '${req.user.userType}'. Allowed roles: ${allowedTypes.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, checkUserType };
