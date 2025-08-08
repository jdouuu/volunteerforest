const { connectToDatabase } = require('../auth/mongodb');
const mongoose = require('mongoose');

// Event Schema
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { type: String, required: true },
  requiredSkills: [String],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: Number,
  maxVolunteers: { type: Number, default: 10 },
  currentVolunteers: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organizer: {
    name: String,
    email: String,
    phone: String
  },
  requirements: [String],
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

module.exports = async function handler(req, res) {
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
      // Get events from MongoDB
      let events = await Event.find().sort({ startDate: 1 }).limit(50);
      
      // Seed some events if none exist
      if (events.length === 0) {
        console.log('Seeding initial events...');
        const now = new Date();
        const sampleEvents = [
          {
            title: 'Community Garden Planting',
            description: 'Help plant vegetables in the community garden',
            eventType: 'environmental',
            requiredSkills: ['gardening'],
            location: { 
              address: '456 Garden St', 
              city: 'New York', 
              state: 'NY', 
              zipCode: '10002' 
            },
            startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            duration: 3,
            maxVolunteers: 15,
            currentVolunteers: 8,
            status: 'upcoming',
            organizer: { 
              name: 'Jane Smith', 
              email: 'jane@example.com', 
              phone: '555-1234' 
            },
            requirements: ['Bring gardening gloves', 'Wear comfortable clothes']
          },
          {
            title: 'Food Bank Sorting',
            description: 'Sort and organize donated food items',
            eventType: 'community',
            requiredSkills: ['organizing'],
            location: { 
              address: '789 Charity Ave', 
              city: 'New York', 
              state: 'NY', 
              zipCode: '10003' 
            },
            startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            duration: 4,
            maxVolunteers: 20,
            currentVolunteers: 12,
            status: 'upcoming',
            organizer: { 
              name: 'Mike Johnson', 
              email: 'mike@example.com', 
              phone: '555-5678' 
            },
            requirements: ['Comfortable standing for long periods']
          }
        ];
        
        await Event.insertMany(sampleEvents);
        events = await Event.find().sort({ startDate: 1 }).limit(50);
      }
      
      console.log(`Returning ${events.length} events from MongoDB`);
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      // Create new event
      const event = new Event(req.body);
      await event.save();
      console.log('Created event:', event.title);
      return res.status(201).json(event);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('MongoDB events API error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
