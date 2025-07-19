const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const { validateEventCreation, validateEventUpdate, validateObjectId, validatePagination } = require('../middleware/validation');

// Create a new event (admin only)
router.post('/', auth, validateEventCreation, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const event = new Event(req.body);
    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all events
router.get('/', validatePagination, async (req, res) => {
  try {
    const { status, eventType, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (eventType) filter.eventType = eventType;

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get event by ID
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update event (admin only)
router.put('/:id', auth, validateObjectId('id'), validateEventUpdate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Register volunteer for event
router.post('/:id/register', auth, validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }

    // Check if volunteer is already registered
    // This would require adding a volunteers array to the Event model
    // For now, we'll just increment the count
    event.currentVolunteers += 1;
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        availableSpots: event.getAvailableSpots()
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