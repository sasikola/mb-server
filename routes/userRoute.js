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
  getPostsByCategory,
  getUserPosts,
} = require("../controllers/userController");

const router = express.Router();
// Multer configuration for blogs with multiple images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const blogUpload = multer({ storage: imageStorage });
const profilePictureUpload = multer({ storage: imageStorage });

// Route to create a new blog post with multiple images
router.post(
  "/blog/create",
  blogUpload.array("images", 10),
  verifyToken,
  createBlog
);

// Blog routes
router.get("/blogs", getAllBlogs);
router.get("/blog/:id", getSingleBlog);
router.delete("/blog/delete/:id", verifyToken, deleteBlog);
router.put("/blog/update/:id", verifyToken, updateBlog);
router.get("/blog/categories/:id", getPostsByCategory);
router.get("/blog/user/:id", getUserPosts);

// User Routes
router.get("/profile/", verifyToken, getUser);
router.get("/authors", getAllAuthors);

// Route to upload profile picture
router.post(
  "/profile/avatar",
  verifyToken,
  profilePictureUpload.single("profilePicture"), // Ensure "profilePicture" matches the field name in the form-data
  changeProfilePicture
);

module.exports = router;
