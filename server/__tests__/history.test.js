const request = require('supertest');
const express = require('express');
const auth = require('../middleware/auth');

// Mock the middleware and models
jest.mock('../middleware/auth');
jest.mock('../models/Volunteer');
jest.mock('../models/Event');

const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

// Create a test app
const app = express();
app.use(express.json());

// Import routes
const historyRoutes = require('../routes/history');
app.use('/api/history', historyRoutes);

describe('History Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/history/:volunteerId', () => {
    test('should get volunteer history successfully', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', role: 'volunteer' };
      const mockVolunteer = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        totalHours: 20,
        averageRating: 4.5,
        completedEvents: [
          {
            eventId: { title: 'Event 1', description: 'Desc 1' },
            hours: 5,
            rating: 4,
            date: new Date()
          },
          {
            eventId: { title: 'Event 2', description: 'Desc 2' },
            hours: 15,
            rating: 5,
            date: new Date()
          }
        ]
      };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockVolunteer)
        })
      });

      const response = await request(app)
        .get('/api/history/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.volunteer.name).toBe('John Doe');
      expect(response.body.data.volunteer.totalHours).toBe(20);
      expect(response.body.data.completedEvents).toHaveLength(2);
    });

    test('should deny access for unauthorized user', async () => {
      const mockUser = { _id: '456', role: 'volunteer' }; // Different ID

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/history/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 404 if volunteer not found', async () => {
      const mockUser = { _id: '123', role: 'volunteer' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
        })
      });

      const response = await request(app)
        .get('/api/history/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Volunteer not found');
    });
  });

  describe('POST /api/history/:volunteerId/events', () => {
    test('should add event to history successfully (admin)', async () => {
      const mockUser = { _id: '456', role: 'admin' };
      const mockVolunteer = {
        _id: '123',
        completedEvents: [],
        totalHours: 0,
        save: jest.fn().mockResolvedValue(true)
      };
      const mockEvent = { _id: '789', title: 'Test Event' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockResolvedValue(mockVolunteer);
      Event.findById.mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/api/history/123/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          eventId: '789',
          hours: 5,
          rating: 4
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockVolunteer.completedEvents).toHaveLength(1);
      expect(mockVolunteer.totalHours).toBe(5);
    });

    test('should deny access for non-admin', async () => {
      const mockUser = { _id: '123', role: 'volunteer' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .post('/api/history/123/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          eventId: '789',
          hours: 5
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Admin only.');
    });

    test('should fail with missing required fields', async () => {
      const mockUser = { _id: '456', role: 'admin' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .post('/api/history/123/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          eventId: '789'
          // Missing hours
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event ID and hours are required');
    });

    test('should fail with invalid rating', async () => {
      const mockUser = { _id: '456', role: 'admin' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .post('/api/history/123/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          eventId: '789',
          hours: 5,
          rating: 6 // Invalid - should be 1-5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Rating must be between 1 and 5');
    });

    test('should prevent duplicate event entries', async () => {
      const mockUser = { _id: '456', role: 'admin' };
      const mockVolunteer = {
        _id: '123',
        completedEvents: [{ eventId: '789' }],
        totalHours: 5
      };
      const mockEvent = { _id: '789', title: 'Test Event' };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockResolvedValue(mockVolunteer);
      Event.findById.mockResolvedValue(mockEvent);

      // Mock find to return existing event
      mockVolunteer.completedEvents.find = jest.fn().mockReturnValue({ eventId: '789' });

      const response = await request(app)
        .post('/api/history/123/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          eventId: '789',
          hours: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event already exists in volunteer history');
    });
  });

  describe('GET /api/history/:volunteerId/stats', () => {
    test('should get volunteer statistics successfully', async () => {
      const mockUser = { _id: '123', role: 'volunteer' };
      const mockVolunteer = {
        _id: '123',
        totalHours: 25,
        averageRating: 4.2,
        createdAt: new Date('2023-01-01'),
        completedEvents: [
          {
            eventId: { eventType: 'environmental' },
            hours: 10,
            rating: 4,
            date: new Date('2024-01-15')
          },
          {
            eventId: { eventType: 'education' },
            hours: 15,
            rating: 5,
            date: new Date('2024-02-20')
          }
        ]
      };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockVolunteer)
        })
      });

      const response = await request(app)
        .get('/api/history/123/stats')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEvents).toBe(2);
      expect(response.body.data.totalHours).toBe(25);
      expect(response.body.data.averageRating).toBe(4.2);
      expect(response.body.data.eventsByType).toHaveProperty('environmental');
      expect(response.body.data.eventsByType).toHaveProperty('education');
    });
  });
});