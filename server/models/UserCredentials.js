// server/models/UserCredentials.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       required:
 *         - userId
 *         - password
 *       properties:
 *         userId:
 *           type: String
 *           description: Unique identifier for the user (e.g., username or email).
 *           unique: true
 *           trim: true
 *           minlength: 3
 *         password:
 *           type: String
 *           description: Hashed password for the user.
 *           minlength: 6
 *       example:
 *         userId: 'john.doe@example.com'
 *         password: 'hashedpassword123'
 */

/**
 * @constant UserCredentialsSchema
 * @description Mongoose schema for UserCredentials collection.
 * Defines the structure and validation rules for user authentication data.
 */
const UserCredentialsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    minlength: [3, 'User ID must be at least 3 characters long'],
    // Basic email validation if userId is intended to be an email
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address for User ID']
  },
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer',
    required: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // In a real application, you'd add fields for email verification status, reset tokens, etc.
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Ensure unique combination of (userId, role)
UserCredentialsSchema.index({ userId: 1, role: 1 }, { unique: true });

/**
 * @function pre-save hook
 * @description Hashes the password before saving the UserCredentials document.
 * Only hashes if the password has been modified.
 */
UserCredentialsSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @method matchPassword
 * @description Compares the given password with the hashed password in the database.
 * @param {string} enteredPassword - The password entered by the user.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
UserCredentialsSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('UserCredentials', UserCredentialsSchema);
