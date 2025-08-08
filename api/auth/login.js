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

module.exports = async function handler(req, res) {
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

    console.log('Login attempt:', { userId, role });

    let user = await UserCredentials.findOne({ userId, role });
    
    // Legacy support: if no role-based credential exists, try legacy record and migrate to volunteer
    if (!user) {
      const legacy = await UserCredentials.findOne({ userId, role: { $exists: false } });
      if (legacy && role === 'volunteer') {
        legacy.role = 'volunteer';
        await legacy.save();
        user = legacy;
      }
    }

    if (!user) {
      console.log('User not found:', { userId, role });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', userId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    let userProfile = await UserProfile.findOne({ userId: user._id });
    if (!userProfile) {
      userProfile = await UserProfile.create({
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
    }

    console.log('Login successful for user:', userId);

    res.status(200).json({
      _id: user._id,
      userId: user.userId,
      role: user.role,
      profile: userProfile,
      token: generateToken(user._id),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
