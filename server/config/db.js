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

    // One-time migration: ensure compound index and migrate legacy documents
    try {
      const UserCredentials = require('../models/UserCredentials');
      const collection = conn.connection.collection('usercredentials');
      const indexes = await collection.indexes();
      const hasOldUniqueOnUserId = indexes.find(i => i.name === 'userId_1');
      if (hasOldUniqueOnUserId) {
        console.log('Dropping legacy unique index userId_1...');
        try { await collection.dropIndex('userId_1'); } catch (e) { console.warn('Drop index userId_1 failed or not needed:', e.message); }
      }
      // Sync indexes to create { userId: 1, role: 1 } unique
      await UserCredentials.syncIndexes();
      // Backfill role for legacy records
      const res = await UserCredentials.updateMany({ role: { $exists: false } }, { $set: { role: 'volunteer' } });
      if (res.modifiedCount) {
        console.log(`Backfilled role for ${res.modifiedCount} credential(s)`);
      }
    } catch (migrateErr) {
      console.warn('Index migration/backfill skipped or failed:', migrateErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
