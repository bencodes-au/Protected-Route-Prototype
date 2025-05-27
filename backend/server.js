const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./src/routes/auth");
const protectedRoutes = require("./src/routes/protected");

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

// Connect to MongoDB and start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(process.env.PORT || 3000, () => {
        console.log(
          `Server running on http://localhost:${process.env.PORT || 3000}`
        );
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

module.exports = app;
