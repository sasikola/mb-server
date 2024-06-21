const Blog = require("../models/Blog");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const createBlog = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const imagePaths = req.files?.map((file) => file.path);

    // Validation
    if (!title || !description || !category || !imagePaths) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check image size
    const imageSizes = imagePaths.map((path) => fs.statSync(path).size);
    if (imageSizes.some((size) => size > 1000000)) {
      return res
        .status(400)
        .json({ message: "Image size should be less than 1MB" });
    }

    // Check number of images
    if (imagePaths.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    if (imagePaths.length > 5) {
      return res.status(400).json({ message: "Only 5 images are allowed" });
    }

    // Check if blog with same title already exists
    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        message:
          "A blog with this title already exists. Please use another title.",
      });
    }

    // Create new blog
    const newBlog = new Blog({
      title,
      description,
      category,
      images: imagePaths,
      author: req.user._id,
    });
    await newBlog.save();

    // Update user's post count
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.posts += 1; // Increment the posts count
    await user.save();

    res
      .status(201)
      .json({ message: "Blog post created successfully.", blog: newBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to fetch all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "firstName lastName"); // Populate author field with the firstName and lastName
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// to delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the blog by id
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the logged-in user is the author of the blog
    if (blog.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }

    // Delete the images associated with the blog
    blog.images.forEach((imagePath) => {
      fs.unlink(path.resolve(imagePath), (err) => {
        if (err) {
          console.error(`Failed to delete image at path: ${imagePath}`, err);
        }
      });
    });

    // Delete the blog
    await blog.deleteOne();

    // Find the user who authored the blog and decrement their post count
    const user = await User.findById(userId);
    if (user) {
      user.posts -= 1; // Decrement the posts count
      await user.save();
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to get single blog
const getSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate(
      "author",
      "firstName lastName"
    ); // Populate author field with the firstName and lastName
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to update the blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const imagePaths = req.files?.map((file) => file.path);
    // validation
    if (!title || !description || !category || !imagePaths) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check image size
    const imageSizes = imagePaths.map((path) => fs.statSync(path).size);
    if (imageSizes.some((size) => size > 1000000)) {
      return res
        .status(400)
        .json({ message: "Image size should be less than 1MB" });
    }

    // Check number of images
    if (imagePaths.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    if (imagePaths.length > 5) {
      return res.status(400).json({ message: "Only 5 images are allowed" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // delete the old images
    if (blog.images.length > 0) {
      blog.images.forEach((image) => {
        fs.unlink(image, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });
    }
    // add new images
    if (imagePaths?.length > 0) {
      imagePaths.forEach((image) => {
        blog.images.push(image);
      });
    }
    if (title) {
      blog.title = title;
    }
    if (description) {
      blog.description = description;
    }
    if (category) {
      blog.category = category;
    }
    await blog.save();
    res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//to the posts by category

const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const blogs = await Blog.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to get user posts

const getUserPosts = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const blogs = await Blog.find({ author: id }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------USER ROUTES------------------//

// to get user profile
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-userType");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// get all authors

const getAllAuthors = async (req, res) => {
  try {
    const authors = await User.find().select("-password");
    res.status(200).json(authors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to change the profile picture
const changeProfilePicture = async (req, res) => {
  try {
    const id = req.user._id;

    // Check if file is present
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // to update the user details
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.profilePicture) {
      fs.unlink(user.profilePicture, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Previous profile picture deleted successfully");
        }
      });
    }

    // Process the uploaded file
    const imagePath = req.file.path;
    console.log("Uploaded image path:", imagePath);

    // Update user profile picture in the database
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePicture: imagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// to update the user details

const updateUser = async (req, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailExist = await User.findOne({ email: email });
    if (emailExist && emailExist._id != req.user._id) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // compare the current password and the user password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // to update the user details
    user.fullName = fullName;
    user.email = email;
    user.password = hashedPassword;

    await user.save();
    res
      .status(200)
      .json({ message: "User details updated successfully", user: user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  deleteBlog,
  getSingleBlog,
  updateBlog,
  getUser,
  getAllAuthors,
  changeProfilePicture,
  updateUser,
  getPostsByCategory,
  getUserPosts,
};
