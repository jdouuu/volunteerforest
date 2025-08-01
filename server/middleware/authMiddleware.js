// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const UserCredentials = require('../models/UserCredentials');
require('dotenv').config(); // Load environment variables

/**
 * @function protect
 * @description Middleware to protect routes, ensuring only authenticated users can access them.
 * Verifies the JWT token from the request header.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT_SECRET from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID from the decoded token payload and attach to request object
      // Exclude password for security
      req.user = await UserCredentials.findById(decoded.id).select('-password');

      // If user not found, throw an error
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @function authorizeRoles
 * @description Middleware to restrict access based on user roles.
 * (Placeholder for future role-based access control, as roles are not yet implemented in models)
 * @param {...string} roles - Allowed roles for accessing the route.
 * @returns {Function} - Express middleware function.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // In a real application, req.user would have a 'role' property
    // For now, we'll assume all authenticated users are 'volunteer' or 'admin' based on context
    // This middleware would check if req.user.role is included in the 'roles' array
    // Example: if (!roles.includes(req.user.role)) { return res.status(403).json({ message: 'Forbidden' }); }
    next(); // Allow access for now, as roles are not defined
  };
};

module.exports = { protect, authorizeRoles };
