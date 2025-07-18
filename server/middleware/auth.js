const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const volunteer = await Volunteer.findById(decoded.id).select('-password');
    
    if (!volunteer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    req.user = volunteer;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = auth; 