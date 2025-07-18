const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const auth = require('../middleware/auth');

// Register a new volunteer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'volunteer' } = req.body;

    // Check if volunteer already exists
    let volunteer = await Volunteer.findOne({ email });
    if (volunteer) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new volunteer
    volunteer = new Volunteer({
      name,
      email,
      password: hashedPassword,
      role
    });

    await volunteer.save();

    // Create JWT token
    const token = jwt.sign(
      { id: volunteer._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          role: volunteer.role,
          profileComplete: volunteer.getProfileCompletion()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login volunteer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if volunteer exists
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: volunteer._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          role: volunteer.role,
          profileComplete: volunteer.getProfileCompletion()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get volunteer profile
router.get('/profile', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update volunteer profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password update through this route
    delete updates.email; // Don't allow email update through this route

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all volunteers (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const volunteers = await Volunteer.find({}).select('-password');
    res.json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 