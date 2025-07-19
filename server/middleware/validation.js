const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Volunteer registration validation
const validateVolunteerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['volunteer', 'admin'])
    .withMessage('Role must be either volunteer or admin'),
  
  handleValidationErrors
];

// Volunteer login validation
const validateVolunteerLogin = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Volunteer profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isIn([
      'gardening', 'cooking', 'teaching', 'construction', 'medical', 
      'technology', 'art', 'music', 'sports', 'language', 'driving',
      'customer_service', 'event_planning', 'fundraising', 'mentoring'
    ])
    .withMessage('Invalid skill provided'),
  
  body('preferences')
    .optional()
    .isArray()
    .withMessage('Preferences must be an array'),
  
  body('preferences.*')
    .optional()
    .isIn(['environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children'])
    .withMessage('Invalid preference provided'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must be less than 50 characters'),
  
  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State must be less than 50 characters'),
  
  body('location.zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid zip code format'),
  
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  handleValidationErrors
];

// Event creation validation
const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('eventType')
    .isIn(['environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children'])
    .withMessage('Invalid event type'),
  
  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  
  body('requiredSkills.*')
    .optional()
    .isIn([
      'gardening', 'cooking', 'teaching', 'construction', 'medical', 
      'technology', 'art', 'music', 'sports', 'language', 'driving',
      'customer_service', 'event_planning', 'fundraising', 'mentoring'
    ])
    .withMessage('Invalid required skill'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('duration')
    .isInt({ min: 1, max: 24 })
    .withMessage('Duration must be between 1 and 24 hours'),
  
  body('maxVolunteers')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max volunteers must be between 1 and 1000'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging'])
    .withMessage('Difficulty must be easy, moderate, or challenging'),
  
  handleValidationErrors
];

// Event update validation (similar to creation but all fields optional)
const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('eventType')
    .optional()
    .isIn(['environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children'])
    .withMessage('Invalid event type'),
  
  body('maxVolunteers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max volunteers must be between 1 and 1000'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Notification validation
const validateNotification = [
  body('volunteerId')
    .isMongoId()
    .withMessage('Invalid volunteer ID format'),
  
  body('eventId')
    .optional()
    .isMongoId()
    .withMessage('Invalid event ID format'),
  
  body('updateMessage')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Update message must be between 5 and 500 characters'),
  
  body('reminderType')
    .optional()
    .isIn(['day_before', 'hour_before', 'week_before'])
    .withMessage('Invalid reminder type'),
  
  handleValidationErrors
];

// History validation
const validateHistoryEntry = [
  body('eventId')
    .isMongoId()
    .withMessage('Invalid event ID format'),
  
  body('hours')
    .isInt({ min: 1, max: 24 })
    .withMessage('Hours must be between 1 and 24'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Matching validation
const validateMatchingScore = [
  body('volunteerId')
    .isMongoId()
    .withMessage('Invalid volunteer ID format'),
  
  body('eventId')
    .isMongoId()
    .withMessage('Invalid event ID format'),
  
  handleValidationErrors
];

module.exports = {
  validateVolunteerRegistration,
  validateVolunteerLogin,
  validateProfileUpdate,
  validateEventCreation,
  validateEventUpdate,
  validateObjectId,
  validatePagination,
  validateNotification,
  validateHistoryEntry,
  validateMatchingScore,
  handleValidationErrors
};