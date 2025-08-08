// Simple mock events for testing without database dependencies
const mockEvents = [
  {
    _id: '1',
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
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
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
    _id: '2',
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
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
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
  },
  {
    _id: '3',
    title: 'Homeless Shelter Meal Prep',
    description: 'Help prepare meals for the homeless shelter',
    eventType: 'community',
    requiredSkills: ['cooking', 'food safety'],
    location: { 
      address: '123 Shelter St', 
      city: 'New York', 
      state: 'NY', 
      zipCode: '10001' 
    },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    duration: 5,
    maxVolunteers: 10,
    currentVolunteers: 6,
    status: 'upcoming',
    organizer: { 
      name: 'Sarah Wilson', 
      email: 'sarah@shelter.org', 
      phone: '555-9999' 
    },
    requirements: ['Food safety certification preferred', 'Comfortable working in kitchen environment']
  }
];

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
    if (req.method === 'GET') {
      // Return mock events
      console.log('Returning mock events');
      return res.status(200).json(mockEvents);
    }

    if (req.method === 'POST') {
      // Create new event (just add to mock array for demo)
      const newEvent = {
        _id: String(mockEvents.length + 1),
        ...req.body,
        status: 'upcoming',
        currentVolunteers: 0
      };
      mockEvents.push(newEvent);
      console.log('Created mock event:', newEvent.title);
      return res.status(201).json(newEvent);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Simple events API error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
