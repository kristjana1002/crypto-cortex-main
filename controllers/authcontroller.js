const bcrypt = require("bcryptjs");
const db = require("../db/database");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email already exists in the database
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, existingUser) => {
      if (existingUser) {
        // Email is already registered
        return res.render("register", { errorMessage: "Email already exists." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

      db.run(query, [username, email, hashedPassword], function (err) {
        if (err) {
          console.error(err); // Log the error to the server console for debugging
          return res.render("register", { errorMessage: "Error occurred during registration." });
        }

        // Redirect to the login page after successful registration
        res.redirect("/login");
      });
    });
  } catch (err) {
    console.error(err); // Log the error to the server console for debugging
    res.status(500).render("register", { errorMessage: "Server error." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve the user with the provided email
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
      if (err || !user) {
        // If no user found or an error occurred
        return res.render("login", { errorMessage: "Invalid email or password." });
      }

      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        // If the passwords don't match
        return res.render("login", { errorMessage: "Invalid email or password." });
      }

      // Set the user session after successful login
      req.session.user = { id: user.id, username: user.username, email: user.email };
      res.redirect("/"); // Redirect to the home page after successful login
    });
  } catch (err) {
    console.error(err); // Log any unexpected errors
    res.status(500).render("login", { errorMessage: "Server error." });
  }
};
