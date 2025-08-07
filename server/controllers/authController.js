// server/controllers/authController.js
const UserCredentials = require('../models/UserCredentials');
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const registerUser  = asyncHandler(async (req, res) => {
  const { userId, password, role = 'volunteer' } = req.body;

  if (!userId || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await UserCredentials.findOne({ userId, role });
  if (userExists) {
    res.status(400);
    throw new Error('User ID already registered for this role');
  }

  // Legacy user without role present
  const legacy = await UserCredentials.findOne({ userId, role: { $exists: false } });
  if (legacy && role === 'volunteer') {
    legacy.password = password; // will be hashed by pre-save hook
    legacy.role = 'volunteer';
    await legacy.save();

    let userProfile = await UserProfile.findOne({ userId: legacy._id });
    if (!userProfile) {
      userProfile = await UserProfile.create({
        userId: legacy._id,
        fullName: 'New Volunteer',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        skills: [],
        preferences: [],
        availability: [],
      });
    }

    return res.status(201).json({
      _id: legacy._id,
      userId: legacy.userId,
      profile: userProfile,
      role: legacy.role,
      token: generateToken(legacy._id),
      message: 'User registered successfully. Please complete your profile.',
    });
  }

  const user = await UserCredentials.create({ userId, password, role });

  if (user) {
    const userProfile = await UserProfile.create({
      userId: user._id,
      fullName: 'New Volunteer',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      skills: [],
      preferences: [],
      availability: [],
    });

    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      profile: userProfile,
      token: generateToken(user._id),
      role: user.role,
      message: 'User registered successfully. Please complete your profile.',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const loginUser  = asyncHandler(async (req, res) => {
  const { userId, password, role = 'volunteer' } = req.body;

  let user = await UserCredentials.findOne({ userId, role });
  // Legacy support: if no role-based credential exists, try legacy record and migrate to volunteer
  if (!user) {
    const legacy = await UserCredentials.findOne({ userId, role: { $exists: false } });
    if (legacy && role === 'volunteer') {
      legacy.role = 'volunteer';
      await legacy.save();
      user = legacy;
    }
  }

  if (user && (await user.matchPassword(password))) {
    // Fetch the user profile to get complete information
    const userProfile = await UserProfile.findOne({ userId: user._id });
    
    res.json({
      _id: user._id,
      userId: user.userId,
      role: user.role,
      profile: userProfile,
      token: generateToken(user._id),
      message: 'Logged in successfully',
    });
  } else {
    res.status(401);
    throw new Error('Invalid user ID or password');
  }
});

const getMe = asyncHandler(async (req, res) => {
  const user = await UserCredentials.findById(req.user._id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      userId: user.userId,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User  not found');
  }
});

module.exports = {
  registerUser ,
  loginUser ,
  getMe,
};
