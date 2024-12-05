module.exports = (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in to access this page');
      return res.redirect('/login');
    }
    next();
};

module.exports = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/login');
    }
    next();
};

const { body, validationResult } = require('express-validator');

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get("/login", (req, res) => res.render("login", { errorMessage: null }));

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.render("login", { errorMessage: errorMessages.join(', ') });
    }

    try {
      await userController.login(req, res);
    } catch (error) {
      res.render("login", { errorMessage: "An error occurred during login. Please try again." });
    }
  }
);

module.exports = router;
