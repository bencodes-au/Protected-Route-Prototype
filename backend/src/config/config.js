require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://mongo:27017/protected-route-prototype",
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};
