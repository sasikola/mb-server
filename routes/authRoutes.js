const express = require("express");
const {
  userRegister,
  userLogin,
  adminLogin,
} = require("../controllers/authController");

const router = express.Router();

// user login
router.post("/user/register", userRegister);
router.post("/user/login", userLogin);

// admin login
router.post("/admin/login", adminLogin);

module.exports = router;
1;
