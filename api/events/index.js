const Event = require('../../server/models/Event');
const mongoose = require('mongoose');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volunteerforest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = connection;
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Get all events or specific event
      const events = await Event.find().sort({ startDate: 1 });
      
      // Seed events if none exist
      if (events.length === 0) {
        const now = new Date();
        const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        
        const sampleEvents = [
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
            requirements: ['Bring gardening gloves', 'Wear comfortable clothes']
          },
          {
            title: 'Food Bank Sorting',
            description: 'Sort and organize donated food items',
            eventType: 'community',
            requiredSkills: ['organizing'],
            location: { address: '789 Charity Ave', city: 'New York', state: 'NY', zipCode: '10003' },
            startDate: inFiveDays,
            endDate: new Date(inFiveDays.getTime() + 4 * 60 * 60 * 1000),
            duration: 4,
            maxVolunteers: 20,
            currentVolunteers: 12,
            status: 'upcoming',
            organizer: { name: 'Mike Johnson', email: 'mike@example.com', phone: '555-5678' },
            requirements: ['Comfortable standing for long periods']
          }
        ];
        
        await Event.insertMany(sampleEvents);
        const newEvents = await Event.find().sort({ startDate: 1 });
        return res.status(200).json(newEvents);
      }
      
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      // Create new event
      const event = await Event.create(req.body);
      return res.status(201).json(event);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
