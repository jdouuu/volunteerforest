const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const { validateHistoryEntry, validateObjectId, validatePagination } = require('../middleware/validation');

// Get volunteer participation history
router.get('/:volunteerId', auth, validateObjectId('volunteerId'), validatePagination, async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId)
      .populate('completedEvents.eventId', 'title description eventType startDate location')
      .select('completedEvents totalHours averageRating name email');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Paginate completed events
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = volunteer.completedEvents
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          totalHours: volunteer.totalHours,
          averageRating: volunteer.averageRating,
          totalEvents: volunteer.completedEvents.length
        },
        completedEvents: paginatedEvents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: volunteer.completedEvents.length,
          pages: Math.ceil(volunteer.completedEvents.length / parseInt(limit))
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

// Add event to volunteer history
router.post('/:volunteerId/events', auth, validateObjectId('volunteerId'), validateHistoryEntry, async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { eventId, hours, rating } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    if (!eventId || !hours) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and hours are required'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    const event = await Event.findById(eventId);

    if (!volunteer || !event) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer or Event not found'
      });
    }

    // Check if event already in history
    const existingEntry = volunteer.completedEvents.find(
      e => e.eventId.toString() === eventId
    );

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Event already exists in volunteer history'
      });
    }

    // Add to completed events
    volunteer.completedEvents.push({
      eventId,
      hours: parseInt(hours),
      rating: rating ? parseInt(rating) : undefined,
      date: new Date()
    });

    // Update total hours
    volunteer.totalHours += parseInt(hours);

    // Recalculate average rating if rating provided
    if (rating) {
      const ratedEvents = volunteer.completedEvents.filter(e => e.rating);
      const totalRating = ratedEvents.reduce((sum, e) => sum + e.rating, 0);
      volunteer.averageRating = totalRating / ratedEvents.length;
    }

    await volunteer.save();

    res.status(201).json({
      success: true,
      message: 'Event added to volunteer history successfully',
      data: {
        totalHours: volunteer.totalHours,
        averageRating: volunteer.averageRating,
        totalEvents: volunteer.completedEvents.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update event entry in volunteer history
router.put('/:volunteerId/events/:eventId', auth, validateObjectId('volunteerId'), validateObjectId('eventId'), async (req, res) => {
  try {
    const { volunteerId, eventId } = req.params;
    const { hours, rating } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const eventEntry = volunteer.completedEvents.find(
      e => e.eventId.toString() === eventId
    );

    if (!eventEntry) {
      return res.status(404).json({
        success: false,
        message: 'Event not found in volunteer history'
      });
    }

    // Update hours if provided
    if (hours !== undefined) {
      const hoursDiff = parseInt(hours) - eventEntry.hours;
      eventEntry.hours = parseInt(hours);
      volunteer.totalHours += hoursDiff;
    }

    // Update rating if provided
    if (rating !== undefined) {
      eventEntry.rating = parseInt(rating);
      
      // Recalculate average rating
      const ratedEvents = volunteer.completedEvents.filter(e => e.rating);
      const totalRating = ratedEvents.reduce((sum, e) => sum + e.rating, 0);
      volunteer.averageRating = ratedEvents.length > 0 ? totalRating / ratedEvents.length : 0;
    }

    await volunteer.save();

    res.json({
      success: true,
      message: 'Event entry updated successfully',
      data: {
        totalHours: volunteer.totalHours,
        averageRating: volunteer.averageRating,
        updatedEntry: eventEntry
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete event from volunteer history
router.delete('/:volunteerId/events/:eventId', auth, validateObjectId('volunteerId'), validateObjectId('eventId'), async (req, res) => {
  try {
    const { volunteerId, eventId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const eventIndex = volunteer.completedEvents.findIndex(
      e => e.eventId.toString() === eventId
    );

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found in volunteer history'
      });
    }

    const removedEvent = volunteer.completedEvents[eventIndex];
    
    // Update total hours
    volunteer.totalHours -= removedEvent.hours;
    
    // Remove event from history
    volunteer.completedEvents.splice(eventIndex, 1);

    // Recalculate average rating
    const ratedEvents = volunteer.completedEvents.filter(e => e.rating);
    volunteer.averageRating = ratedEvents.length > 0 
      ? ratedEvents.reduce((sum, e) => sum + e.rating, 0) / ratedEvents.length 
      : 0;

    await volunteer.save();

    res.json({
      success: true,
      message: 'Event removed from volunteer history successfully',
      data: {
        totalHours: volunteer.totalHours,
        averageRating: volunteer.averageRating,
        totalEvents: volunteer.completedEvents.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get volunteer statistics
router.get('/:volunteerId/stats', auth, validateObjectId('volunteerId'), async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId)
      .populate('completedEvents.eventId', 'eventType')
      .select('completedEvents totalHours averageRating createdAt');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Calculate statistics
    const eventsByType = {};
    const eventsByMonth = {};
    let totalRatedEvents = 0;

    volunteer.completedEvents.forEach(event => {
      // Count by event type
      if (event.eventId && event.eventId.eventType) {
        eventsByType[event.eventId.eventType] = (eventsByType[event.eventId.eventType] || 0) + 1;
      }

      // Count by month
      const month = new Date(event.date).toISOString().slice(0, 7); // YYYY-MM
      eventsByMonth[month] = (eventsByMonth[month] || 0) + event.hours;

      if (event.rating) {
        totalRatedEvents++;
      }
    });

    const stats = {
      totalEvents: volunteer.completedEvents.length,
      totalHours: volunteer.totalHours,
      averageRating: volunteer.averageRating,
      totalRatedEvents,
      eventsByType,
      eventsByMonth,
      memberSince: volunteer.createdAt,
      averageHoursPerEvent: volunteer.completedEvents.length > 0 
        ? (volunteer.totalHours / volunteer.completedEvents.length).toFixed(1)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;