const { findUser, addUser, generateSimpleToken } = require('./user-store');

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
    const { userId, password, role = 'volunteer' } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Simple register attempt:', { userId, role });

    // Check if user already exists using shared store
    const existingUser = findUser(userId, role);
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already registered for this role' });
    }

    // Create new user using shared store
    const newUser = addUser({
      email: userId,
      password: password, // In production, hash this
      role: role,
      name: 'New User'
    });

    console.log('Simple registration successful for user:', userId);

    // Return response in expected format
    res.status(201).json({
      _id: newUser.id,
      userId: newUser.email,
      role: newUser.role,
      profile: {
        fullName: newUser.name,
        address: '',
        city: '',
        state: '',
        zipcode: '',
        skills: [],
        preferences: [],
        availability: []
      },
      token: generateSimpleToken(newUser.id),
      message: 'User registered successfully. Please complete your profile.'
    });

  } catch (error) {
    console.error('Simple registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
