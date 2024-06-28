const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../middleware/generateToken");

// this is User Register
userRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, profilePicture } =
      req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      console.log("Validation error:", {
        firstName,
        lastName,
        email,
        phone,
        password,
      });
      return res.status(400).json({ message: "Please fill all the fields!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Sorry, user already exists with this email or phone number!",
      });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      profilePicture,
    });

    // Save user to database
    await newUser.save();

    // Generate token
    const payload = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      userType: newUser.userType,
    };

    const token = generateToken(payload);

    // Respond with success
    res.status(201).json({
      message: "User registered successfully!",
      user: newUser,
      token,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

// this is for user login
const userLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Please fill all the fields!" });
    }
    const user = await User.findOne({ phone: phone });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Sorry, user does not exists with this phone number!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Sorry, password is incorrect!" });
    }
    const payload = {
      _id: user._id,
      email: user.email,
      phone: user.phone,
    };
    const token = generateToken(payload);
    res.status(200).json({
      message: "User logged in successfully!",
      success: true,
      userDetails: {
        phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: token,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error!" });
  }
};


const adminLogin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user || user.userType !== "admin")
      return res.status(400).json({ message: "Admin not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    // to generate token
    const payload = {
      _id: user.id,
    };
    const token = generateToken(payload);
    res.status(200).json({
      message: "Admin Logged in successfully!",
      token: token,
      userDetails: user,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  userRegister,
  userLogin,
  adminLogin,
};
