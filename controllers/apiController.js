const User = require('../models/user');
const Transaction = require('../models/transaction');
const Budget = require('../models/budget');
const db = require('../db/database'); // Assuming you're using SQLite with db.js for db connection

// Get user balance
exports.getBalance = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by middleware (e.g., passport or jwt)
        const transactions = await Transaction.findByUserId(userId); // Assumes findByUserId exists
        const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
        res.json({ balance });
    } catch (error) {
        console.error('Error getting balance:', error);
        res.status(500).json({ message: 'Error getting balance', error: error.message });
    }
};

// Get spending report by category
exports.getSpendingReport = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by middleware
        const report = await Transaction.getSpendingByCategory(userId); // Assumes getSpendingByCategory exists
        res.json(report);
    } catch (error) {
        console.error('Error fetching spending report:', error);
        res.status(500).json({ message: 'Error fetching spending report', error: error.message });
    }
};

// Get budget alerts (if spending exceeds budget limit)
exports.getBudgetAlerts = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by middleware
        const budgets = await Budget.findByUserId(userId); // Assumes findByUserId exists
        const alerts = budgets.filter(budget => budget.spent > budget.limit);
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching budget alerts:', error);
        res.status(500).json({ message: 'Error fetching budget alerts', error: error.message });
    }
};

// Get accounts info
exports.getAccounts = (req, res) => {
    res.status(200).json({ message: "Get accounts works!" });
};

// Create a new account (just a placeholder for now)
exports.createAccount = (req, res) => {
    res.status(201).json({ message: "Create account works!" });
};

// Create a new transaction (just a placeholder for now)
exports.createTransaction = (req, res) => {
    res.status(201).json({ message: "Create transaction works!" });
};

// Get user dashboard with recent transactions
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId; // Ensure session management is working
        const user = await User.findById(userId); // Assumes findById exists
        const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(5); // Get the 5 most recent transactions

        res.render('index', {
            user: {
                name: user.name,
                totalBalance: user.totalBalance,
                spentThisMonth: user.spentThisMonth,
                monthlyBudget: user.monthlyBudget,
                transactions: transactions.map(tx => ({
                    date: tx.date.toDateString(),
                    description: tx.description,
                    amount: tx.amount,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.redirect('/404'); // Gracefully handle errors
    }
};

// Get the user's budget details
exports.getBudget = (req, res) => {
    const userId = req.session.userId; // Ensure session management is working
    db.get("SELECT * FROM budgets WHERE userId = ?", [userId], (err, budget) => {
        if (err) {
            console.error('Error fetching budget:', err);
            return res.status(500).json({ message: "Error fetching budget." });
        }
        res.status(200).json(budget);
    });
};

// Update user's budget for a specific category
exports.updateBudget = (req, res) => {
    const { category, amount } = req.body;
    const userId = req.session.userId; // Ensure session management is working

    db.run(
        "UPDATE budgets SET amount = ? WHERE userId = ? AND category = ?",
        [amount, userId, category],
        (err) => {
            if (err) {
                console.error('Error updating budget:', err);
                return res.status(500).json({ message: "Error updating budget." });
            }
            res.status(200).json({ message: "Budget updated successfully." });
        }
    );
};
