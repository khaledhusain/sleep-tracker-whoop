const whoopClient = require('../utils/whoopClient');
const whoopModels = require('../models/whoop.server.models');

function whoopAuthMiddleware(req, res, next) {
    whoopModels.getTokens((err, tokens) => {
      if (err) {
        return res.status(500).json({ error: "Failed to get tokens" });
      }
  
      if (!tokens) {
        return res.status(401).json({ error: "Not authenticated" });
      }
  
      req.accessToken = tokens.access_token;
      next();
    });
  }

module.exports = whoopAuthMiddleware;