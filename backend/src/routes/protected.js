const express = require("express");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * GET /api/protected
 * Protected route that returns a message if token is valid.
 */
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

module.exports = router;
