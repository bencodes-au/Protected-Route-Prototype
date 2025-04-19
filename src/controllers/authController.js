const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { jwtSecret } = require("../config/config");

/**
 * Handles user registration.
 * Checks if the username already exists, hashes the password,
 * creates and saves a new user in the database.
 */

async function register(req, res) {
  const { username, password } = req.body;

  try {
    // Check if a user with the same username already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash the password before storing it in the database
    const hashed = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    user = new User({ username, password: hashed });

    // Save the new user to the database
    await user.save();

    // Return success message
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    // Handle errors (e.g., server or database errors)
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Handles user login.
 * Validates user credentials, compares passwords,
 * and returns a signed JWT if successful.
 */
async function login(req, res) {
  const { username, password } = req.body;

  try {
    // Find the user in the database by username
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(401)
        .json({ message: "Username or Password is incorrect" });

    // Compare the provided password with the stored hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(401)
        .json({ message: "Username or Password is incorrect" });

    // Create a JWT token containing user data (ID and username)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Return the JWT token to the client
    res.json({ token });
  } catch (err) {
    // Handle errors (e.g., server or database errors)
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login };
