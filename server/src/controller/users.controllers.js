 const User = require("../models/user.model");
 const bcrypt = require("bcrypt");
 const jwt = require("jsonwebtoken");
 //////////////////////////////////

   // Create User

//////////////////////////////////
 const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password, // هيتعمله hash في pre('save')
    });


    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

///////////////////////////////////

 // Login

//////////////////////////////////
 const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    res.status(200).json({
      message: "Login successful",
      token,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

///////////////////////////////////

 // Get All Users
//////////////////////////////////
 const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
////////////////////////////////////

 // Get Specific User

//////////////////////////////////
const specificUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the token payload
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  login,
  getAllUsers,
  specificUser,
};