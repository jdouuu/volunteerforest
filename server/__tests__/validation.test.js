const request = require('supertest');
const express = require('express');
const { 
  validateVolunteerRegistration, 
  validateVolunteerLogin,
  validateEventCreation,
  validateObjectId 
} = require('../middleware/validation');

// Create test app
const app = express();
app.use(express.json());

// Test routes
app.post('/test/register', validateVolunteerRegistration, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.post('/test/login', validateVolunteerLogin, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.post('/test/event', validateEventCreation, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.get('/test/volunteer/:id', validateObjectId('id'), (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

describe('Validation Middleware', () => {
  describe('Volunteer Registration Validation', () => {
    test('should pass with valid registration data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'volunteer'
      };

      const response = await request(app)
        .post('/test/register')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail with invalid name', async () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/test/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0].msg).toContain('Name must be between 2 and 50 characters');
    });

    test('should fail with invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/test/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Must be a valid email address');
    });

    test('should fail with weak password', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/test/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.msg.includes('Password must be between 6 and 100 characters'))).toBe(true);
    });

    test('should fail with invalid role', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/test/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Role must be either volunteer or admin');
    });
  });

  describe('Volunteer Login Validation', () => {
    test('should pass with valid login data', async () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/test/login')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/test/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Must be a valid email address');
    });

    test('should fail with missing password', async () => {
      const invalidData = {
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/test/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Password is required');
    });
  });

  describe('Event Creation Validation', () => {
    test('should pass with valid event data', async () => {
      const validData = {
        title: 'Community Garden Cleanup',
        description: 'Help clean up our local community garden and plant new flowers',
        eventType: 'environmental',
        requiredSkills: ['gardening'],
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        duration: 4,
        maxVolunteers: 20,
        priority: 'medium',
        difficulty: 'moderate'
      };

      const response = await request(app)
        .post('/test/event')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail with short title', async () => {
      const invalidData = {
        title: 'AB',
        description: 'Help clean up our local community garden',
        eventType: 'environmental',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 4,
        maxVolunteers: 20
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Title must be between 3 and 100 characters');
    });

    test('should fail with invalid event type', async () => {
      const invalidData = {
        title: 'Community Event',
        description: 'Help clean up our local community garden',
        eventType: 'invalid-type',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 4,
        maxVolunteers: 20
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Invalid event type');
    });

    test('should fail with past start date', async () => {
      const invalidData = {
        title: 'Community Event',
        description: 'Help clean up our local community garden',
        eventType: 'environmental',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 4,
        maxVolunteers: 20
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Start date must be in the future');
    });

    test('should fail with end date before start date', async () => {
      const startDate = new Date(Date.now() + 25 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const invalidData = {
        title: 'Community Event',
        description: 'Help clean up our local community garden',
        eventType: 'environmental',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: 4,
        maxVolunteers: 20
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('End date must be after start date');
    });

    test('should fail with invalid duration', async () => {
      const invalidData = {
        title: 'Community Event',
        description: 'Help clean up our local community garden',
        eventType: 'environmental',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 30, // Invalid - too many hours
        maxVolunteers: 20
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Duration must be between 1 and 24 hours');
    });

    test('should fail with invalid max volunteers', async () => {
      const invalidData = {
        title: 'Community Event',
        description: 'Help clean up our local community garden',
        eventType: 'environmental',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 4,
        maxVolunteers: 0 // Invalid - must be at least 1
      };

      const response = await request(app)
        .post('/test/event')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Max volunteers must be between 1 and 1000');
    });
  });

  describe('Object ID Validation', () => {
    test('should pass with valid MongoDB ObjectId', async () => {
      const validId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/test/volunteer/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail with invalid ObjectId', async () => {
      const invalidId = 'invalid-id';
      
      const response = await request(app)
        .get(`/test/volunteer/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Invalid id format');
    });
  });
});