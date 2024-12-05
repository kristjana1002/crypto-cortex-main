const express = require("express");
const { getBudget, updateBudget, addTransaction, getPortfolio } = require("../controllers/apiController");
const router = express.Router();

router.get("/budget", ensureAuthenticated, getBudget);
router.post("/budget", ensureAuthenticated, updateBudget);
router.post("/transactions", ensureAuthenticated, addTransaction);
router.get("/portfolio", ensureAuthenticated, getPortfolio);

module.exports = router;
