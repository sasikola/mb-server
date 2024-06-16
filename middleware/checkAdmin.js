const User = require("../models/User");


const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    if (!userId) {
      return res
        .status(400)
        .send({ message: "User ID is required", success: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "No User Found", success: false });
    }
    if (user.userType !== "admin") {
      return res
        .status(403)
        .send({ message: "Access forbidden: Admins only", success: false });
    }
    next();
  } catch (error) {
    console.error("Error in checkAdmin middleware:", error);
    res.status(500).send({ message: "Internal Server Error", success: false });
  }
};

module.exports = checkAdmin;
