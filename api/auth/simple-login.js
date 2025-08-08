const { findUser, generateSimpleToken } = require('./user-store');

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

    console.log('Simple login attempt:', { userId, role });

    // Find user using shared store
    const user = findUser(userId, role);

    if (!user) {
      console.log('User not found:', { userId, role });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      console.log('Password mismatch for user:', userId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Simple login successful for user:', userId);

    // Return response in expected format
    res.status(200).json({
      _id: user.id,
      userId: user.email,
      role: user.role,
      profile: {
        fullName: user.name,
        address: '',
        city: '',
        state: '',
        zipcode: '',
        skills: [],
        preferences: [],
        availability: []
      },
      token: generateSimpleToken(user.id),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
