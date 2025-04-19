const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

/**
 * POST /api/auth/register
 * Registers a new user with username and password.
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Logs in a user and returns a JWT token.
 */
router.post("/login", login);

module.exports = router;
