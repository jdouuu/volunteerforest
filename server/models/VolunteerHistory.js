// server/models/VolunteerHistory.js
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     VolunteerHistory:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - participationDate
 *         - hoursVolunteered
 *       properties:
 *         userId:
 *           type: mongoose.Schema.Types.ObjectId
 *           description: References the UserCredentials document.
 *         eventId:
 *           type: mongoose.Schema.Types.ObjectId
 *           description: References the EventDetails document.
 *         participationDate:
 *           type: Date
 *           description: Date of volunteer participation.
 *         feedback:
 *           type: String
 *           description: Feedback on the volunteer's performance.
 *           trim: true
 *         hoursVolunteered:
 *           type: Number
 *           description: Number of hours volunteered for the event.
 *           min: 0.1
 *       example:
 *         userId: '60d5ec49f8c7a4001c8c4d1a'
 *         eventId: '60d5ec49f8c7a4001c8c4d1b'
 *         participationDate: '2024-12-01T17:00:00Z'
 *         feedback: 'Excellent work, very dedicated.'
 *         hoursVolunteered: 4.5
 */

/**
 * @constant VolunteerHistorySchema
 * @description Mongoose schema for VolunteerHistory collection.
 * Defines the structure and validation rules for volunteer participation records.
 */
const VolunteerHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCredentials', // Reference the UserCredentials model
    required: [true, 'User ID is required for history record']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventDetails', // Reference the EventDetails model
    required: [true, 'Event ID is required for history record']
  },
  participationDate: {
    type: Date,
    required: [true, 'Participation date is required'],
    max: [new Date(), 'Participation date cannot be in the future'] // Participation date must be in the past or present
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  },
  hoursVolunteered: {
    type: Number,
    required: [true, 'Hours volunteered is required'],
    min: [0.1, 'Hours volunteered must be a positive number'] // Ensure positive hours
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('VolunteerHistory', VolunteerHistorySchema);
