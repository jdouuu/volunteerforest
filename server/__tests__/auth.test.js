// server/tests/auth.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('../routes/authRoutes');
const UserCredentials = require('../models/UserCredentials');
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');

dotenv.config({ path: './.env.test' });

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let authToken;
let userId;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/volunteermatch_test';
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
}, 15000);

afterEach(async () => {
  await UserCredentials.deleteMany({});
  await UserProfile.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
}, 10000);

jest.mock('../models/UserCredentials'); // Mock UserCredentials model
jest.mock('../models/UserProfile'); // Mock UserProfile model
jest.mock('jsonwebtoken'); // Mock JWT

describe('Auth API', () => {
  it('should register a new user', async () => {
    UserCredentials.create.mockResolvedValue({
      _id: '12345',
      userId: 'testuser@example.com',
      matchPassword: jest.fn().mockResolvedValue(true),
    });

    UserProfile.create.mockResolvedValue({
      userId: '12345',
      fullName: 'New Volunteer',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userId: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.userId).toEqual('testuser@example.com');
  });

  it('should not register a user with existing userId', async () => {
    UserCredentials.findOne.mockResolvedValue({
      userId: 'testuser@example.com',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userId: 'testuser@example.com',
        password: 'newpassword',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('User  ID already registered');
  });

  it('should login an existing user', async () => {
    UserCredentials.findOne.mockResolvedValue({
      _id: '12345',
      userId: 'loginuser@example.com',
      matchPassword: jest.fn().mockResolvedValue(true),
    });

    jwt.sign.mockReturnValue('mockedToken');

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        userId: 'loginuser@example.com',
        password: 'loginpassword',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.userId).toEqual('loginuser@example.com');
  });

  it('should not login with invalid password', async () => {
    UserCredentials.findOne.mockResolvedValue({
      _id: '12345',
      userId: 'invalidpass@example.com',
      matchPassword: jest.fn().mockResolvedValue(false),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        userId: 'invalidpass@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid user ID or password');
  });

  it('should get current user data with valid token', async () => {
    UserCredentials.findById.mockResolvedValue({
      _id: '12345',
      userId: 'currentuser@example.com',
      matchPassword: jest.fn().mockResolvedValue(true),
    });

    jwt.sign.mockReturnValue('mockedToken');

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer mockedToken`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.userId).toEqual('currentuser@example.com');
    expect(res.body).toHaveProperty('_id');
  });

  it('should not get current user data without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Not authorized, no token');
  });

  it('should not get current user data with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Not authorized, token failed');
  });
});
