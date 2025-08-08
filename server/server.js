// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// Use the Event model aligned routes for frontend expectations
const eventsV2Routes = require('./routes/eventsV2');
const path = require('path'); // Import path module for serving static files

dotenv.config({ path: __dirname + '/.env' }); // Load environment variables from .env file

try {
  connectDB(); // Connect to MongoDB
} catch (error) {
  console.error("CRITICAL_ERROR: Failed to connect to MongoDB on startup.", error);
  process.exit(1);
}

const app = express();

// CORS middleware with specific configuration
const corsOptions = {
  origin: true, // Allow all origins for now, will tighten later
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventsV2Routes);
app.use('/api/history', eventRoutes); // History routes are also part of eventRoutes for now

// Debug route for Vercel deployment
app.get('/api/debug', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing',
    jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing',
    vercel: process.env.VERCEL || 'not set',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files in production
// This block should be placed after all API routes
app.get('/', (req, res) => {
    res.send('API is running...');
  });

// Seed minimal events in empty DB for demo environments
(async () => {
  try {
    const Event = require('./models/Event');
    const count = await Event.countDocuments();
    if (count === 0) {
      const now = new Date();
      const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      await Event.insertMany([
        {
          title: 'Community Garden Planting',
          description: 'Help plant vegetables in the community garden',
          eventType: 'environmental',
          requiredSkills: ['gardening'],
          location: { address: '456 Garden St', city: 'New York', state: 'NY', zipCode: '10002' },
          startDate: inTwoDays,
          endDate: new Date(inTwoDays.getTime() + 3 * 60 * 60 * 1000),
          duration: 3,
          maxVolunteers: 15,
          currentVolunteers: 8,
          status: 'upcoming',
          organizer: { name: 'Jane Smith', email: 'jane@example.com', phone: '555-1234' },
          requirements: ['Bring gardening gloves', 'Wear comfortable clothes'],
          benefits: ['Learn gardening skills', 'Meet community members'],
          difficulty: 'easy',
          priority: 'medium'
        },
        {
          title: 'Food Bank Distribution',
          description: 'Help distribute food to families in need',
          eventType: 'community',
          requiredSkills: ['cooking', 'customer_service'],
          location: { address: '789 Food St', city: 'New York', state: 'NY', zipCode: '10003' },
          startDate: inFiveDays,
          endDate: new Date(inFiveDays.getTime() + 6 * 60 * 60 * 1000),
          duration: 6,
          maxVolunteers: 20,
          currentVolunteers: 12,
          status: 'upcoming',
          organizer: { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-5678' },
          requirements: ['Food safety training', 'Comfortable standing for long periods'],
          benefits: ['Help families in need', 'Gain food service experience'],
          difficulty: 'moderate',
          priority: 'high'
        }
      ]);
      console.log('Seeded default events');
    }
  } catch (seedErr) {
    console.warn('Event seeding skipped:', seedErr.message);
  }
})();

// Basic error handling middleware (can be expanded)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Export the app for Vercel serverless deployment
module.exports = app;

// Only listen if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}
