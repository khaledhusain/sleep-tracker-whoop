const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'sleeptracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Connection failed:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

const initDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        salt TEXT,
        session_token text,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT email_unique UNIQUE (email)
      )
    `, (err) => { if (err) console.error('Users table error:', err.message); });

    db.run(`
      CREATE TABLE IF NOT EXISTS sleep_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        whoop_record_id TEXT UNIQUE,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        nap INTEGER DEFAULT 0,
        bedtime TEXT NOT NULL,
        wake_time TEXT NOT NULL,
        total_in_bed_minutEes INTEGER,
        total_sleep_duration_minutes INTEGER,
        light_sleep_minutes INTEGER,
        deep_sleep_minutes INTEGR,
        rem_sleep_minutes INTEGER,
        awake_minutes INTEGER,
        sleep_performance_score INTEGER,
        sleep_efficiency INTEGER,
        sleep_consistency INTEGER,
        respiratory_rate REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => { if (err) console.error('Sleep entries table error:', err.message); });

    db.run(
      `
      CREATE TABLE IF NOT EXISTS whoop_tokens (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `,
      (err) => {
        if (err) console.error("whoop_tokens table creation:", err);
      }
    );

        console.log('Database tables initialized');
    });
};

initDatabase();

module.exports = db;