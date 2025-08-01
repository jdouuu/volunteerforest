// server/tests/user.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('../routes/userRoutes');
const authRoutes = require('../routes/authRoutes');
const UserCredentials = require('../models/UserCredentials');
const UserProfile = require('../models/UserProfile');

dotenv.config({ path: './.env.test' });

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

let authToken;
let userId;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/volunteermatch_test';
  await mongoose.connect(mongoUri);

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      userId: 'testuser@example.com',
      password: 'password123',
    });
  authToken = registerRes.body.token;
  userId = registerRes.body._id;

  await UserProfile.findOneAndUpdate(
    { userId: userId },
    { fullName: 'Test User' },
    { new: true, upsert: true }
  );
});

afterEach(async () => {
  await UserProfile.deleteMany({});
});

afterAll(async () => {
  await UserCredentials.deleteMany({});
  await mongoose.connection.close();
});

jest.mock('../models/UserProfile'); // Mock UserProfile model
jest.mock('../models/UserCredentials'); // Mock UserCredentials model

describe('User  Profile API', () => {
  it('should get authenticated user profile', async () => {
    UserProfile.findOne.mockResolvedValue({
      fullName: 'Test User',
      userId: { userId: 'testuser@example.com' },
    });

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('fullName', 'Test User');
    expect(res.body.userId).toHaveProperty('userId', 'testuser@example.com');
  });

  it('should update authenticated user profile', async () => {
    const updateData = {
      fullName: 'Updated User',
      address: '123 Updated St',
      city: 'Updated City',
      state: 'CA',
      zipcode: '12345',
      skills: ['Updated Skill'],
      preferences: ['Updated Preference'],
      availability: ['Updated Availability'],
    };

    UserProfile.findOne.mockResolvedValue({
      fullName: 'Test User',
      save: jest.fn().mockResolvedValue({
        fullName: 'Updated User',
      }),
    });

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Profile updated successfully');
    expect(res.body.profile.fullName).toEqual('Updated User');
  });

  it('should not update profile with invalid state format', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ state: 'Texas' }); // Invalid state format

    expect(res.statusCode).toEqual(500); // Mongoose validation error
  });

  it('should get all user profiles (admin placeholder)', async () => {
    UserProfile.find.mockResolvedValue([
      { fullName: 'Test User', userId: { userId: 'testuser@example.com' } },
      { fullName: 'Another User', userId: { userId: 'anotheruser@example.com' } },
    ]);

    const res = await request(app)
      .get('/api/users/all-profiles')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('fullName');
    expect(res.body[0].userId).toHaveProperty('userId');
  });

  it('should not get user profile without token', async () => {
    const res = await request(app)
      .get('/api/users/profile');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Not authorized, no token');
  });
});
