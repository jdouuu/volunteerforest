const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { protect } = require('../middleware/authMiddleware');
const { validateNotification, validateObjectId } = require('../middleware/validation');

// Send event assignment notification
router.post('/event-assignment', protect, validateNotification, async (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    if (!volunteerId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer ID and Event ID are required'
      });
    }

    const result = await notificationService.sendEventAssignmentNotification(volunteerId, eventId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: { messageId: result.messageId }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send event update notification
router.post('/event-update', protect, validateNotification, async (req, res) => {
  try {
    const { eventId, updateMessage } = req.body;

    if (!eventId || !updateMessage) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and update message are required'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const result = await notificationService.sendEventUpdateNotification(eventId, updateMessage);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Event update notifications sent successfully',
        data: {
          notificationsSent: result.notificationsSent,
          notifications: result.notifications
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send event reminder notification
router.post('/event-reminder', protect, validateNotification, async (req, res) => {
  try {
    const { eventId, reminderType = 'day_before' } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const validReminderTypes = ['day_before', 'hour_before', 'week_before'];
    if (!validReminderTypes.includes(reminderType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reminder type. Must be: day_before, hour_before, or week_before'
      });
    }

    const result = await notificationService.sendEventReminderNotification(eventId, reminderType);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Event reminder notifications sent successfully',
        data: {
          reminderType: result.reminderType,
          notificationsSent: result.notificationsSent,
          notifications: result.notifications
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send welcome notification
router.post('/welcome', protect, validateNotification, async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer ID is required'
      });
    }

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await notificationService.sendWelcomeNotification(volunteerId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: { messageId: result.messageId }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification history for a volunteer
router.get('/history/:volunteerId', protect, validateObjectId('volunteerId'), async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { limit = 20 } = req.query;

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await notificationService.getNotificationHistory(volunteerId, parseInt(limit));
    
    if (result.success) {
      res.json({
        success: true,
        data: result.notifications,
        count: result.notifications.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to get notification history'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test email configuration (admin only)
router.get('/test-config', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const result = await notificationService.testEmailConfiguration();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.details
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification preferences for a volunteer
router.get('/preferences/:volunteerId', protect, validateObjectId('volunteerId'), async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // In a real app, you'd get these from the database
    // For now, return default preferences
    const preferences = {
      emailNotifications: true,
      eventAssignments: true,
      eventUpdates: true,
      eventReminders: true,
      weeklyDigest: false,
      smsNotifications: false
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update notification preferences for a volunteer
router.put('/preferences/:volunteerId', protect, validateObjectId('volunteerId'), async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const preferences = req.body;

    // Check if user is admin or the volunteer themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // In a real app, you'd save these to the database
    // For now, just return the updated preferences
    const updatedPreferences = {
      ...preferences,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;