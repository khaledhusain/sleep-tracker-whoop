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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => { if (err) console.error('Users table error:', err.message); });

        db.run(`
      CREATE TABLE IF NOT EXISTS sleep_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        bedtime TEXT NOT NULL,
        wake_time TEXT NOT NULL,
        total_sleep_duration_minutes INTEGER,
        light_sleep_minutes INTEGER,
        deep_sleep_minutes INTEGER,
        rem_sleep_minutes INTEGER,
        awake_minutes INTEGER,
        sleep_performance_score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => { if (err) console.error('Sleep entries table error:', err.message); });

        console.log('Database tables initialized');
    });
};

module.exports = db;