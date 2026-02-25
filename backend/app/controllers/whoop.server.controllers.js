const whoopClient = require('../utils/whoopClient');
const whoopModel = require('../models/whoop.server.models');

function getConnectUrl(req, res) {
    const authUrl = '';

    res.redirect(authUrl);
}

function handleCallback(req, res) {}

function refreshToken(req, res) {}

function syncSleep(req, res) {}

module.exports = {
    getConnectUrl,
    handleCallback,
    refreshToken,
    syncSleep
};