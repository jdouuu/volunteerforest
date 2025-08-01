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
  const { userId, password } = req.body;

  if (!userId || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await UserCredentials.findOne({ userId });
  if (userExists) {
    res.status(400);
    throw new Error('User  ID already registered');
  }

  const user = await UserCredentials.create({
    userId,
    password,
  });

  if (user) {
    await UserProfile.create({
      userId: user._id,
      fullName: 'New Volunteer',
    });

    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      token: generateToken(user._id),
      message: 'User  registered successfully. Please complete your profile.',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const loginUser  = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  const user = await UserCredentials.findOne({ userId });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      userId: user.userId,
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
