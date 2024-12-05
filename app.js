// Import dependencies
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose(); // SQLite
const bcrypt = require('bcryptjs'); // Password hashing
const { body, validationResult } = require('express-validator'); // Form validation



const router = require('./routes');

// Load environment variables from .env file
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database connection
const db = new sqlite3.Database('db/cryptoCortex.db'); // Use file-based SQLite DB

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session and Flash messages setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// EJS setup
app.set('view engine', 'ejs');

// Create users table if it doesn't exist (SQLite setup)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT)");
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // If logged in, continue to the requested route
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
}

// Routes

// Home route (only accessible to logged-in users)
app.get("/", isAuthenticated, (req, res) => {
    res.render("index", { user: req.session.user });
});

// Transaction History route (protected route)
app.get('/transactions/history', isAuthenticated, (req, res) => {
    // Example transaction data, replace with actual database data as needed
    const fetchedTransactions = [
        { date: '2024-11-01', description: 'Grocery', category: 'Food', type: 'Expense', amount: 50 },
        { date: '2024-11-02', description: 'Salary', category: 'Income', type: 'Income', amount: 2000 },
    ];

    res.render('transaction-history', {
        transactions: fetchedTransactions,
        user: req.session.user
    });
});

// Login routes
app.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/"); // Redirect to home if already logged in
    }
    res.render("login", { errorMessage: req.flash('error') });
});

app.post("/login", [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("login", { errorMessage: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) {
            return res.render('login', { errorMessage: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.user = user; // Save user info in session
            return res.redirect('/'); // Redirect to home after login
        } else {
            res.render('login', { errorMessage: 'Invalid email or password' });
        }
    });
});

// Register routes
app.get("/register", (req, res) => {
    if (req.session.user) {
        return res.redirect("/"); // Redirect to home if already logged in
    }
    res.render("register", { errorMessage: req.flash('error') });
});

app.post("/register", [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("register", { errorMessage: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function(err) {
        if (err) {
            console.error('Error inserting user:', err);
            return res.render('register', { errorMessage: 'Error registering user' });
        }
        req.flash('success', 'Registration successful. Please login');
        res.redirect('/login');
    });
});

// Logout route (destroy session)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login'); // Redirect to login after logout
    });
});

// 404 Error handling
app.use((req, res) => {
    res.status(404).render('404', { message: "Page not found" });
});

app.use(express.static(path.join(__dirname, 'public')));
// About route
app.get('/about', (req, res) => {
    res.render('about'); // Renders the about.ejs page
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
});
