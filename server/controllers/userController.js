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
  const body = req.body || {};

  const userProfile = await UserProfile.findOne({ userId: req.user._id });

  if (!userProfile) {
    res.status(404);
    throw new Error('User  profile not found');
  }

  // Support multiple client shapes and allow clearing values
  const addressCombined = [body.address1, body.address2].filter(Boolean).join(' ').trim();
  const next = {
    fullName: body.fullName,
    address: body.address ?? (addressCombined || undefined),
    city: body.city,
    state: body.state,
    zipcode: body.zipcode ?? body.zip,
    skills: Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills].flat() : undefined,
    preferences: Array.isArray(body.preferences)
      ? body.preferences
      : typeof body.preferences === 'string'
        ? body.preferences.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
    availability: Array.isArray(body.availability) ? body.availability : undefined,
  };

  // Only assign when property is present (including empty string to allow clearing)
  Object.entries(next).forEach(([key, value]) => {
    if (value !== undefined) {
      userProfile[key] = value;
    }
  });

  const updatedProfile = await userProfile.save();

  res.json({
    message: 'Profile updated successfully',
    profile: updatedProfile,
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles
};
