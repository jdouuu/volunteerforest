// Jest setup file for environment variables and global mocks
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/volunteerforest-test';

// Mock bcryptjs for consistent testing
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('test-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: 'test-user-id' })
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true)
  }))
}));