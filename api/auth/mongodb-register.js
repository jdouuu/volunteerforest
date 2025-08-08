const { connectToDatabase, User } = require('./mongodb');

const generateSimpleToken = (id) => {
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
    // Connect to database
    await connectToDatabase();

    const { userId, password, role = 'volunteer' } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('MongoDB register attempt:', { userId, role });

    // Check if user already exists
    const existingUser = await User.findOne({ userId, role });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already registered for this role' });
    }

    // Create new user
    const newUser = new User({
      userId,
      password,
      role,
      profile: {
        fullName: 'New User',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        skills: [],
        preferences: [],
        availability: []
      }
    });

    await newUser.save();

    console.log('MongoDB registration successful for user:', userId);

    // Return response in expected format
    res.status(201).json({
      _id: newUser._id,
      userId: newUser.userId,
      role: newUser.role,
      profile: newUser.profile,
      token: generateSimpleToken(newUser._id),
      message: 'User registered successfully. Please complete your profile.'
    });

  } catch (error) {
    console.error('MongoDB registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
