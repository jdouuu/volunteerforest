// server/tests/event.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const eventRoutes = require('../routes/eventRoutes');
const authRoutes = require('../routes/authRoutes');
const UserCredentials = require('../models/UserCredentials');
const UserProfile = require('../models/UserProfile');
const EventDetails = require('../models/EventDetails');
const VolunteerHistory = require('../models/VolunteerHistory');

dotenv.config({ path: './.env.test' });

const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);

let authToken;
let userId;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/volunteermatch_test';
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await EventDetails.deleteMany({});
  await VolunteerHistory.deleteMany({});
});

afterAll(async () => {
  await UserCredentials.deleteMany({});
  await UserProfile.deleteMany({});
  await mongoose.connection.close();
});

jest.mock('../models/UserCredentials'); // Mock UserCredentials model
jest.mock('../models/UserProfile'); // Mock UserProfile model
jest.mock('../models/EventDetails'); // Mock EventDetails model
jest.mock('../models/VolunteerHistory'); // Mock VolunteerHistory model

describe('Event API', () => {
  it('should create a new event', async () => {
    UserCredentials.findOne.mockResolvedValue({
      _id: '12345',
      userId: 'admin@example.com',
    });

    EventDetails.create.mockResolvedValue({
      _id: 'eventId',
      eventName: 'Test Event',
      description: 'This is a test event description for unit testing.',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      urgency: 'Low',
      eventDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventName: 'Test Event',
        description: 'This is a test event description for unit testing.',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'Low',
        eventDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('event');
    expect(res.body.event.eventName).toEqual('Test Event');
  });

  it('should not create an event with past date', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventName: 'Past Event',
        description: 'This event is in the past.',
        location: 'Past Location',
        urgency: 'High',
        eventDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      });
    expect(res.statusCode).toEqual(500); // Mongoose validation error
  });

  it('should get all events', async () => {
    EventDetails.find.mockResolvedValue([
      { eventName: 'Event 1', description: 'Description 1', location: 'Location 1', urgency: 'Medium', eventDate: new Date(Date.now() + 86400000).toISOString() },
      { eventName: 'Event 2', description: 'Description 2', location: 'Location 2', urgency: 'High', eventDate: new Date(Date.now() + 172800000).toISOString() },
    ]);

    const res = await request(app).get('/api/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].eventName).toEqual('Event 1');
  });

  it('should get an event by ID', async () => {
    EventDetails.findById.mockResolvedValue({
      eventName: 'Single Event',
      description: 'Description for single event.',
      location: 'Single Location',
      urgency: 'Low',
      eventDate: new Date(Date.now() + 86400000).toISOString(),
    });

    const res = await request(app).get(`/api/events/singleEventId`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.eventName).toEqual('Single Event');
  });

  it('should update an event', async () => {
    EventDetails.findById.mockResolvedValue({
      eventName: 'Event to Update',
      description: 'Original description.',
      location: 'Original Location',
      urgency: 'Low',
      eventDate: new Date(Date.now() + 86400000).toISOString(),
      save: jest.fn().mockResolvedValue({
        eventName: 'Updated Event Name',
        urgency: 'High',
      }),
    });

    const res = await request(app)
      .put(`/api/events/eventId`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventName: 'Updated Event Name',
        urgency: 'High',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.event.eventName).toEqual('Updated Event Name');
    expect(res.body.event.urgency).toEqual('High');
  });

  it('should delete an event', async () => {
    EventDetails.findById.mockResolvedValue({
      _id: 'eventId',
      eventName: 'Event to Delete',
      description: 'Description to delete.',
      location: 'Location to delete',
      urgency: 'Low',
      eventDate: new Date(Date.now() + 86400000).toISOString(),
      deleteOne: jest.fn().mockResolvedValue({}),
    });

    const res = await request(app)
      .delete(`/api/events/eventId`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Event removed');
  });
});
