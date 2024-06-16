const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: {
    type: Number,
    default: 0,
  },
  userType: {
    type: String,
    required: [true, "User type is required"],
    default: "user",
    enum: ["user", "admin"],
  },
  profilePicture: {
    type: String,
    default:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
