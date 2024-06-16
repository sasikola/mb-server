const bcrypt = require("bcrypt");
const User = require("../../models/User");

const initializeAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ userType: "admin" });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("adminPassword", salt); // Replace 'admin_password' with your desired admin password

      const admin = new User({
        name: "Admin",
        email: "admin@example.com",
        phone: "1234567890", // Replace with admin phone number
        password: hashedPassword,
        userType: "admin",
      });

      await admin.save();
      console.log("Admin user created successfully");
    }
  } catch (err) {
    console.error("Error initializing admin user:", err);
  }
};

module.exports = initializeAdmin;
