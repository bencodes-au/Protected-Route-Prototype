const mongoose = require("mongoose");

/**
 * Defines the schema for a User document in MongoDB.
 * Includes username and password fields.
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
