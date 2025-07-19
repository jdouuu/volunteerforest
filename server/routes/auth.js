const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Secret key (keep private)
const JWT_SECRET = 'your_secret_key';

// Mock user
const mockUser = {
  id: 1,
  username: 'testuser',
  password: 'password123',
};

// POST /login — Authenticate and return token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === mockUser.username && password === mockUser.password) {
    const token = jwt.sign(
      { id: mockUser.id, username: mockUser.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// GET /verify — Check token and return user info
const auth = require('../middleware/auth');

router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;