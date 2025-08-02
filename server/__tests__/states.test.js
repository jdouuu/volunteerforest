// server/__tests__/states.test.js
const States = require('../models/States');

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: function() {
    return {
      statics: {},
      methods: {}
    };
  },
  model: jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn(),
    insertMany: jest.fn()
  }))
}));

describe('States Model', () => {
  describe('Static Methods', () => {
    test('should have getByRegion static method', () => {
      expect(typeof States.getByRegion).toBe('function');
    });

    test('should have findByCode static method', () => {
      expect(typeof States.findByCode).toBe('function');
    });

    test('should have getAllActive static method', () => {
      expect(typeof States.getAllActive).toBe('function');
    });
  });

  describe('Schema validation', () => {
    test('should require stateCode and stateName', () => {
      const schema = States.schema;
      expect(schema.paths.stateCode.isRequired).toBe(true);
      expect(schema.paths.stateName.isRequired).toBe(true);
    });

    test('should have correct field types', () => {
      const schema = States.schema;
      expect(schema.paths.stateCode.instance).toBe('String');
      expect(schema.paths.stateName.instance).toBe('String');
      expect(schema.paths.region.instance).toBe('String');
      expect(schema.paths.capital.instance).toBe('String');
      expect(schema.paths.isActive.instance).toBe('Boolean');
    });

    test('should have enum values for region', () => {
      const schema = States.schema;
      const regionEnum = schema.paths.region.enumValues;
      expect(regionEnum).toContain('Northeast');
      expect(regionEnum).toContain('Southeast');
      expect(regionEnum).toContain('Midwest');
      expect(regionEnum).toContain('Southwest');
      expect(regionEnum).toContain('West');
    });
  });
});