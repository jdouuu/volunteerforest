// server/__tests__/eventDetails.test.js
const EventDetails = require('../models/EventDetails');

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: function() {
    return {
      methods: {}
    };
  },
  model: jest.fn()
}));

describe('EventDetails Model', () => {
  describe('Instance Methods', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = {
        currentVolunteers: 5,
        maxVolunteers: 10,
        eventDate: new Date('2024-12-25'),
        isEventFull: EventDetails.schema.methods.isEventFull,
        daysUntilEvent: EventDetails.schema.methods.daysUntilEvent,
        getAvailableSpots: EventDetails.schema.methods.getAvailableSpots
      };
    });

    test('isEventFull should return false when not full', () => {
      const result = mockEvent.isEventFull();
      expect(result).toBe(false);
    });

    test('isEventFull should return true when full', () => {
      mockEvent.currentVolunteers = 10;
      const result = mockEvent.isEventFull();
      expect(result).toBe(true);
    });

    test('getAvailableSpots should return correct number', () => {
      const result = mockEvent.getAvailableSpots();
      expect(result).toBe(5);
    });

    test('daysUntilEvent should calculate days correctly', () => {
      // Mock Date.now to return a specific date
      const mockNow = new Date('2024-12-20');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow);
      
      const result = mockEvent.daysUntilEvent();
      expect(result).toBe(5); // 5 days until event
      
      global.Date.mockRestore();
    });
  });

  describe('Schema validation', () => {
    test('should require eventName', () => {
      const schema = EventDetails.schema;
      expect(schema.paths.eventName.isRequired).toBe(true);
    });

    test('should require description', () => {
      const schema = EventDetails.schema;
      expect(schema.paths.description.isRequired).toBe(true);
    });

    test('should require eventDate', () => {
      const schema = EventDetails.schema;
      expect(schema.paths.eventDate.isRequired).toBe(true);
    });

    test('should have urgency enum values', () => {
      const schema = EventDetails.schema;
      const urgencyEnum = schema.paths.urgency.enumValues;
      expect(urgencyEnum).toContain('low');
      expect(urgencyEnum).toContain('medium');
      expect(urgencyEnum).toContain('high');
      expect(urgencyEnum).toContain('critical');
    });

    test('should have status enum values', () => {
      const schema = EventDetails.schema;
      const statusEnum = schema.paths.status.enumValues;
      expect(statusEnum).toContain('upcoming');
      expect(statusEnum).toContain('active');
      expect(statusEnum).toContain('completed');
      expect(statusEnum).toContain('cancelled');
    });
  });
});