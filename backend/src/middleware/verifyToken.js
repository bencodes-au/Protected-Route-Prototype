const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");

/**
 * Middleware to verify JWT in the Authorization header.
 * If valid, it attaches the decoded user to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
