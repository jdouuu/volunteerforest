// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

/**
 * @function connectDB
 * @description Connects to the MongoDB database using Mongoose.
 * The connection string is retrieved from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
