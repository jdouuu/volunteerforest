const express = require('express');
const router = express.Router();
const matchingService = require('../services/matchingService');
const { protect } = require('../middleware/authMiddleware');
const { validateMatchingScore, validateObjectId, validatePagination } = require('../middleware/validation');

// Get matching events for a volunteer
router.get('/events/:volunteerId', protect, validateObjectId('volunteerId'), validatePagination, async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { limit = 10 } = req.query;
    
    const matches = await matchingService.findMatchingEvents(volunteerId, parseInt(limit));
    
    res.json({
      success: true,
      data: matches,
      count: matches.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get matching volunteers for an event
router.get('/volunteers/:eventId', protect, validateObjectId('eventId'), validatePagination, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 20 } = req.query;
    
    const matches = await matchingService.findMatchingVolunteers(eventId, parseInt(limit));
    
    res.json({
      success: true,
      data: matches,
      count: matches.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get urgent matching alerts
router.get('/alerts', protect, async (req, res) => {
  try {
    const alerts = await matchingService.getUrgentMatchingAlerts();
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get matching statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await matchingService.getMatchingStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Calculate match score between volunteer and event
router.post('/calculate-score', protect, validateMatchingScore, async (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;
    
    if (!volunteerId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer ID and Event ID are required'
      });
    }

    const Volunteer = require('../models/Volunteer');
    const Event = require('../models/Event');
    
    const volunteer = await Volunteer.findById(volunteerId);
    const event = await Event.findById(eventId);
    
    if (!volunteer || !event) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer or Event not found'
      });
    }

    const matchScore = matchingService.calculateMatchScore(volunteer, event);
    const distance = volunteer.location.coordinates && event.location.coordinates 
      ? matchingService.calculateDistance(
          volunteer.location.coordinates.lat,
          volunteer.location.coordinates.lng,
          event.location.coordinates.lat,
          event.location.coordinates.lng
        )
      : null;

    res.json({
      success: true,
      data: {
        matchScore,
        distance,
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          skills: volunteer.skills
        },
        event: {
          id: event._id,
          title: event.title,
          requiredSkills: event.requiredSkills
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 