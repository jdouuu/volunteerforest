// Import existing models from server folder
const UserCredentials = require('../../server/models/UserCredentials');
const UserProfile = require('../../server/models/UserProfile');
const connectDB = require('../../server/config/db');

// Simple token generation (in production, use JWT)
const generateToken = (id) => {
  return `token_${id}_${Date.now()}`;
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
    // Connect to database using existing connection
    await connectDB();

    const { userId, password, role = 'volunteer' } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Login attempt with existing models:', { userId, role });

    // Use existing UserCredentials model
    let user = await UserCredentials.findOne({ userId, role });
    
    // Legacy support for users without role
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
    console.error('Login error with existing models:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
