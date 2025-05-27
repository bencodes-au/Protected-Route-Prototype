require("dotenv").config();

const { NODE_ENV } = process.env;

let MONGO_URI = process.env.MONGO_URI;

if (NODE_ENV === "test") {
  MONGO_URI = process.env.MONGO_URI_TEST;
} else if (NODE_ENV === "production") {
  MONGO_URI = process.env.MONGO_URI_PROD;
}

module.exports = {
  MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};
