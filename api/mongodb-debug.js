const mongoose = require('mongoose');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const connectionStatus = {
      mongoUri: process.env.MONGO_URI ? 'configured' : 'missing',
      jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing',
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL || 'not-vercel',
      mongooseVersion: mongoose.version,
      connectionState: mongoose.connection.readyState,
      connectionStates: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }
    };

    // Try to connect
    if (process.env.MONGO_URI) {
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000
          });
        }
        connectionStatus.connectionAttempt = 'success';
        connectionStatus.finalState = mongoose.connection.readyState;
      } catch (connectError) {
        connectionStatus.connectionAttempt = 'failed';
        connectionStatus.connectError = connectError.message;
      }
    }

    res.status(200).json(connectionStatus);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
