// server/controllers/userController.js
const UserProfile = require('../models/UserProfile');
const asyncHandler = require('express-async-handler');
const getAllUserProfiles = asyncHandler(async (req, res) => {
  const profiles = await UserProfile.find({}).populate('userId', 'userId');
  if (profiles.length === 0) {
    res.status(404);
    throw new Error('No user profiles found');
  }
  res.json(profiles);
});


/**
 * @route GET /api/users/profile
 * @description Get user profile for the authenticated user.
 * @access Private
 * @param {Object} req - Express request object (contains req.user from protect middleware).
 * @param {Object} res - Express response object.
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userProfile = await UserProfile.findOne({ userId: req.user._id }).populate('userId', 'userId');

  if (userProfile) {
    res.json(userProfile);
  } else {
    res.status(404);
    throw new Error('User  profile not found');
  }
});

/**
 * @route PUT /api/users/profile
 * @description Update user profile for the authenticated user.
 * @access Private
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, address, city, state, zipcode, skills, preferences, availability } = req.body;

  const userProfile = await UserProfile.findOne({ userId: req.user._id });

  if (userProfile) {
    userProfile.fullName = fullName || userProfile.fullName;
    userProfile.address = address || userProfile.address;
    userProfile.city = city || userProfile.city;
    userProfile.state = state || userProfile.state;
    userProfile.zipcode = zipcode || userProfile.zipcode;
    userProfile.skills = skills || userProfile.skills;
    userProfile.preferences = preferences || userProfile.preferences;
    userProfile.availability = availability || userProfile.availability;

    const updatedProfile = await userProfile.save();

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } else {
    res.status(404);
    throw new Error('User  profile not found');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles
};

