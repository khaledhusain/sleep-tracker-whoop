const axios = require('axios');

const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const API_BASE = "https://api.prod.whoop.com/developer/v2";

function exchangeCodeForTokens(code) {
    return axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.WHOOP_REDIRECT_URI,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  }
  
  function refreshAccessToken(refreshToken) {
    return axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  }
  
  function getSleep(accessToken, startIso, nextToken) {
    const url = nextToken
      ? `${API_BASE}/activity/sleep?start=${startIso}&nextToken=${nextToken}`
      : `${API_BASE}/activity/sleep?start=${startIso}`;
    return axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

module.exports = {
    exchangeCodeForTokens,
    refreshAccessToken,
    getSleep
};