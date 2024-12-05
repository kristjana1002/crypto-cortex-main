const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Importing express-validator functions
const userController = require('../controllers/userController'); // Assuming this is the path to your controller
const ensureAuthenticated = require('../middleware/auth');  // Adjust the path as necessary

app.use(express.static(path.join(__dirname, 'public')));

// Your route definitions
app.get('/about', (req, res) => {
    res.render('about'); // Renders the about.ejs page
});

// Home Route
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('index', { user: req.session.user });
});

// Login Routes
router.get("/login", (req, res) => res.render("login", { errorMessage: null })); // Ensure errorMessage is always passed

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = null;

    if (!errors.isEmpty()) {
      errorMessage = errors.array()[0].msg; // Get the first error message
      return res.render("login", { errorMessage }); // Pass error message to the view
    }

    try {
      await userController.login(req, res);  // Calling the login function from userController
    } catch (error) {
      res.render("login", { errorMessage: "An error occurred during login. Please try again." });
    }
  }
);

// Register Routes
router.get("/register", (req, res) => res.render("register", { errorMessage: null })); // Ensure errorMessage is always passed

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg); // Collect all error messages
      return res.render("register", { errorMessage: errorMessages.join(', ') }); // Pass error messages to the view
    }

    try {
      await userController.register(req, res);  // Calling the register function from userController
    } catch (error) {
      res.render("register", { errorMessage: "An error occurred during registration. Please try again." });
    }
  }
);

// Dashboard Route (Public)
router.get('/dashboard', (req, res) => {
  res.render('dashboard'); // Open to all, no auth check
});

// Other Routes
router.get('/views/transaction-history', (req, res) => {
  res.render('transaction'); // Open to all, no auth check
});

// Logout Route
router.get('/logout', userController.logout);

// About Route
router.get('/about', (req, res) => res.render('about'));
// Settings Route (Public)
router.get('/settings', (req, res) => {
  res.render('settings'); // Open to all, no auth check
});

// POST route for updating settings
router.post('/settings', (req, res) => {
  const { username, email, password } = req.body;

  if (username && email) {
    // Simulate updating user data
    res.json({ success: true, message: 'Account updated successfully!' });
  } else {
    res.json({ success: false, message: 'Username and email are required!' });
  }
});

// Transactions History Route
router.get('/transactions-history', (req, res) => {
  const transactions = [
    { date: '2024-11-01', description: 'Salary', type: 'Income', amount: 2000 },
    { date: '2024-11-05', description: 'Grocery Shopping', type: 'Expense', amount: -150 },
    { date: '2024-11-10', description: 'Rent Payment', type: 'Expense', amount: -1200 },
    { date: '2024-11-12', description: 'Bitcoin Investment', type: 'Expense', amount: -500 },
  ];

  res.render('transaction-history', { transactions });
});

// Budget Routes
let budgets = [
  { category: 'Food', limit: 500, spent: 300 },
  { category: 'Rent', limit: 1200, spent: 1200 },
  { category: 'Entertainment', limit: 200, spent: 50 },
];

// Render Budget Page
router.get('/budgets', (req, res) => {
  res.render('budget', { budgets });
});

// Add or Update Budget
router.post('/budgets/add', (req, res) => {
  const { category, limit } = req.body;
  const budgetIndex = budgets.findIndex(b => b.category === category);

  if (budgetIndex !== -1) {
    budgets[budgetIndex].limit = parseFloat(limit);
  } else {
    budgets.push({ category, limit: parseFloat(limit), spent: 0 });
  }

  res.redirect('/budgets');
});

// Delete Budget
router.post('/budgets/delete', (req, res) => {
  const { category } = req.body;
  budgets = budgets.filter(b => b.category !== category);
  res.redirect('/budgets');
});

// Support Routes
router.get('/support', (req, res) => {
  res.render('support');
});

router.post('/support', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`New support request from ${name} (${email}): ${message}`);
  res.render('support', { success: true });
});

// Crypto News Route
router.get('/crypto-news', async (req, res) => {
  try {
    const response = await fetch('https://api.coindesk.com/v1/news');
    const newsData = await response.json();
    res.render('crypto-news', { newsArticles: newsData.articles || [] });
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    res.render('crypto-news', { newsArticles: [] });
  }
});

// Crypto and Stock Data Route
router.get('/crypto-stocks', async (req, res) => {
  try {
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'
    );
    const cryptoData = await cryptoResponse.json();

    // Fake stock data (since Alpha Vantage needs a key)
    const stocks = [
      { symbol: 'AAPL', price: 180, change: 0.5 },
      { symbol: 'GOOGL', price: 2800, change: 1.2 },
      { symbol: 'AMZN', price: 3400, change: -0.8 },
    ];

    res.render('crypto-stocks', { cryptoData, stocksData: stocks });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.render('crypto-stocks', { cryptoData: [], stocksData: [] });
  }
});

// Home Route with Authentication
router.get("/index", ensureAuthenticated, (req, res) => {
  res.render("home", { user: req.session.user });
});

// Logout Route
router.get('/logout', userController.logout);

module.exports = router;
