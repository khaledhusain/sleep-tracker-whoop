const db = require('../utils/database');

function storedDateOnly(v) {
  if (v == null) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return v.trim();
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toISOString().slice(0, 10);
}

function storedIsoInstant(v) {
  if (v == null) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toISOString();
}

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
    storedDateOnly(sleep.date),
    sleep.nap ? 1 : 0,
    storedIsoInstant(sleep.bedtime),
    storedIsoInstant(sleep.wake_time),

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

const getAllSleeps = (user_id, filters, done) => {
  let query = `SELECT * FROM sleep_entries`;
  const values = [];
  const where = [];

  where.push(`user_id = ?`);
  values.push(user_id);

  if (filters.start_date) {
    where.push(`date >= ?`);
    values.push(filters.start_date);
  }

  if (filters.end_date) {
    where.push(`date <= ?`);
    values.push(filters.end_date);
  }

  query += ` WHERE ` + where.join(" AND ");
  query += ` ORDER BY date DESC`;

  db.all(query, values, (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};

const getSleep = (user_id, id, done) => {
  const query = `SELECT * FROM sleep_entries WHERE id = ? AND user_id = ?`;
  db.get(query, [id, user_id], (err, row) => {
    if (err) return done(err);
    return done(null, row || null);
  });
};

const updateSleep = (id, user_id, sleep, done) => {
  let query = "UPDATE sleep_entries SET ";
  const fields = [];
  const values = [];

  if (sleep.whoop_record_id !== undefined) {
    fields.push("whoop_record_id = ?");
    values.push(sleep.whoop_record_id);
  }

  if (sleep.date !== undefined) {
    fields.push("date = ?");
    values.push(storedDateOnly(sleep.date));
  }

  if (sleep.nap !== undefined) {
    fields.push("nap = ?");
    values.push(sleep.nap ? 1 : 0);
  }

  if (sleep.bedtime !== undefined) {
    fields.push("bedtime = ?");
    values.push(storedIsoInstant(sleep.bedtime));
  }

  if (sleep.wake_time !== undefined) {
    fields.push("wake_time = ?");
    values.push(storedIsoInstant(sleep.wake_time));
  }

  if (sleep.total_in_bed_minutes !== undefined) {
    fields.push("total_in_bed_minutes = ?");
    values.push(sleep.total_in_bed_minutes);
  }

  if (sleep.total_sleep_duration_minutes !== undefined) {
    fields.push("total_sleep_duration_minutes = ?");
    values.push(sleep.total_sleep_duration_minutes);
  }

  if (sleep.light_sleep_minutes !== undefined) {
    fields.push("light_sleep_minutes = ?");
    values.push(sleep.light_sleep_minutes);
  }

  if (sleep.deep_sleep_minutes !== undefined) {
    fields.push("deep_sleep_minutes = ?");
    values.push(sleep.deep_sleep_minutes);
  }

  if (sleep.rem_sleep_minutes !== undefined) {
    fields.push("rem_sleep_minutes = ?");
    values.push(sleep.rem_sleep_minutes);
  }

  if (sleep.awake_minutes !== undefined) {
    fields.push("awake_minutes = ?");
    values.push(sleep.awake_minutes);
  }

  if (sleep.sleep_performance_score !== undefined) {
    fields.push("sleep_performance_score = ?");
    values.push(sleep.sleep_performance_score);
  }

  if (sleep.sleep_efficiency !== undefined) {
    fields.push("sleep_efficiency = ?");
    values.push(sleep.sleep_efficiency);
  }

  if (sleep.sleep_consistency !== undefined) {
    fields.push("sleep_consistency = ?");
    values.push(sleep.sleep_consistency);
  }

  if (sleep.respiratory_rate !== undefined) {
    fields.push("respiratory_rate = ?");
    values.push(sleep.respiratory_rate);
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  query += fields.join(", ");
  query += " WHERE id = ? AND user_id = ?";

  values.push(id);
  values.push(user_id);

  db.run(query, values, function (err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};

const deleteSleep = (user_id, id, done) => {
  const query = `DELETE FROM sleep_entries WHERE id = ? AND user_id = ?`;
  db.run(query, [id, user_id], function (err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};

const deleteAllSleepsForUser = (user_id, done) => {
  const query = `DELETE FROM sleep_entries WHERE user_id = ?`;
  db.run(query, [user_id], function (err) {
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
    deleteAllSleepsForUser,
};