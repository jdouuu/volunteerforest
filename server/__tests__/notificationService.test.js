const notificationService = require('../services/notificationService');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

// Mock the models
jest.mock('../models/Volunteer');
jest.mock('../models/Event');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true)
  }))
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEventAssignmentNotification', () => {
    test('should send event assignment notification successfully', async () => {
      const mockVolunteer = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };
      const mockEvent = {
        _id: '456',
        title: 'Community Garden Cleanup',
        description: 'Help clean up the community garden',
        startDate: new Date(),
        duration: 3,
        location: { address: '123 Garden St' }
      };

      Volunteer.findById.mockResolvedValue(mockVolunteer);
      Event.findById.mockResolvedValue(mockEvent);

      const result = await notificationService.sendEventAssignmentNotification('123', '456');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(Volunteer.findById).toHaveBeenCalledWith('123');
      expect(Event.findById).toHaveBeenCalledWith('456');
    });

    test('should fail when volunteer not found', async () => {
      Volunteer.findById.mockResolvedValue(null);
      Event.findById.mockResolvedValue({ title: 'Test Event' });

      const result = await notificationService.sendEventAssignmentNotification('123', '456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Volunteer or Event not found');
    });

    test('should fail when event not found', async () => {
      Volunteer.findById.mockResolvedValue({ name: 'John' });
      Event.findById.mockResolvedValue(null);

      const result = await notificationService.sendEventAssignmentNotification('123', '456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Volunteer or Event not found');
    });
  });

  describe('sendEventUpdateNotification', () => {
    test('should send event update notifications successfully', async () => {
      const mockEvent = {
        _id: '456',
        title: 'Community Garden Cleanup',
        eventType: 'environmental',
        startDate: new Date(),
        location: { address: '123 Garden St' }
      };
      const mockVolunteers = [
        { _id: '1', name: 'John', email: 'john@example.com' },
        { _id: '2', name: 'Jane', email: 'jane@example.com' }
      ];

      Event.findById.mockResolvedValue(mockEvent);
      Volunteer.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockVolunteers)
      });

      const result = await notificationService.sendEventUpdateNotification('456', 'Event time changed');

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(2);
      expect(result.notifications).toHaveLength(2);
    });

    test('should fail when event not found', async () => {
      Event.findById.mockResolvedValue(null);

      const result = await notificationService.sendEventUpdateNotification('456', 'Update message');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });

  describe('sendEventReminderNotification', () => {
    test('should send reminder notifications successfully', async () => {
      const mockEvent = {
        _id: '456',
        title: 'Community Garden Cleanup',
        eventType: 'environmental',
        startDate: new Date(),
        location: { address: '123 Garden St' },
        duration: 3
      };
      const mockVolunteers = [
        { _id: '1', name: 'John', email: 'john@example.com' }
      ];

      Event.findById.mockResolvedValue(mockEvent);
      Volunteer.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockVolunteers)
      });

      const result = await notificationService.sendEventReminderNotification('456', 'day_before');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('day_before');
      expect(result.notificationsSent).toBe(1);
    });
  });

  describe('sendWelcomeNotification', () => {
    test('should send welcome notification successfully', async () => {
      const mockVolunteer = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      Volunteer.findById.mockResolvedValue(mockVolunteer);

      const result = await notificationService.sendWelcomeNotification('123');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(Volunteer.findById).toHaveBeenCalledWith('123');
    });

    test('should fail when volunteer not found', async () => {
      Volunteer.findById.mockResolvedValue(null);

      const result = await notificationService.sendWelcomeNotification('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Volunteer not found');
    });
  });

  describe('getNotificationHistory', () => {
    test('should return notification history', async () => {
      const result = await notificationService.getNotificationHistory('123', 10);

      expect(result.success).toBe(true);
      expect(result.notifications).toBeDefined();
      expect(Array.isArray(result.notifications)).toBe(true);
    });
  });

  describe('testEmailConfiguration', () => {
    test('should validate email configuration successfully', async () => {
      const result = await notificationService.testEmailConfiguration();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email configuration is valid');
    });

    test('should handle email configuration failure', async () => {
      // Mock a failed verification
      const nodemailer = require('nodemailer');
      const mockTransporter = {
        verify: jest.fn().mockRejectedValue(new Error('Connection failed'))
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      // Create a new instance to get the failed transporter
      const NotificationService = require('../services/notificationService');
      NotificationService.transporter = mockTransporter;

      const result = await NotificationService.testEmailConfiguration();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email configuration failed');
      expect(result.error).toBe('Connection failed');
    });
  });
});