const User = require('../models/user');
const bcrypt = require('bcrypt');

// Registration function
exports.register = async (req, res) => {
  const { email, username, password } = req.body;

  // Input validation
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const userId = await User.create(email, username, hashedPassword);

    // Success response
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user; // Store user session
    res.redirect("/dashboard"); // Redirect to dashboard after successful login
  } else {
    req.flash("error", "Invalid email or password");
    res.redirect("/login");
  }
};

// Logout function
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Add your login logic here, for example:
  // Find user, check password, handle session, etc.
  // Send appropriate response back to the client
};
