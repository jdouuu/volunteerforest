const mongoose = require('mongoose');

// MongoDB connection with proper error handling for serverless
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    cachedConnection = connection;
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

// Simple User Schema for serverless functions
const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  profile: {
    fullName: { type: String, default: 'New User' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    skills: [String],
    preferences: [String],
    availability: [String]
  }
}, {
  timestamps: true
});

// Create compound index for userId and role
UserSchema.index({ userId: 1, role: 1 }, { unique: true });

// Simple password comparison (in production, use bcrypt)
UserSchema.methods.matchPassword = function(enteredPassword) {
  return this.password === enteredPassword; // In production: bcrypt.compare(enteredPassword, this.password)
};

// Pre-save hook to hash password (simplified for testing)
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // In production: this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = {
  connectToDatabase,
  User
};
