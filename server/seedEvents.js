const mongoose = require('mongoose');
const EventDetails = require('./models/EventDetails');
require('dotenv').config();

const sampleEvents = [
  {
    eventName: 'Community Garden Planting',
    description: 'Join us for a day of planting vegetables and herbs in our community garden. Perfect for all skill levels! We\'ll be planting tomatoes, peppers, herbs, and more.',
    location: {
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zipcode: '77001'
    },
    requiredSkills: ['gardening', 'physical labor'],
    urgency: 'medium',
    eventDate: new Date('2025-08-15T09:00:00.000Z'),
    maxVolunteers: 20,
    currentVolunteers: 8,
    organizer: {
      name: 'Green Thumb Initiative',
      email: 'garden@community.org',
      phone: '(555) 123-4567'
    }
  },
  {
    eventName: 'Food Bank Sorting',
    description: 'Help organize and sort donations at the local food bank. This is a great way to give back to the community.',
    location: {
      address: '456 Oak Ave',
      city: 'Houston',
      state: 'TX',
      zipcode: '77002'
    },
    requiredSkills: ['organization', 'customer service'],
    urgency: 'high',
    eventDate: new Date('2025-08-12T10:00:00.000Z'),
    maxVolunteers: 15,
    currentVolunteers: 12,
    organizer: {
      name: 'Houston Food Bank',
      email: 'volunteer@houstonfoodbank.org',
      phone: '(555) 234-5678'
    }
  },
  {
    eventName: 'Beach Cleanup',
    description: 'Environmental cleanup event at Galveston Beach. Help remove trash and debris to protect marine life.',
    location: {
      address: '789 Seawall Blvd',
      city: 'Galveston',
      state: 'TX',
      zipcode: '77550'
    },
    requiredSkills: ['physical labor', 'environmental awareness'],
    urgency: 'high',
    eventDate: new Date('2025-08-20T08:00:00.000Z'),
    maxVolunteers: 30,
    currentVolunteers: 18,
    organizer: {
      name: 'Surfrider Foundation',
      email: 'cleanup@surfrider.org',
      phone: '(555) 345-6789'
    }
  },
  {
    eventName: 'Senior Center Activities',
    description: 'Spend time with seniors at the community center. Help with games, reading, and general companionship.',
    location: {
      address: '321 Elder St',
      city: 'Houston',
      state: 'TX',
      zipcode: '77003'
    },
    requiredSkills: ['social skills', 'patience', 'communication'],
    urgency: 'medium',
    eventDate: new Date('2025-08-18T14:00:00.000Z'),
    maxVolunteers: 10,
    currentVolunteers: 6,
    organizer: {
      name: 'Senior Services of Houston',
      email: 'activities@seniorcenter.org',
      phone: '(555) 456-7890'
    }
  },
  {
    eventName: 'Youth Tutoring Program',
    description: 'Help elementary school students with their homework and reading skills. Teaching experience preferred but not required.',
    location: {
      address: '555 Education Way',
      city: 'Houston',
      state: 'TX',
      zipcode: '77004'
    },
    requiredSkills: ['teaching', 'patience', 'communication'],
    urgency: 'medium',
    eventDate: new Date('2025-08-22T16:00:00.000Z'),
    maxVolunteers: 12,
    currentVolunteers: 9,
    organizer: {
      name: 'Youth Education Alliance',
      email: 'tutoring@yeahouston.org',
      phone: '(555) 567-8901'
    }
  },
  {
    eventName: 'Animal Shelter Care',
    description: 'Help care for rescued animals at the local shelter. Tasks include feeding, cleaning, and socializing with the animals.',
    location: {
      address: '888 Pet Lane',
      city: 'Houston',
      state: 'TX',
      zipcode: '77005'
    },
    requiredSkills: ['animal care', 'physical labor', 'compassion'],
    urgency: 'critical',
    eventDate: new Date('2025-08-10T09:00:00.000Z'),
    maxVolunteers: 8,
    currentVolunteers: 7,
    organizer: {
      name: 'Houston SPCA',
      email: 'volunteers@houstonspca.org',
      phone: '(555) 678-9012'
    }
  },
  {
    eventName: 'Homeless Shelter Meal Service',
    description: 'Help prepare and serve meals at the downtown homeless shelter. A rewarding way to help those in need.',
    location: {
      address: '999 Help St',
      city: 'Houston',
      state: 'TX',
      zipcode: '77006'
    },
    requiredSkills: ['cooking', 'customer service', 'teamwork'],
    urgency: 'high',
    eventDate: new Date('2025-08-14T17:00:00.000Z'),
    maxVolunteers: 15,
    currentVolunteers: 11,
    organizer: {
      name: 'Downtown Shelter Coalition',
      email: 'volunteers@shelterhelp.org',
      phone: '(555) 789-0123'
    }
  },
  {
    eventName: 'Park Trail Maintenance',
    description: 'Help maintain hiking trails at Memorial Park. Tasks include clearing debris, minor repairs, and trail marking.',
    location: {
      address: '6501 Memorial Dr',
      city: 'Houston',
      state: 'TX',
      zipcode: '77007'
    },
    requiredSkills: ['physical labor', 'outdoor skills', 'teamwork'],
    urgency: 'medium',
    eventDate: new Date('2025-08-25T08:00:00.000Z'),
    maxVolunteers: 20,
    currentVolunteers: 5,
    organizer: {
      name: 'Memorial Park Conservancy',
      email: 'trails@memorialparkconservancy.org',
      phone: '(555) 890-1234'
    }
  }
];

const seedEvents = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing events...');
    await EventDetails.deleteMany({});

    console.log('Adding sample events...');
    const events = await EventDetails.insertMany(sampleEvents);
    console.log(`Added ${events.length} sample events`);

    console.log('Sample events added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
