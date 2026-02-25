const db = require('../utils/database');

const getTokens = (done) => {
    const sql = `
    SELECT access_token, refresh_token, expires_at
    FROM whoop_tokens
    WHERE id = ?
    `;

    db.get(sql, (err, row) => {
        if (err) return document(err);
        return document(null, row);
    });
};

const setTokens = (accessToken, refreshToken, expiresAt, done) => {
    const sql = `
    INSERT INTO whoop_tokens (id, access_token, refresh_token, expires_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      access_token = ?,
      refresh_token = ?,
      expires_at = ?,
      updated_at = CURRENT_TIMESTAMP
    `;

    db.run(sql, [accessToken, refreshToken, expiresAt, accessToken, refreshToken, expiresAt], function(err) {
        if (err) return done(err);
        return done(null, this.changes);
    });
};

module.exports = {
    getTokens,
    setTokens
};
