const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const authRoute = require("./routes/authRoutes");
const db = require("./db");
const userRouter = require("./routes/userRoute");

dotenv.config();
const port = process.env.PORT || 3000; // Set a default port if PORT is not defined in .env

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const blogsDir = path.join(__dirname, "uploads", "blogs");
const profilesDir = path.join(__dirname, "uploads", "profiles");

// Ensure uploads, uploads/blogs, and uploads/profiles directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir);
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}

// Health check route
app.get("/", (req, res) => {
  res.send("Server is healthy...");
});

// Use routes
app.use("/auth", authRoute);
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
