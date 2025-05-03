require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};
