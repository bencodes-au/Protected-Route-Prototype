require("dotenv").config();

//  Loads environment variables from .env and exports them for use throughout the app.

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};
