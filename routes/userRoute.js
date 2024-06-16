const express = require("express");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllBlogs,
  getSingleBlog,
  deleteBlog,
  updateBlog,
  createBlog,
  getUser,
  getAllAuthors,
  changeProfilePicture,
  updateUser,
} = require("../controllers/userController");

const router = express.Router();
// Multer configuration for blogs with multiple images
const blogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/blogs/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const blogUpload = multer({ storage: blogStorage });

// Multer configuration for profile picture uploads
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const profilePictureUpload = multer({ storage: profilePictureStorage });

// Route to create a new blog post with multiple images
router.post(
  "/blog/create",
  blogUpload.array("images", 10),
  verifyToken,
  createBlog
);

// Blog routes
router.get("/blogs", verifyToken, getAllBlogs);
router.get("/blog/:id", verifyToken, getSingleBlog);
router.delete("/blog/delete/:id", verifyToken, deleteBlog);
router.put(
  "/blog/update/:id",
  blogUpload.array("images", 10),
  verifyToken,
  updateBlog
);

// User Routes
router.get("/profile/:id", verifyToken, getUser);
router.get("/authors", getAllAuthors);

// Route to upload profile picture
router.post(
  "/profile/avatar",
  verifyToken,
  profilePictureUpload.single("profilePicture"), // Ensure "profilePicture" matches the field name in the form-data
  changeProfilePicture
);

router.put("/profile/update", verifyToken, updateUser);

module.exports = router;
