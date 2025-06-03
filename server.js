const express = require("express");
const mongoose = require("mongoose");
const { MONGO_URI, port } = require("./backend/src/config/config");

const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./backend/src/routes/auth");
const protectedRoutes = require("./backend/src/routes/protected");

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

// Connect to MongoDB and start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

module.exports = app;
