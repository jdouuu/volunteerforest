// server/models/States.js
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     States:
 *       type: object
 *       required:
 *         - stateCode
 *         - stateName
 *       properties:
 *         stateCode:
 *           type: String
 *           description: Two-letter state code (e.g., TX, CA, NY).
 *           minlength: 2
 *           maxlength: 2
 *           uppercase: true
 *         stateName:
 *           type: String
 *           description: Full name of the state.
 *           trim: true
 *           minlength: 2
 *           maxlength: 50
 *         region:
 *           type: String
 *           description: Geographic region of the US.
 *           enum: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
 *         capital:
 *           type: String
 *           description: Capital city of the state.
 *           trim: true
 *       example:
 *         stateCode: 'TX'
 *         stateName: 'Texas'
 *         region: 'Southwest'
 *         capital: 'Austin'
 */

/**
 * @constant StatesSchema
 * @description Mongoose schema for States collection.
 * Defines the structure and validation rules for US state information.
 */
const StatesSchema = new mongoose.Schema({
  stateCode: {
    type: String,
    required: [true, 'State code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'State code must be exactly 2 characters'],
    maxlength: [2, 'State code must be exactly 2 characters'],
    match: [/^[A-Z]{2}$/, 'State code must be 2 uppercase letters']
  },
  stateName: {
    type: String,
    required: [true, 'State name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'State name must be at least 2 characters long'],
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  region: {
    type: String,
    enum: {
      values: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'],
      message: 'Region must be one of: Northeast, Southeast, Midwest, Southwest, West'
    },
    default: 'Midwest'
  },
  capital: {
    type: String,
    trim: true,
    maxlength: [50, 'Capital name cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the state is active for volunteer matching'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

/**
 * @method getByRegion
 * @description Static method to find all states in a specific region.
 * @param {string} region - The region to search for.
 * @returns {Promise<Array>} Array of states in the specified region.
 */
StatesSchema.statics.getByRegion = function(region) {
  return this.find({ region: region, isActive: true }).sort({ stateName: 1 });
};

/**
 * @method findByCode
 * @description Static method to find a state by its code.
 * @param {string} code - The state code to search for.
 * @returns {Promise<Object>} The state document if found.
 */
StatesSchema.statics.findByCode = function(code) {
  return this.findOne({ stateCode: code.toUpperCase(), isActive: true });
};

/**
 * @method getAllActive
 * @description Static method to get all active states.
 * @returns {Promise<Array>} Array of all active states sorted by name.
 */
StatesSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ stateName: 1 });
};

module.exports = mongoose.model('States', StatesSchema);