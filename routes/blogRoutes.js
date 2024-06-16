// routes/blogRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createBlog,
  getAllBlogs,
  deleteBlog,
  getSingleBlog,
  updateBlog,
} = require("../controllers/blogController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to create a new blog post with multiple images
router.post(
  "/blog/create",
  upload.array("images", 10),
  verifyToken,
  createBlog
);

// route to fetch all blogs

router.get("/blogs", verifyToken, getAllBlogs);
router.get("/blog/:id", verifyToken, getSingleBlog);
router.delete("/blog/delete/:id", verifyToken, deleteBlog);
router.put("/blog/update/:id", verifyToken, updateBlog);

module.exports = router;
