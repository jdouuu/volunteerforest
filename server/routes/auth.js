const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Verify token and get user info
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router; 