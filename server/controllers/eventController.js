// server/controllers/eventController.js
const EventDetails = require('../models/EventDetails');
const VolunteerHistory = require('../models/VolunteerHistory');
const UserProfile = require('../models/UserProfile');
const asyncHandler = require('express-async-handler');

/**
 * @route POST /api/events
 * @description Create a new event.
 * @access Private (Admin only - for now, any authenticated user can create)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createEvent = asyncHandler(async (req, res) => {
  const { eventName, description, location, requiredSkills, urgency, eventDate } = req.body;

  // Basic validation
  if (!eventName || !description || !location || !urgency || !eventDate) {
    res.status(400);
    throw new Error('Please fill all required event fields');
  }

  const event = await EventDetails.create({
    eventName,
    description,
    location,
    requiredSkills,
    urgency,
    eventDate,
    createdBy: req.user._id, // Link event to the creating user (admin)
  });

  if (event) {
    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } else {
    res.status(400);
    throw new Error('Invalid event data');
  }
});

/**
 * @route GET /api/events
 * @description Get all events.
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getEvents = asyncHandler(async (req, res) => {
  const events = await EventDetails.find({});
  res.json(events);
});

/**
 * @route GET /api/events/:id
 * @description Get a single event by ID.
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await EventDetails.findById(req.params.id);

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

/**
 * @route PUT /api/events/:id
 * @description Update an event.
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateEvent = asyncHandler(async (req, res) => {
  const { eventName, description, location, requiredSkills, urgency, eventDate } = req.body;

  const event = await EventDetails.findById(req.params.id);

  if (event) {
    event.eventName = eventName || event.eventName;
    event.description = description || event.description;
    event.location = location || event.location;
    event.requiredSkills = requiredSkills || event.requiredSkills;
    event.urgency = urgency || event.urgency;
    event.eventDate = eventDate || event.eventDate;

    const updatedEvent = await event.save();
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

/**
 * @route DELETE /api/events/:id
 * @description Delete an event.
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await EventDetails.findById(req.params.id);

  if (event) {
    await EventDetails.deleteOne({ _id: event._id }); // Use deleteOne for Mongoose 6+
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

/**
 * @route GET /api/events/match
 * @description Match volunteers to events based on skills, preferences, and availability.
 * @access Private (Admin or specific matching module)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const matchVolunteersToEvents = asyncHandler(async (req, res) => {
  // This is a simplified matching logic. A real-world scenario would be more complex.
  const events = await EventDetails.find({});
  const volunteers = await UserProfile.find({}).populate('userId', 'userId'); // Get all volunteers

  const matches = [];

  for (const event of events) {
    const potentialVolunteers = [];
    for (const volunteer of volunteers) {
      let score = 0;

      // 1. Skill Matching (Exact match for now, could be fuzzy)
      if (event.requiredSkills && event.requiredSkills.length > 0) {
        const commonSkills = event.requiredSkills.filter(skill =>
          volunteer.skills.includes(skill)
        );
        score += commonSkills.length * 10; // Higher score for more matching skills
      }

      // 2. Preference Matching (Could be based on event type, location preference etc.)
      // For simplicity, let's assume preferences are general interests
      const commonPreferences = volunteer.preferences.filter(pref =>
        event.description.toLowerCase().includes(pref.toLowerCase()) ||
        event.eventName.toLowerCase().includes(pref.toLowerCase())
      );
      score += commonPreferences.length * 5;

      // 3. Availability Matching (Very basic, needs proper date/time logic)
      // This is a placeholder. Real availability matching needs complex date/time range comparisons.
      // For example, if eventDate is a weekend, check if volunteer.availability includes 'Weekends'
      const eventDay = new Date(event.eventDate).getDay(); // 0 for Sunday, 6 for Saturday
      if ((eventDay === 0 || eventDay === 6) && volunteer.availability.includes('Weekends')) {
        score += 7;
      } else if ((eventDay > 0 && eventDay < 6) && volunteer.availability.includes('Weekdays')) {
        score += 7;
      }
      // Add more complex availability checks here (e.g., 'Mornings', 'Evenings')

      // 4. Location Matching (Placeholder, needs geospatial queries for real accuracy)
      // For now, a simple city/state match
      if (volunteer.city && event.location.toLowerCase().includes(volunteer.city.toLowerCase())) {
        score += 8;
      }
      if (volunteer.state && event.location.toLowerCase().includes(volunteer.state.toLowerCase())) {
        score += 5;
      }

      // 5. Urgency (Events with higher urgency might prioritize volunteers with higher scores)
      // This would influence sorting or assignment logic, not direct matching score.

      if (score > 0) { // Only consider volunteers with some match
        potentialVolunteers.push({
          volunteer: volunteer.toObject(), // Convert Mongoose doc to plain object
          score: score,
        });
      }
    }

    // Sort potential volunteers by score (highest first)
    potentialVolunteers.sort((a, b) => b.score - a.score);

    matches.push({
      event: event.toObject(),
      potentialVolunteers: potentialVolunteers.slice(0, 5), // Top 5 matches
    });
  }

  res.json(matches);
});

/**
 * @route POST /api/history
 * @description Record volunteer participation history.
 * @access Private
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const recordVolunteerHistory = asyncHandler(async (req, res) => {
  const { eventId, participationDate, feedback, hoursVolunteered } = req.body;

  // Ensure the event exists
  const eventExists = await EventDetails.findById(eventId);
  if (!eventExists) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Ensure the user exists (req.user._id is from authenticated user)
  const userExists = await UserProfile.findOne({ userId: req.user._id });
  if (!userExists) {
    res.status(404);
    throw new Error('User profile not found');
  }

  // Create history record
  const history = await VolunteerHistory.create({
    userId: req.user._id,
    eventId,
    participationDate,
    feedback,
    hoursVolunteered,
  });

  if (history) {
    res.status(201).json({
      message: 'Volunteer history recorded successfully',
      history,
    });
  } else {
    res.status(400);
    throw new Error('Invalid history data');
  }
});

/**
 * @route GET /api/history/user/:userId
 * @description Get volunteer history for a specific user.
 * @access Private (User can see their own, Admin can see others)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getUserHistory = asyncHandler(async (req, res) => {
  // Logic to ensure user can only see their own history unless they are admin
  if (req.params.userId !== req.user._id.toString()) {
    // In a real app, check if req.user has admin role
    // For now, only allow user to fetch their own history
    res.status(403);
    throw new Error('Not authorized to view this history');
  }

  const history = await VolunteerHistory.find({ userId: req.params.userId })
    .populate('eventId', 'eventName location eventDate') // Populate event details
    .populate('userId', 'userId'); // Populate user ID (username)

  if (history) {
    res.json(history);
  } else {
    res.status(404);
    throw new Error('No volunteer history found for this user');
  }
});

/**
 * @route GET /api/history/event/:eventId
 * @description Get volunteer history for a specific event.
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getEventHistory = asyncHandler(async (req, res) => {
  // This route should be restricted to admin users
  const history = await VolunteerHistory.find({ eventId: req.params.eventId })
    .populate('userId', 'userId') // Populate user ID (username)
    .populate('eventId', 'eventName location eventDate'); // Populate event details

  if (history) {
    res.json(history);
  } else {
    res.status(404);
    throw new Error('No volunteer history found for this event');
  }
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  matchVolunteersToEvents,
  recordVolunteerHistory,
  getUserHistory,
  getEventHistory,
};
