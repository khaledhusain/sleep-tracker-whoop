const whoopClient = require("../utils/whoopClient");
const whoopModel = require("../models/whoop.server.models");

const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

function isExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() - EXPIRY_BUFFER_MS < Date.now();
}

function whoopAuthMiddleware(req, res, next) {
  if (req.user_id == null) {
    return res.status(401).json({ error: "App login required" });
  }
  whoopModel.getTokens(req.user_id, (err, tokens) => {
    if (err) {
      req.accessToken = null;
      return next();
    }
    if (!tokens) {
      req.accessToken = null;
      return next();
    }

    let { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt } = tokens;

    if (isExpired(expiresAt) && refreshToken) {
      whoopClient
        .refreshAccessToken(refreshToken)
        .then((response) => {
          const data = response.data;
          accessToken = data.access_token;
          refreshToken = data.refresh_token || refreshToken;
          const expiresIn = data.expires_in;
          const newExpiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : null;
          whoopModel.setTokens(req.user_id, accessToken, refreshToken, newExpiresAt, (setErr) => {
            if (setErr) {
              req.accessToken = null;
              return next();
            }
            req.accessToken = accessToken;
            req.whoopRefreshToken = refreshToken;
            next();
          });
        })
        .catch(() => {
          req.accessToken = null;
          next();
        });
      return;
    }

    req.accessToken = accessToken;
    req.whoopRefreshToken = refreshToken;
    next();
  });
}

module.exports = {
  whoopAuthMiddleware,
};