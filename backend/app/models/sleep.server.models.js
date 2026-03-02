const db = require('../utils/database');

const createSleep = (sleep, done) => {
  const query = `
    INSERT INTO sleep_entries (
      whoop_record_id, user_id, date, nap, bedtime, wake_time,
      total_in_bed_minutes, total_sleep_duration_minutes,
      light_sleep_minutes, deep_sleep_minutes, rem_sleep_minutes, awake_minutes,
      sleep_performance_score, sleep_efficiency, sleep_consistency,
      respiratory_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    sleep.whoop_record_id ?? null,
    sleep.user_id,
    sleep.date,
    sleep.nap ? 1 : 0,
    sleep.bedtime,
    sleep.wake_time,

    sleep.total_in_bed_minutes ?? null,
    sleep.total_sleep_duration_minutes ?? null,

    sleep.light_sleep_minutes ?? null,
    sleep.deep_sleep_minutes ?? null,
    sleep.rem_sleep_minutes ?? null,
    sleep.awake_minutes ?? null,

    sleep.sleep_performance_score ?? null,
    sleep.sleep_efficiency ?? null,
    sleep.sleep_consistency ?? null,
    sleep.respiratory_rate ?? null,
  ];

  db.run(query, values, function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

const getAllSleeps = (filters, done) => {
  let query = `SELECT * FROM sleep_entries`;
  const values = [];
  const where = [];

  if (filters.start_date) {
    where.push(`date >= ?`);
    values.push(filters.start_date);
  }

  if (filters.end_date) {
    where.push(`date <= ?`);
    values.push(filters.end_date);
  }

  if (where.length > 0) {
    query += ` WHERE ` + where.join(" AND ");
  }

  query += ` ORDER BY date DESC`;

  db.all(query, values, (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};

const getSleep = (id, done) => {
  const query = `SELECT * FROM sleep_entries WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err) return done(err);
    return done(null, row || null);
  });
};

const updateSleep = (id, sleep, done) => {
  const query = `
    UPDATE sleep_entries
    SET
      whoop_record_id = ?,
      user_id = ?,
      date = ?,
      nap = ?,
      bedtime = ?,
      wake_time = ?,
      total_in_bed_minutes = ?,
      total_sleep_duration_minutes = ?,
      light_sleep_minutes = ?,
      deep_sleep_minutes = ?,
      rem_sleep_minutes = ?,
      awake_minutes = ?,
      sleep_performance_score = ?,
      sleep_efficiency = ?,
      sleep_consistency = ?,
      respiratory_rate = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    sleep.whoop_record_id ?? null,
    sleep.user_id,
    sleep.date,
    sleep.nap ? 1 : 0,
    sleep.bedtime,
    sleep.wake_time,
    sleep.total_in_bed_minutes ?? null,
    sleep.total_sleep_duration_minutes ?? null,
    sleep.light_sleep_minutes ?? null,
    sleep.deep_sleep_minutes ?? null,
    sleep.rem_sleep_minutes ?? null,
    sleep.awake_minutes ?? null,
    sleep.sleep_performance_score ?? null,
    sleep.sleep_efficiency ?? null,
    sleep.sleep_consistency ?? null,
    sleep.respiratory_rate ?? null,
    id,
  ];

  db.run(query, values, function (err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};

const deleteSleep = (id, done) => {
  const query = `DELETE FROM sleep_entries WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};

module.exports = {
    createSleep,
    getAllSleeps,
    getSleep,
    updateSleep,
    deleteSleep,
};