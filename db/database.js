const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// Use the correct path for the database file
const dbPath = path.resolve(__dirname, "../", process.env.DATABASE);

// Create a connection to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
    process.exit(1); // Exit if the DB can't connect
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create the users table if it doesn't exist
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Users table is ready.");
      }
    }
  );
});

module.exports = db;
