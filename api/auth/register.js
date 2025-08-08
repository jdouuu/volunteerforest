const UserCredentials = require('../../server/models/UserCredentials');
const UserProfile = require('../../server/models/UserProfile');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volunteerforest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = connection;
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Server misconfiguration: JWT_SECRET missing');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { userId, password, role = 'volunteer' } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Register attempt:', { userId, role });

    // Check if user already exists
    const userExists = await UserCredentials.findOne({ userId, role });
    if (userExists) {
      return res.status(400).json({ message: 'User ID already registered for this role' });
    }

    // Legacy user without role present
    const legacy = await UserCredentials.findOne({ userId, role: { $exists: false } });
    if (legacy && role === 'volunteer') {
      legacy.password = password; // will be hashed by pre-save hook
      legacy.role = 'volunteer';
      await legacy.save();

      let userProfile = await UserProfile.findOne({ userId: legacy._id });
      if (!userProfile) {
        userProfile = await UserProfile.create({
          userId: legacy._id,
          fullName: 'New Volunteer',
          address: '',
          city: '',
          state: '',
          zipcode: '',
          skills: [],
          preferences: [],
          availability: [],
        });
      }

      return res.status(201).json({
        _id: legacy._id,
        userId: legacy.userId,
        profile: userProfile,
        role: legacy.role,
        token: generateToken(legacy._id),
        message: 'User registered successfully. Please complete your profile.',
      });
    }

    // Create new user
    const user = await UserCredentials.create({ userId, password, role });

    if (user) {
      const userProfile = await UserProfile.create({
        userId: user._id,
        fullName: 'New Volunteer',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        skills: [],
        preferences: [],
        availability: [],
      });

      console.log('Registration successful for user:', userId);

      res.status(201).json({
        _id: user._id,
        userId: user.userId,
        profile: userProfile,
        token: generateToken(user._id),
        role: user.role,
        message: 'User registered successfully. Please complete your profile.',
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
