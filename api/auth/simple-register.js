// Simple in-memory user store for demo (in production, use a database)
let users = [
  {
    id: '1',
    email: 'admin@volunteer.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2', 
    email: 'volunteer@test.com',
    password: 'test123',
    role: 'volunteer',
    name: 'Test Volunteer'
  }
];

const generateSimpleToken = (id) => {
  return `simple_token_${id}_${Date.now()}`;
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
    const { userId, password, role = 'volunteer' } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Simple register attempt:', { userId, role });

    // Check if user already exists
    const existingUser = users.find(u => u.email === userId && u.role === role);
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already registered for this role' });
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email: userId,
      password: password, // In production, hash this
      role: role,
      name: 'New User'
    };

    users.push(newUser);

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
