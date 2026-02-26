const crypto = require("crypto");
const whoopClient = require("../utils/whoopClient");
const whoopModel = require("../models/whoop.server.models");
const normalise = require("../utils/normalise");
const timeUtils = require("../utils/time");

function getConnectUrl(req, res) {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl =
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?response_type=code` +
    `&client_id=${process.env.WHOOP_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.WHOOP_REDIRECT_URI)}` +
    `&scope=offline read:sleep` +
    `&state=${state}`;
  res.redirect(authUrl);
}

async function handleCallback(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }
  try {
    const tokenResponse = await whoopClient.exchangeCodeForTokens(code);
    const data = tokenResponse.data;
    const expiresIn = data.expires_in;
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;
    whoopModel.setTokens(data.access_token, data.refresh_token, expiresAt, (err) => {
      if (err) {
        console.error("setTokens:", err);
        return res.status(500).json({ error: "Failed to store tokens" });
      }
      return res.send("Token stored.");
    });
  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    return res.json({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

function refreshToken(req, res) {
  whoopModel.getTokens((err, tokens) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tokens || !tokens.refresh_token) {
      return res.status(401).json({ error: "No refresh token" });
    }
    whoopClient
      .refreshAccessToken(tokens.refresh_token)
      .then((response) => {
        const data = response.data;
        const expiresIn = data.expires_in;
        const expiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null;
        whoopModel.setTokens(
          data.access_token,
          data.refresh_token || tokens.refresh_token,
          expiresAt,
          (setErr) => {
            if (setErr) return res.status(500).json({ error: setErr.message });
            return res.json(response.data);
          }
        );
      })
      .catch((error) => {
        return res.json(error.response?.data || { error: error.message });
      });
  });
}

async function syncSleep(req, res) {
  if (!req.accessToken) {
    return res.status(401).json({ error: "Not authenticated. Go to whoop/connect" });
  }
  try {
    const range = req.query.range || "last-week";
    const isoStart = timeUtils.getIsoStartForRange(range);

    let allEntries = [];
    let nextToken = null;

    do {
      const response = await whoopClient.getSleep(req.accessToken, isoStart, nextToken);
      allEntries = allEntries.concat(response.data.records);
      nextToken = response.data.next_token;
    } while (nextToken);

    const cleaned = normalise.normaliseSleep(allEntries);
    whoopModel.insertSleepEntries(cleaned, (err) => {
      if (err) return res.json({ error: err.message });
      return res.json({ inserted: cleaned.length });
    });
  } catch (error) {
    return res.json(error.response?.data || { error: error.message });
  }
}

function getSleepHistory(req, res) {
  whoopModel.getSleepEntries((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
}

module.exports = {
  getConnectUrl,
  handleCallback,
  refreshToken,
  syncSleep,
  getSleepHistory,
};