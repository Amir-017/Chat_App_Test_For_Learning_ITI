 const User = require("../models/users.models");
 const { clerkClient } = require("@clerk/express");
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

////////////////////////////////////

 // Sync Profile (name/avatar) From Clerk

//////////////////////////////////
// Clerk profile edits (name, avatar) only reach this app's own User copy when the frontend
// calls this after Clerk's own user object changes - see Header.jsx. On success it broadcasts
// the new name/imageUrl over socket.io so every connected client's sidebar/chat header updates
// live, without the other party needing to refresh.
const syncProfile = async (req, res) => {
  try {
    const { clerkId, id: userId } = req.user;
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = clerkUser.fullName || clerkUser.username || email || "User";
    const imageUrl = clerkUser.imageUrl || null;

    const user = await User.findByIdAndUpdate(userId, { name, imageUrl }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.app.get("io").emit("user-profile-updated", { userId: String(user._id), name: user.name, imageUrl: user.imageUrl });

    res.status(200).json({ message: "Profile synced successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  specificUser,
  syncProfile,
};
