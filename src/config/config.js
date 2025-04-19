// import dotenv
require("dotenv").config();

// export the features in our environment so we can reference them elsewhere
module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};
