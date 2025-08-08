// Expose the Express app to Vercel serverless under /api/server
// This file lives under the required `api/` directory for Vercel Functions.
const app = require('../server/server');
module.exports = app;

