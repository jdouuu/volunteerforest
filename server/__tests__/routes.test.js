const request = require('supertest');
const express = require('express');
const auth = require('../middleware/auth');

// Mock the middleware and models
jest.mock('../middleware/auth');
jest.mock('../models/Volunteer');
jest.mock('../models/Event');
jest.mock('../services/matchingService');

const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const matchingService = require('../services/matchingService');

// Create a test app
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require('../routes/auth');
const volunteerRoutes = require('../routes/volunteers');
const eventRoutes = require('../routes/events');
const matchingRoutes = require('../routes/matching');

app.use('/api/auth', authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matching', matchingRoutes);

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Routes', () => {
    test('GET /api/auth/verify should verify token', async () => {
      const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(mockUser);
    });
  });

  describe('Volunteer Routes', () => {
    test('POST /api/volunteers/register should register new volunteer', async () => {
      const mockVolunteer = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'volunteer',
        getProfileCompletion: jest.fn().mockReturnValue(65)
      };

      Volunteer.findOne.mockResolvedValue(null);
      Volunteer.mockImplementation(() => {
        const instance = {
          _id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'volunteer',
          save: jest.fn().mockResolvedValue(mockVolunteer),
          getProfileCompletion: jest.fn().mockReturnValue(65)
        };
        return instance;
      });

      const response = await request(app)
        .post('/api/volunteers/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.volunteer.name).toBe('John Doe');
    });

    test('POST /api/volunteers/login should login volunteer', async () => {
      const mockVolunteer = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'volunteer',
        getProfileCompletion: jest.fn().mockReturnValue(65)
      };

      Volunteer.findOne.mockResolvedValue(mockVolunteer);
      
      // Mock bcrypt
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/volunteers/login')
        .send({
          email: 'john@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.volunteer.name).toBe('John Doe');
    });

    test('GET /api/volunteers/profile should get volunteer profile', async () => {
      const mockUser = { _id: '123', name: 'John Doe', email: 'john@example.com' };
      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      Volunteer.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app)
        .get('/api/volunteers/profile')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });
  });

  describe('Event Routes', () => {
    test('GET /api/events should get all events', async () => {
      const mockEvents = [
        { _id: '1', title: 'Event 1', description: 'Description 1' },
        { _id: '2', title: 'Event 2', description: 'Description 2' }
      ];

      Event.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockEvents)
          })
        })
      });
      Event.countDocuments.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEvents);
    });

    test('GET /api/events/:id should get event by ID', async () => {
      const mockEvent = { _id: '123', title: 'Event 1', description: 'Description 1' };
      Event.findById.mockResolvedValue(mockEvent);

      const response = await request(app)
        .get('/api/events/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEvent);
    });

    test('POST /api/events should create new event (admin only)', async () => {
      const mockUser = { role: 'admin' };
      const mockEvent = { 
        _id: '123', 
        title: 'New Event', 
        description: 'Description',
        eventType: 'environmental',
        startDate: new Date(),
        endDate: new Date(),
        duration: 3,
        maxVolunteers: 10
      };

      auth.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const mockSavedEvent = { ...mockEvent };
      Event.mockImplementation(() => {
        const instance = { ...mockEvent };
        instance.save = jest.fn().mockResolvedValue(mockSavedEvent);
        return instance;
      });

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'New Event',
          description: 'Test event description for testing purposes',
          eventType: 'environmental',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          duration: 3,
          maxVolunteers: 10
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Event');
    });
  });

  describe('Matching Routes', () => {
    test('GET /api/matching/alerts should get urgent alerts', async () => {
      const mockAlerts = [
        {
          event: { _id: '1', title: 'Urgent Event' },
          availableSpots: 5,
          urgency: 'high'
        }
      ];

      auth.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      matchingService.getUrgentMatchingAlerts.mockResolvedValue(mockAlerts);

      const response = await request(app)
        .get('/api/matching/alerts')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAlerts);
    });

    test('GET /api/matching/stats should get matching statistics', async () => {
      const mockStats = {
        totalVolunteers: 100,
        totalEvents: 50,
        urgentEvents: 10,
        pendingMatches: 10
      };

      auth.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      matchingService.getMatchingStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/matching/stats')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
    });

    test('POST /api/matching/calculate-score should calculate match score', async () => {
      const mockVolunteer = { 
        _id: '123', 
        name: 'John Doe', 
        skills: ['gardening'],
        location: {
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      };
      const mockEvent = { 
        _id: '456', 
        title: 'Event', 
        requiredSkills: ['gardening'],
        location: {
          coordinates: { lat: 40.7589, lng: -73.9851 }
        }
      };

      auth.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      Volunteer.findById.mockResolvedValue(mockVolunteer);
      Event.findById.mockResolvedValue(mockEvent);
      matchingService.calculateMatchScore.mockReturnValue(0.8);
      matchingService.calculateDistance.mockReturnValue(5.2);

      const response = await request(app)
        .post('/api/matching/calculate-score')
        .set('Authorization', 'Bearer test-token')
        .send({
          volunteerId: '507f1f77bcf86cd799439011',
          eventId: '507f1f77bcf86cd799439012'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('matchScore');
      expect(response.body.data).toHaveProperty('distance');
    });
  });
}); 