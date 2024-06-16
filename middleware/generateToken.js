const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// function to generate token
const generateToken = (userData) => {
  // generate a new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
};

module.exports = generateToken;
