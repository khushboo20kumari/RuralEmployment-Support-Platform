const User = require('../models/User');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, userType, village, district, state, pincode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (typeof confirmPassword !== 'undefined' && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedUserType = ['worker', 'employer'].includes(userType) ? userType : 'worker';

    // Check if user already exists
    const existingUserFilter = phone
      ? { $or: [{ email: normalizedEmail }, { phone }] }
      : { email: normalizedEmail };
    const existingUser = await User.findOne(existingUserFilter);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      userType: normalizedUserType,
      address: {
        village,
        district,
        state,
        pincode,
      },
    });

    // Create worker or employer profile
    if (normalizedUserType === 'worker') {
      await Worker.create({ userId: user._id });
    } else if (normalizedUserType === 'employer') {
      await Employer.create({ userId: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Google Login / Signup
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, userType } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google login is not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub || !payload?.email_verified) {
      return res.status(400).json({ message: 'Invalid Google account data' });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] });
    let isNewUser = false;

    if (!user) {
      const normalizedUserType = ['worker', 'employer', 'admin'].includes(userType) ? userType : 'worker';

      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        authProvider: 'google',
        googleId: payload.sub,
        userType: normalizedUserType,
        profilePicture: payload.picture || null,
        isVerified: true,
      });

      if (normalizedUserType === 'worker') {
        await Worker.create({ userId: user._id });
      } else if (normalizedUserType === 'employer') {
        await Employer.create({ userId: user._id });
      }

      isNewUser = true;
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Google authentication successful',
      token,
      isNewUser,
      needsProfileCompletion: !user.phone,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error with Google authentication', error: error.message });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, userType } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name !== 'undefined') user.name = name;
    if (typeof phone !== 'undefined') user.phone = phone;

    const normalizedUserType = String(userType || '').toLowerCase().trim();
    const isValidUserType = ['worker', 'employer'].includes(normalizedUserType);

    if (isValidUserType && user.userType !== 'admin') {
      user.userType = normalizedUserType;

      if (normalizedUserType === 'worker') {
        const existingWorker = await Worker.findOne({ userId: user._id });
        if (!existingWorker) {
          await Worker.create({ userId: user._id });
        }
      }

      if (normalizedUserType === 'employer') {
        const existingEmployer = await Employer.findOne({ userId: user._id });
        if (!existingEmployer) {
          await Employer.create({ userId: user._id });
        }
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
