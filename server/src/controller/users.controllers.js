 const User = require("../models/users.models");
 //////////////////////////////////

 // Get All Users

//////////////////////////////////
 const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

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
    const user = await User.findById(userId);

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
  getAllUsers,
  specificUser,
};
