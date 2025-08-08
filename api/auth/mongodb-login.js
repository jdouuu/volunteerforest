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

    console.log('MongoDB login attempt:', { userId, role });

    // Find user in MongoDB
    const user = await User.findOne({ userId, role });

    if (!user) {
      console.log('User not found:', { userId, role });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', userId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('MongoDB login successful for user:', userId);

    // Return response in expected format
    res.status(200).json({
      _id: user._id,
      userId: user.userId,
      role: user.role,
      profile: user.profile,
      token: generateSimpleToken(user._id),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('MongoDB login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
