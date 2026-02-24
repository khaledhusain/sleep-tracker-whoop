const axios = require('axios');

function exchangeCodeForToken(code) {
    return axios.post();
}

function refreshAccessToken(refreshToken) {
    return axios.post();
}

function getSleep(accessToken) {
    return axios.get();
}

module.exports = {
    exchangeCodeForToken,
    refreshAccessToken,
    getSleep
};