const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

/**
 * Connects the application to the MongoDB database using Mongoose.
 *
 * This function attempts to establish a connection to MongoDB using
 * the URI provided in the environment configuration file. It logs
 * a success message if the connection is successful, or an error
 * message if the connection fails.
 *
 */

function connectDB() {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("error:", err.message));
}

module.exports = connectDB;
