# VolunteerForest Backend

A Node.js/Express backend for the VolunteerForest volunteer matching system.

## Features

- **Volunteer Matching Module**: Intelligent matching algorithm based on skills, availability, location, and preferences
- **Authentication**: JWT-based authentication system
- **RESTful API**: Complete CRUD operations for volunteers and events
- **MongoDB Integration**: Mongoose ODM for data modeling
- **Real-time Matching**: Calculate match scores and find optimal matches

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd volunteerforest/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/volunteerforest
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/volunteers/register` - Register a new volunteer
- `POST /api/volunteers/login` - Login volunteer
- `GET /api/auth/verify` - Verify JWT token

### Volunteers
- `GET /api/volunteers/profile` - Get volunteer profile
- `PUT /api/volunteers/profile` - Update volunteer profile
- `GET /api/volunteers` - Get all volunteers (admin only)

### Events
- `POST /api/events` - Create new event (admin only)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/events/:id/register` - Register for event

### Matching
- `GET /api/matching/events/:volunteerId` - Find matching events for volunteer
- `GET /api/matching/volunteers/:eventId` - Find matching volunteers for event
- `GET /api/matching/alerts` - Get urgent matching alerts
- `GET /api/matching/stats` - Get matching statistics
- `POST /api/matching/calculate-score` - Calculate match score

## Volunteer Matching Algorithm

The matching system uses a weighted scoring algorithm with the following criteria:

1. **Skill Match (40%)**: Percentage of required skills that the volunteer possesses
2. **Availability (30%)**: Whether the volunteer is available during the event time
3. **Distance (20%)**: Proximity between volunteer and event locations
4. **Preferences (10%)**: Match between volunteer's preferred event types and the event type

### Match Score Calculation

```javascript
// Example match score calculation
const matchScore = (skillMatch * 0.4) + 
                   (availabilityMatch * 0.3) + 
                   (distanceScore * 0.2) + 
                   (preferenceMatch * 0.1);
```

## Data Models

### Volunteer Schema
- Basic info (name, email, password)
- Skills array
- Availability schedule
- Location and preferences
- Matching history and ratings

### Event Schema
- Event details (title, description, type)
- Required skills
- Location and timing
- Capacity and current status
- Organizer information

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/volunteerforest |
| `JWT_SECRET` | JWT secret key | Required |
| `NODE_ENV` | Environment mode | development |

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
server/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── index.js         # Main server file
└── package.json     # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 