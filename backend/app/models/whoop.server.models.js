const db = require('../utils/database');

const getTokens = (userId, done) => {
    const sql = `
    SELECT access_token, refresh_token, expires_at
    FROM whoop_tokens
    WHERE user_id = ?
    `;

    db.get(sql, [userId], (err, row) => {
        if (err) return done(err);
        return done(null, row || null);
    });
};

const setTokens = (userId, accessToken, refreshToken, expiresAt, done) => {
    const sql = `
    INSERT INTO whoop_tokens (user_id, access_token, refresh_token, expires_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      updated_at = CURRENT_TIMESTAMP
    `;

    db.run(sql, [userId, accessToken, refreshToken, expiresAt], function (err) {
        if (err) return done(err);
        return done(null, this.changes);
    });
};

const INSERT_SLEEP_SQL = `
  INSERT INTO sleep_entries (
    whoop_record_id, user_id, date, nap, bedtime, wake_time,
    total_in_bed_minutes, total_sleep_duration_minutes,
    light_sleep_minutes, deep_sleep_minutes, rem_sleep_minutes, awake_minutes,
    sleep_performance_score, sleep_efficiency, sleep_consistency,
    respiratory_rate
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(whoop_record_id) DO UPDATE SET
    user_id = excluded.user_id,
    date = excluded.date,
    nap = excluded.nap,
    bedtime = excluded.bedtime,
    wake_time = excluded.wake_time,
    total_in_bed_minutes = excluded.total_in_bed_minutes,
    total_sleep_duration_minutes = excluded.total_sleep_duration_minutes,
    light_sleep_minutes = excluded.light_sleep_minutes,
    deep_sleep_minutes = excluded.deep_sleep_minutes,
    rem_sleep_minutes = excluded.rem_sleep_minutes,
    awake_minutes = excluded.awake_minutes,
    sleep_performance_score = excluded.sleep_performance_score,
    sleep_efficiency = excluded.sleep_efficiency,
    sleep_consistency = excluded.sleep_consistency,
    respiratory_rate = excluded.respiratory_rate,
    updated_at = CURRENT_TIMESTAMP
`;

const insertSleepEntries = (entries, done) => {
  if (!entries || entries.length === 0) {
    return done(null, 0);
  }
  let completed = 0;
  let totalChanges = 0;
  entries.forEach((entry) => {
    const date = entry.start ? String(entry.start).split('T')[0] : null;
    const params = [
      String(entry.id),
      entry.user_id,
      date,
      entry.nap ? 1 : 0,
      entry.start || null,
      entry.end || null,
      entry.total_in_bed_minutes,
      entry.total_sleep_minutes,
      entry.light_sleep_minutes,
      entry.deep_sleep_minutes,
      entry.rem_sleep_minutes,
      entry.total_awake_minutes ?? null,
      entry.sleep_performance_score ?? null,
      entry.sleep_efficiency ?? null,
      entry.sleep_consistency ?? null,
      entry.respiratory_rate ?? null,
    ];
    db.run(INSERT_SLEEP_SQL, params, function (err) {
      if (err) return done(err);
      totalChanges += this.changes;
      completed += 1;
      if (completed === entries.length) return done(null, totalChanges);
    });
  });
};

const getSleepEntries = (userId, done) => {
  const sql = `SELECT * FROM sleep_entries WHERE user_id = ?
    ORDER BY (wake_time IS NULL), wake_time DESC, id DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};

module.exports = {
  getTokens,
  setTokens,
  insertSleepEntries,
  getSleepEntries,
};