const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'calendar.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      date TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('success', 'neutral', 'danger')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      is_logged_in INTEGER DEFAULT 0
    )
  `);

  db.run('INSERT OR IGNORE INTO auth (id, is_logged_in) VALUES (1, 0)');
});

const getRecords = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT date, status FROM records', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const records = {};
      rows.forEach(row => {
        records[row.date] = row.status;
      });
      resolve(records);
    });
  });
};

const setRecord = (date, status) => {
  return new Promise((resolve, reject) => {
    if (status) {
      const stmt = db.prepare(`
        INSERT INTO records (date, status, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(date) DO UPDATE SET
          status = excluded.status,
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(date, status, (err) => {
        stmt.finalize();
        if (err) reject(err);
        else resolve();
      });
    } else {
      const stmt = db.prepare('DELETE FROM records WHERE date = ?');
      stmt.run(date, (err) => {
        stmt.finalize();
        if (err) reject(err);
        else resolve();
      });
    }
  });
};

const getAuthStatus = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT is_logged_in FROM auth WHERE id = 1', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row ? !!row.is_logged_in : false);
    });
  });
};

const setAuthStatus = (isLoggedIn) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE auth SET is_logged_in = ? WHERE id = 1');
    stmt.run(isLoggedIn ? 1 : 0, (err) => {
      stmt.finalize();
      if (err) reject(err);
      else resolve();
    });
  });
};

const importRecords = (newRecords, merge = true) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const currentRecords = await getRecords();
        const finalRecords = merge ? { ...currentRecords, ...newRecords } : newRecords;

        db.run('BEGIN TRANSACTION');

        if (!merge) {
          db.run('DELETE FROM records');
        }

        const insertStmt = db.prepare(`
          INSERT INTO records (date, status, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(date) DO UPDATE SET
            status = excluded.status,
            updated_at = CURRENT_TIMESTAMP
        `);

        for (const [date, status] of Object.entries(finalRecords)) {
          insertStmt.run(date, status);
        }

        insertStmt.finalize();
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      } catch (err) {
        db.run('ROLLBACK');
        reject(err);
      }
    });
  });
};

module.exports = {
  getRecords,
  setRecord,
  getAuthStatus,
  setAuthStatus,
  importRecords
};
