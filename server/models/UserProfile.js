// server/models/UserProfile.js
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       required:
 *         - userId
 *         - fullName
 *       properties:
 *         userId:
 *           type: mongoose.Schema.Types.ObjectId
 *           description: References the UserCredentials document.
 *         fullName:
 *           type: String
 *           description: Full name of the volunteer.
 *           trim: true
 *           minlength: 2
 *         address:
 *           type: String
 *           description: Street address of the volunteer.
 *           trim: true
 *         city:
 *           type: String
 *           description: City of the volunteer.
 *           trim: true
 *         state:
 *           type: String
 *           description: State of the volunteer (e.g., CA, NY).
 *           trim: true
 *           uppercase: true
 *           minlength: 2
 *           maxlength: 2
 *         zipcode:
 *           type: String
 *           description: Zip code of the volunteer.
 *           trim: true
 *           match: /^\d{5}(-\d{4})?$/
 *         skills:
 *           type: [String]
 *           description: Array of skills (e.g., 'First Aid', 'Event Planning').
 *         preferences:
 *           type: [String]
 *           description: Array of preferences (e.g., 'Outdoor Events', 'Working with Children').
 *         availability:
 *           type: [String]
 *           description: Array of availability (e.g., 'Weekends', 'Evenings').
 *       example:
 *         userId: '60d5ec49f8c7a4001c8c4d1a'
 *         fullName: 'Jane Doe'
 *         address: '123 Main St'
 *         city: 'Anytown'
 *         state: 'CA'
 *         zipcode: '90210'
 *         skills: ['First Aid', 'Driving']
 *         preferences: ['Outdoor Events']
 *         availability: ['Weekends']
 */

/**
 * @constant UserProfileSchema
 * @description Mongoose schema for UserProfile collection.
 * Defines the structure and validation rules for volunteer profile data.
 */
const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Link to UserCredentials
    ref: 'UserCredentials', // Reference the UserCredentials model
    required: [true, 'User ID is required for profile'],
    unique: true // Ensure one profile per user
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long']
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || (v.length === 2);
      },
      message: 'State must be exactly 2 characters long'
    },
    default: ''
  },
  zipcode: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{5}(-\d{4})?$/.test(v);
      },
      message: 'Please enter a valid zip code'
    },
    default: ''
  },
  skills: {
    type: [String], // Array of strings
    default: []
  },
  preferences: {
    type: [String], // Array of strings
    default: []
  },
  availability: {
    type: [String], // Array of strings
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
