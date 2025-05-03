const express = require("express");
const connectDB = require("./src/config/db");
const { port } = require("./src/config/config");

const authRoutes = require("./src/routes/auth");
const protectedRoutes = require("./src/routes/protected");

const app = express();

// Initializes middleware to parse JSON request bodies.

app.use(express.json());

// Connects to the MongoDB database.

connectDB();

// Sets up API routes for authentication and protected access.

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

// Starts the Express server on the configured port.

app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
