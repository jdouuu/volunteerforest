// server/models/EventDetails.js
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     EventDetails:
 *       type: object
 *       required:
 *         - eventName
 *         - description
 *         - location
 *         - requiredSkills
 *         - urgency
 *         - eventDate
 *       properties:
 *         eventName:
 *           type: String
 *           description: Name of the event.
 *           trim: true
 *           minlength: 3
 *           maxlength: 100
 *         description:
 *           type: String
 *           description: Detailed description of the event.
 *           trim: true
 *           minlength: 10
 *           maxlength: 2000
 *         location:
 *           type: Object
 *           description: Event location details.
 *           properties:
 *             address:
 *               type: String
 *               description: Street address of the event.
 *             city:
 *               type: String
 *               description: City where the event takes place.
 *             state:
 *               type: String
 *               description: State code (e.g., TX, CA).
 *             zipcode:
 *               type: String
 *               description: ZIP code of the event location.
 *         requiredSkills:
 *           type: [String]
 *           description: Array of skills required for the event.
 *         urgency:
 *           type: String
 *           description: Urgency level of the event.
 *           enum: ['low', 'medium', 'high', 'critical']
 *         eventDate:
 *           type: Date
 *           description: Date and time when the event takes place.
 *       example:
 *         eventName: 'Community Food Drive'
 *         description: 'Help organize and distribute food to families in need during the holiday season.'
 *         location:
 *           address: '123 Community Center Dr'
 *           city: 'Houston'
 *           state: 'TX'
 *           zipcode: '77001'
 *         requiredSkills: ['Organization', 'Customer Service', 'Lifting']
 *         urgency: 'high'
 *         eventDate: '2024-12-15T09:00:00Z'
 */

/**
 * @constant EventDetailsSchema
 * @description Mongoose schema for EventDetails collection.
 * Defines the structure and validation rules for event information.
 */
const EventDetailsSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    minlength: [3, 'Event name must be at least 3 characters long'],
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Event address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Event city is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Event state is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'State must be 2 characters long'],
      maxlength: [2, 'State must be 2 characters long']
    },
    zipcode: {
      type: String,
      required: [true, 'Event zipcode is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    }
  },
  requiredSkills: {
    type: [String],
    required: [true, 'At least one required skill must be specified'],
    validate: {
      validator: function(skills) {
        return skills && skills.length > 0;
      },
      message: 'At least one required skill must be specified'
    }
  },
  urgency: {
    type: String,
    required: [true, 'Event urgency is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Urgency must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  // Optional fields for enhanced functionality
  maxVolunteers: {
    type: Number,
    min: [1, 'Maximum volunteers must be at least 1'],
    default: 10
  },
  currentVolunteers: {
    type: Number,
    min: [0, 'Current volunteers cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organizer: {
    name: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Organizer email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{10}$/, 'Please provide a valid phone number']
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

/**
 * @method isEventFull
 * @description Check if the event has reached maximum capacity.
 * @returns {boolean} True if event is full, false otherwise.
 */
EventDetailsSchema.methods.isEventFull = function() {
  return this.currentVolunteers >= this.maxVolunteers;
};

/**
 * @method daysUntilEvent
 * @description Calculate days until the event date.
 * @returns {number} Number of days until the event.
 */
EventDetailsSchema.methods.daysUntilEvent = function() {
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  const diffTime = eventDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * @method getAvailableSpots
 * @description Get number of available volunteer spots.
 * @returns {number} Number of available spots.
 */
EventDetailsSchema.methods.getAvailableSpots = function() {
  return this.maxVolunteers - this.currentVolunteers;
};

module.exports = mongoose.model('EventDetails', EventDetailsSchema);