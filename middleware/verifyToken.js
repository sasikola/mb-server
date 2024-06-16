const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    // const token = req.header.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token not found!" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

module.exports = verifyToken;
