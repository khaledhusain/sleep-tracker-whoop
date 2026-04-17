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
        total_in_bed_minutes INTEGER,
        total_sleep_duration_minutes INTEGER,
        light_sleep_minutes INTEGER,
        deep_sleep_minutes INTEGER,
        rem_sleep_minutes INTEGER,
        awake_minutes INTEGER,
        sleep_performance_score INTEGER,
        sleep_efficiency INTEGER,
        sleep_consistency INTEGER,
        respiratory_rate REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `, (err) => { if (err) console.error('Sleep entries table error:', err.message); });

    db.run(
      `
      CREATE TABLE IF NOT EXISTS whoop_tokens (
        user_id INTEGER PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      `,
      (err) => {
        if (err) console.error("whoop_tokens table creation:", err);
        migrateLegacyWhoopTokensIfNeeded();
      }
    );

        console.log('Database tables initialized');
    });
};

/** Older DBs used a single global row (id = 1). Re-home those tokens onto user_id = 1 (or first user). */
function migrateLegacyWhoopTokensIfNeeded() {
  db.all("PRAGMA table_info(whoop_tokens)", (pragmaErr, cols) => {
    if (pragmaErr || !cols || cols.length === 0) return;
       const hasLegacyId = cols.some((c) => c.name === "id");
    if (!hasLegacyId) return;

    db.get("SELECT MIN(user_id) AS uid FROM users", (uErr, uRow) => {
      const uid = uRow && uRow.uid != null ? uRow.uid : 1;
      db.serialize(() => {
        db.run("PRAGMA foreign_keys = OFF");
        db.run(
          `CREATE TABLE whoop_tokens__mig (
            user_id INTEGER PRIMARY KEY,
            access_token TEXT NOT NULL,
            refresh_token TEXT NOT NULL,
            expires_at DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          )`
        );
        db.run(
          `INSERT INTO whoop_tokens__mig (user_id, access_token, refresh_token, expires_at, updated_at)
 SELECT ?, access_token, refresh_token, expires_at, updated_at FROM whoop_tokens WHERE id = 1`,
          [uid]
        );
        db.run("DROP TABLE whoop_tokens");
        db.run("ALTER TABLE whoop_tokens__mig RENAME TO whoop_tokens");
        db.run("PRAGMA foreign_keys = ON");
      });
    });
  });
}

initDatabase();

module.exports = db;