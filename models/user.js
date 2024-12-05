const bcrypt = require("bcryptjs");
const db = require("../db/database");

// Function to find a user by email
exports.findByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(err); // Reject the promise if there is an error
      } else {
        resolve(row); // Resolve with the user data or null if not found
      }
    });
  });
};

// Function to create a new user
exports.create = async (email, username, password) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
    db.run(query, [email, username, password], function (err) {
      if (err) {
        reject(err); // Reject the promise if there is an error
      } else {
        resolve(this.lastID); // Resolve with the last inserted ID
      }
    });
  });
};

// Function to compare password for login
exports.comparePassword = async (inputPassword, storedPassword) => {
  return bcrypt.compare(inputPassword, storedPassword);
};
