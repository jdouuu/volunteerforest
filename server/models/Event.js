const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Event details for matching
  eventType: {
    type: String,
    enum: ['environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children'],
    required: true
  },
  requiredSkills: [{
    type: String,
    enum: [
      'gardening', 'cooking', 'teaching', 'construction', 'medical', 
      'technology', 'art', 'music', 'sports', 'language', 'driving',
      'customer_service', 'event_planning', 'fundraising', 'mentoring'
    ]
  }],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Timing and scheduling
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // hours
    required: true
  },
  // Capacity and current status
  maxVolunteers: {
    type: Number,
    required: true
  },
  currentVolunteers: {
    type: Number,
    default: 0
  },
  // Event status
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  // Organizer information
  organizer: {
    name: String,
    email: String,
    phone: String
  },
  // Additional details
  requirements: [String], // Any special requirements
  benefits: [String], // What volunteers will gain
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'moderate'
  },
  // Matching priority (for urgent events)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Event ratings and feedback
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if event is full
eventSchema.methods.isFull = function() {
  return this.currentVolunteers >= this.maxVolunteers;
};

// Check if event is available for registration
eventSchema.methods.isAvailable = function() {
  return this.status === 'upcoming' && !this.isFull();
};

// Calculate days until event
eventSchema.methods.daysUntilEvent = function() {
  const now = new Date();
  const eventDate = new Date(this.startDate);
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get available spots
eventSchema.methods.getAvailableSpots = function() {
  return this.maxVolunteers - this.currentVolunteers;
};

module.exports = mongoose.model('Event', eventSchema); 