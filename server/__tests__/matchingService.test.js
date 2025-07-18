const matchingService = require('../services/matchingService');

// Mock the models
jest.mock('../models/Volunteer');
jest.mock('../models/Event');

const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

describe('MatchingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    test('should calculate distance between two coordinates correctly', () => {
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance = matchingService.calculateDistance(lat1, lon1, lat2, lon2);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    test('should return 0 for same coordinates', () => {
      const lat = 40.7128;
      const lon = -74.0060;

      const distance = matchingService.calculateDistance(lat, lon, lat, lon);
      
      expect(distance).toBe(0);
    });
  });

  describe('calculateSkillMatch', () => {
    test('should return 1.0 when no required skills', () => {
      const volunteerSkills = ['gardening', 'cooking'];
      const requiredSkills = [];

      const match = matchingService.calculateSkillMatch(volunteerSkills, requiredSkills);
      
      expect(match).toBe(1.0);
    });

    test('should return 0.0 when no volunteer skills', () => {
      const volunteerSkills = [];
      const requiredSkills = ['gardening', 'cooking'];

      const match = matchingService.calculateSkillMatch(volunteerSkills, requiredSkills);
      
      expect(match).toBe(0.0);
    });

    test('should calculate partial skill match correctly', () => {
      const volunteerSkills = ['gardening', 'cooking', 'teaching'];
      const requiredSkills = ['gardening', 'cooking', 'medical'];

      const match = matchingService.calculateSkillMatch(volunteerSkills, requiredSkills);
      
      expect(match).toBe(2/3); // 2 out of 3 skills match
    });

    test('should return 1.0 for perfect skill match', () => {
      const volunteerSkills = ['gardening', 'cooking'];
      const requiredSkills = ['gardening', 'cooking'];

      const match = matchingService.calculateSkillMatch(volunteerSkills, requiredSkills);
      
      expect(match).toBe(1.0);
    });
  });

  describe('checkAvailabilityMatch', () => {
    test('should return true for matching weekday morning availability', () => {
      const volunteerAvailability = {
        weekdays: { morning: true, afternoon: false, evening: false },
        weekends: { morning: false, afternoon: false, evening: false }
      };
      const eventDate = new Date('2024-01-15T09:00:00'); // Monday 9 AM

      const match = matchingService.checkAvailabilityMatch(volunteerAvailability, eventDate);
      
      expect(match).toBe(true);
    });

    test('should return false for non-matching availability', () => {
      const volunteerAvailability = {
        weekdays: { morning: false, afternoon: false, evening: false },
        weekends: { morning: false, afternoon: false, evening: false }
      };
      const eventDate = new Date('2024-01-15T09:00:00'); // Monday 9 AM

      const match = matchingService.checkAvailabilityMatch(volunteerAvailability, eventDate);
      
      expect(match).toBe(false);
    });

    test('should handle weekend availability correctly', () => {
      const volunteerAvailability = {
        weekdays: { morning: false, afternoon: false, evening: false },
        weekends: { morning: true, afternoon: false, evening: false }
      };
      const eventDate = new Date('2024-01-20T09:00:00'); // Saturday 9 AM

      const match = matchingService.checkAvailabilityMatch(volunteerAvailability, eventDate);
      
      expect(match).toBe(true);
    });
  });

  describe('calculateMatchScore', () => {
    const mockVolunteer = {
      skills: ['gardening', 'cooking'],
      availability: {
        weekdays: { morning: true, afternoon: false, evening: false },
        weekends: { morning: false, afternoon: false, evening: false }
      },
      preferences: {
        maxDistance: 10,
        eventTypes: ['environmental', 'community']
      },
      location: {
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    };

    const mockEvent = {
      requiredSkills: ['gardening'],
      startDate: new Date('2024-01-15T09:00:00'), // Monday 9 AM
      eventType: 'environmental',
      location: {
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    };

    test('should calculate match score correctly', () => {
      const score = matchingService.calculateMatchScore(mockVolunteer, mockEvent);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
      expect(typeof score).toBe('number');
    });

    test('should handle missing coordinates gracefully', () => {
      const volunteerWithoutCoords = { ...mockVolunteer, location: {} };
      const eventWithoutCoords = { ...mockEvent, location: {} };

      const score = matchingService.calculateMatchScore(volunteerWithoutCoords, eventWithoutCoords);
      
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });
  });

  describe('findMatchingEvents', () => {
    test('should find matching events for volunteer', async () => {
      const mockVolunteer = {
        _id: 'volunteer123',
        skills: ['gardening'],
        availability: {
          weekdays: { morning: true, afternoon: false, evening: false },
          weekends: { morning: false, afternoon: false, evening: false }
        },
        preferences: {
          maxDistance: 10,
          eventTypes: ['environmental']
        },
        location: {
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      };

      const mockEvents = [
        {
          _id: 'event1',
          title: 'Community Garden',
          requiredSkills: ['gardening'],
          startDate: new Date('2024-01-15T09:00:00'),
          eventType: 'environmental',
          location: {
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          status: 'upcoming',
          currentVolunteers: 0,
          maxVolunteers: 10
        }
      ];

      Volunteer.findById.mockResolvedValue(mockVolunteer);
      Event.find.mockResolvedValue(mockEvents);

      const result = await matchingService.findMatchingEvents('volunteer123', 10);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('event');
      expect(result[0]).toHaveProperty('matchScore');
    });

    test('should handle volunteer not found', async () => {
      Volunteer.findById.mockResolvedValue(null);

      await expect(matchingService.findMatchingEvents('nonexistent', 10))
        .rejects.toThrow('Volunteer not found');
    });
  });

  describe('findMatchingVolunteers', () => {
    test('should find matching volunteers for event', async () => {
      const mockEvent = {
        _id: 'event123',
        title: 'Community Garden',
        requiredSkills: ['gardening'],
        startDate: new Date('2024-01-15T09:00:00'),
        eventType: 'environmental',
        location: {
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      };

      const mockVolunteers = [
        {
          _id: 'volunteer1',
          name: 'John Doe',
          skills: ['gardening', 'cooking'],
          availability: {
            weekdays: { morning: true, afternoon: false, evening: false },
            weekends: { morning: false, afternoon: false, evening: false }
          },
          preferences: {
            maxDistance: 10,
            eventTypes: ['environmental']
          },
          location: {
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          isActive: true
        }
      ];

      Event.findById.mockResolvedValue(mockEvent);
      Volunteer.find.mockResolvedValue(mockVolunteers);

      const result = await matchingService.findMatchingVolunteers('event123', 20);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('volunteer');
      expect(result[0]).toHaveProperty('matchScore');
    });

    test('should handle event not found', async () => {
      Event.findById.mockResolvedValue(null);

      await expect(matchingService.findMatchingVolunteers('nonexistent', 20))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getUrgentMatchingAlerts', () => {
    test('should return urgent alerts for events needing volunteers', async () => {
      const mockEvents = [
        {
          _id: 'event1',
          title: 'Urgent Event',
          maxVolunteers: 10,
          currentVolunteers: 3,
          startDate: new Date('2024-01-20T09:00:00'),
          getAvailableSpots: jest.fn().mockReturnValue(7),
          daysUntilEvent: jest.fn().mockReturnValue(5)
        }
      ];

      // Mock the chained methods properly
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvents)
      });
      Event.find = mockFind;

      const result = await matchingService.getUrgentMatchingAlerts();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('event');
      expect(result[0]).toHaveProperty('availableSpots');
      expect(result[0]).toHaveProperty('urgency');
    });
  });

  describe('getMatchingStats', () => {
    test('should return matching statistics', async () => {
      Volunteer.countDocuments.mockResolvedValue(100);
      Event.countDocuments
        .mockResolvedValueOnce(50) // totalEvents
        .mockResolvedValueOnce(10); // urgentEvents

      const result = await matchingService.getMatchingStats();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalVolunteers');
      expect(result).toHaveProperty('totalEvents');
      expect(result).toHaveProperty('urgentEvents');
      expect(result).toHaveProperty('pendingMatches');
      expect(result.totalVolunteers).toBe(100);
      expect(result.totalEvents).toBe(50);
      expect(result.urgentEvents).toBe(10);
    });
  });
}); 