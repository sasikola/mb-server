const Blog = require("../models/Blog");
const User = require("../models/User");
const bcrypt = require("bcrypt")

const createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const imagePaths = req.files?.map((file) => file.path);

    // validation
    if (!title || !content || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (imagePaths.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    if (imagePaths.length > 5) {
      return res.status(400).json({ message: "Only 5 images are allowed" });
    }

    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        message:
          "Already one blog is there with this title, Please try with another title.",
      });
    }

    const newBlog = new Blog({
      title,
      content,
      author,
      images: imagePaths,
    });

    await newBlog.save();
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
    const blogs = await Blog.find();
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
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
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
    const blog = await Blog.findById(id);
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
    const { title, content, author } = req.body;
    const imagePaths = req.files?.map((file) => file.path);
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    if (title) {
      blog.title = title;
    }
    if (content) {
      blog.content = content;
    }
    if (author) {
      blog.author = author;
    }
    if (imagePaths?.length > 0) {
      blog.images = imagePaths;
    }
    await blog.save();
    res.status(200).json({ message: "Blog updated successfully" });
    console.log(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    res.status(200).json({ message: "User details updated successfully" });
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
};
