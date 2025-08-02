// server/seedStates.js
const mongoose = require('mongoose');
const States = require('./models/States');
const connectDB = require('./config/db');

const states = [
  { stateCode: 'AL', stateName: 'Alabama', region: 'Southeast', capital: 'Montgomery' },
  { stateCode: 'AK', stateName: 'Alaska', region: 'West', capital: 'Juneau' },
  { stateCode: 'AZ', stateName: 'Arizona', region: 'Southwest', capital: 'Phoenix' },
  { stateCode: 'AR', stateName: 'Arkansas', region: 'Southeast', capital: 'Little Rock' },
  { stateCode: 'CA', stateName: 'California', region: 'West', capital: 'Sacramento' },
  { stateCode: 'CO', stateName: 'Colorado', region: 'West', capital: 'Denver' },
  { stateCode: 'CT', stateName: 'Connecticut', region: 'Northeast', capital: 'Hartford' },
  { stateCode: 'DE', stateName: 'Delaware', region: 'Northeast', capital: 'Dover' },
  { stateCode: 'FL', stateName: 'Florida', region: 'Southeast', capital: 'Tallahassee' },
  { stateCode: 'GA', stateName: 'Georgia', region: 'Southeast', capital: 'Atlanta' },
  { stateCode: 'HI', stateName: 'Hawaii', region: 'West', capital: 'Honolulu' },
  { stateCode: 'ID', stateName: 'Idaho', region: 'West', capital: 'Boise' },
  { stateCode: 'IL', stateName: 'Illinois', region: 'Midwest', capital: 'Springfield' },
  { stateCode: 'IN', stateName: 'Indiana', region: 'Midwest', capital: 'Indianapolis' },
  { stateCode: 'IA', stateName: 'Iowa', region: 'Midwest', capital: 'Des Moines' },
  { stateCode: 'KS', stateName: 'Kansas', region: 'Midwest', capital: 'Topeka' },
  { stateCode: 'KY', stateName: 'Kentucky', region: 'Southeast', capital: 'Frankfort' },
  { stateCode: 'LA', stateName: 'Louisiana', region: 'Southeast', capital: 'Baton Rouge' },
  { stateCode: 'ME', stateName: 'Maine', region: 'Northeast', capital: 'Augusta' },
  { stateCode: 'MD', stateName: 'Maryland', region: 'Northeast', capital: 'Annapolis' },
  { stateCode: 'MA', stateName: 'Massachusetts', region: 'Northeast', capital: 'Boston' },
  { stateCode: 'MI', stateName: 'Michigan', region: 'Midwest', capital: 'Lansing' },
  { stateCode: 'MN', stateName: 'Minnesota', region: 'Midwest', capital: 'Saint Paul' },
  { stateCode: 'MS', stateName: 'Mississippi', region: 'Southeast', capital: 'Jackson' },
  { stateCode: 'MO', stateName: 'Missouri', region: 'Midwest', capital: 'Jefferson City' },
  { stateCode: 'MT', stateName: 'Montana', region: 'West', capital: 'Helena' },
  { stateCode: 'NE', stateName: 'Nebraska', region: 'Midwest', capital: 'Lincoln' },
  { stateCode: 'NV', stateName: 'Nevada', region: 'West', capital: 'Carson City' },
  { stateCode: 'NH', stateName: 'New Hampshire', region: 'Northeast', capital: 'Concord' },
  { stateCode: 'NJ', stateName: 'New Jersey', region: 'Northeast', capital: 'Trenton' },
  { stateCode: 'NM', stateName: 'New Mexico', region: 'Southwest', capital: 'Santa Fe' },
  { stateCode: 'NY', stateName: 'New York', region: 'Northeast', capital: 'Albany' },
  { stateCode: 'NC', stateName: 'North Carolina', region: 'Southeast', capital: 'Raleigh' },
  { stateCode: 'ND', stateName: 'North Dakota', region: 'Midwest', capital: 'Bismarck' },
  { stateCode: 'OH', stateName: 'Ohio', region: 'Midwest', capital: 'Columbus' },
  { stateCode: 'OK', stateName: 'Oklahoma', region: 'Southwest', capital: 'Oklahoma City' },
  { stateCode: 'OR', stateName: 'Oregon', region: 'West', capital: 'Salem' },
  { stateCode: 'PA', stateName: 'Pennsylvania', region: 'Northeast', capital: 'Harrisburg' },
  { stateCode: 'RI', stateName: 'Rhode Island', region: 'Northeast', capital: 'Providence' },
  { stateCode: 'SC', stateName: 'South Carolina', region: 'Southeast', capital: 'Columbia' },
  { stateCode: 'SD', stateName: 'South Dakota', region: 'Midwest', capital: 'Pierre' },
  { stateCode: 'TN', stateName: 'Tennessee', region: 'Southeast', capital: 'Nashville' },
  { stateCode: 'TX', stateName: 'Texas', region: 'Southwest', capital: 'Austin' },
  { stateCode: 'UT', stateName: 'Utah', region: 'West', capital: 'Salt Lake City' },
  { stateCode: 'VT', stateName: 'Vermont', region: 'Northeast', capital: 'Montpelier' },
  { stateCode: 'VA', stateName: 'Virginia', region: 'Southeast', capital: 'Richmond' },
  { stateCode: 'WA', stateName: 'Washington', region: 'West', capital: 'Olympia' },
  { stateCode: 'WV', stateName: 'West Virginia', region: 'Southeast', capital: 'Charleston' },
  { stateCode: 'WI', stateName: 'Wisconsin', region: 'Midwest', capital: 'Madison' },
  { stateCode: 'WY', stateName: 'Wyoming', region: 'West', capital: 'Cheyenne' }
];

const seedStates = async () => {
  try {
    await connectDB();
    
    // Clear existing states
    await States.deleteMany({});
    
    // Insert all states
    await States.insertMany(states);
    
    console.log(`Successfully seeded ${states.length} states into the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding states:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedStates();
}

module.exports = { states, seedStates };