const crypto = require("crypto");
const whoopClient = require("../utils/whoopClient");
const whoopModel = require("../models/whoop.server.models");
const normalise = require("../utils/normalise");
const timeUtils = require("../utils/time");

const WHOOP_STATE_SECRET =
  process.env.WHOOP_STATE_SECRET || "sleep-tracker-whoop-state-dev";
const FRONTEND_BASE = process.env.FRONTEND_URL || "http://localhost:5173";

/** WHOOP import window: always last 30 days (see app/utils/time.js → last-month). */
const WHOOP_SYNC_RANGE = "last-month";

function insertSleepEntriesPromise(entries) {
  return new Promise((resolve, reject) => {
    whoopModel.insertSleepEntries(entries, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function pullWhoopSleepIntoDb(accessToken, userId) {
  const isoStart = timeUtils.getIsoStartForRange(WHOOP_SYNC_RANGE);
  let allEntries = [];
  let nextToken = null;
  do {
    const response = await whoopClient.getSleep(accessToken, isoStart, nextToken);
    allEntries = allEntries.concat(response.data.records);
    nextToken = response.data.next_token;
  } while (nextToken);
  const cleaned = normalise
    .normaliseSleep(allEntries)
    .map((entry) => ({ ...entry, user_id: userId }));
  await insertSleepEntriesPromise(cleaned);
  return cleaned.length;
}

function signWhoopConnectState(userId) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${userId}|${nonce}`;
  const sig = crypto
    .createHmac("sha256", WHOOP_STATE_SECRET)
    .update(payload)
    .digest("hex");
  return `${sig}|${payload}`;
}

function verifyWhoopConnectState(state) {
  if (!state || typeof state !== "string") return null;
  const parts = state.split("|");
  if (parts.length !== 3) return null;
  const [sig, userIdStr, nonce] = parts;
  const payload = `${userIdStr}|${nonce}`;
  const expected = crypto
    .createHmac("sha256", WHOOP_STATE_SECRET)
    .update(payload)
    .digest("hex");
  if (sig !== expected) return null;
  const uid = Number(userIdStr);
  if (!Number.isInteger(uid) || uid < 1) return null;
  return uid;
}

function getConnectUrl(req, res) {
  const state = signWhoopConnectState(req.user_id);
  const authUrl =
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?response_type=code` +
    `&client_id=${process.env.WHOOP_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.WHOOP_REDIRECT_URI)}` +
    `&scope=offline read:sleep` +
    `&state=${encodeURIComponent(state)}`;
  return res.json({ authUrl });
}

async function handleCallback(req, res) {
  const { code, state } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_BASE}/dashboard?whoop=error&reason=missing_code`);
  }
  const userId = verifyWhoopConnectState(state);
  if (!userId) {
    return res.redirect(`${FRONTEND_BASE}/dashboard?whoop=error&reason=invalid_state`);
  }
  try {
    const tokenResponse = await whoopClient.exchangeCodeForTokens(code);
    const data = tokenResponse.data;
    const expiresIn = data.expires_in;
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;
    whoopModel.setTokens(
      userId,
      data.access_token,
      data.refresh_token,
      expiresAt,
      (err) => {
        if (err) {
          console.error("setTokens:", err);
          return res.redirect(`${FRONTEND_BASE}/dashboard?whoop=error&reason=store_failed`);
        }
        void (async () => {
          try {
            const inserted = await pullWhoopSleepIntoDb(data.access_token, userId);
            return res.redirect(
              `${FRONTEND_BASE}/dashboard?whoop=connected&imported=${inserted}`
            );
          } catch (syncErr) {
            console.error("Post-connect WHOOP sync:", syncErr);
            return res.redirect(
              `${FRONTEND_BASE}/dashboard?whoop=connected&imported=0&sync_error=1`
            );
          }
        })();
      }
    );
  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    return res.redirect(`${FRONTEND_BASE}/dashboard?whoop=error&reason=oauth_failed`);
  }
}

function refreshToken(req, res) {
  whoopModel.getTokens(req.user_id, (err, tokens) => {
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
          req.user_id,
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
    const inserted = await pullWhoopSleepIntoDb(req.accessToken, req.user_id);
    return res.json({ inserted, range_days: 30 });
  } catch (error) {
    return res.json(error.response?.data || { error: error.message });
  }
}

function getSleepHistory(req, res) {
  whoopModel.getSleepEntries(req.user_id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
}

function getWhoopStatus(req, res) {
  whoopModel.getTokens(req.user_id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const connected = !!(row && row.refresh_token);
    return res.json({ connected });
  });
}

module.exports = {
  getConnectUrl,
  handleCallback,
  refreshToken,
  syncSleep,
  getSleepHistory,
  getWhoopStatus,
};
