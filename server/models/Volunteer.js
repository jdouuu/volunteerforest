const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer'
  },
  // Profile information for matching
  skills: [{
    type: String,
    enum: [
      'gardening', 'cooking', 'teaching', 'construction', 'medical', 
      'technology', 'art', 'music', 'sports', 'language', 'driving',
      'customer_service', 'event_planning', 'fundraising', 'mentoring'
    ]
  }],
  availability: {
    weekdays: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    },
    weekends: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    }
  },
  preferences: {
    maxDistance: { type: Number, default: 10 }, // miles
    eventTypes: [{
      type: String,
      enum: ['environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children']
    }],
    maxHoursPerWeek: { type: Number, default: 10 }
  },
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
  // Matching history and ratings
  completedEvents: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    hours: Number,
    rating: { type: Number, min: 1, max: 5 },
    date: { type: Date, default: Date.now }
  }],
  totalHours: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  // Profile completion
  profileComplete: { type: Boolean, default: false },
  // Account status
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
volunteerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate profile completion percentage
volunteerSchema.methods.getProfileCompletion = function() {
  const fields = ['name', 'email', 'skills', 'availability', 'preferences', 'location'];
  const completedFields = fields.filter(field => {
    if (field === 'skills') return this.skills && this.skills.length > 0;
    if (field === 'availability') return this.availability;
    if (field === 'preferences') return this.preferences;
    if (field === 'location') return this.location && this.location.city;
    return this[field];
  });
  return Math.round((completedFields.length / fields.length) * 100);
};

// Update average rating
volunteerSchema.methods.updateAverageRating = function() {
  if (this.completedEvents.length > 0) {
    const totalRating = this.completedEvents.reduce((sum, event) => sum + (event.rating || 0), 0);
    this.averageRating = totalRating / this.completedEvents.length;
  }
};

module.exports = mongoose.model('Volunteer', volunteerSchema); 