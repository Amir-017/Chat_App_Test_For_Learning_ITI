const Message = require("../models/messages.models");
const Group = require("../models/groups.models");
const cloudinary = require("../config/cloudinary");
////////////////////////////////

 // Get All Messages

//////////////////////////////////
const allMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId }).select("_id");
    const groupIds = groups.map((group) => group._id);

    const messages = await Message.find({
      $or: [
        {
          conversationType: { $ne: "group" },
          $or: [{ sender: userId }, { receiver: userId }],
        },
        {
          conversationType: "group",
          group: { $in: groupIds },
        },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////

 // Upload Message Image (direct or group)

//////////////////////////////////
const uploadMessageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const { receiver, groupId, caption } = req.body;
    const sender = req.user.id;

    if (!receiver && !groupId) {
      return res.status(400).json({ message: "receiver or groupId is required" });
    }

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const isMember = group.members.some((member) => String(member) === String(sender));
      if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "whatsapp-chat", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const newMessage = await Message.create({
      sender,
      receiver: groupId ? null : receiver,
      group: groupId || null,
      conversationType: groupId ? "group" : "direct",
      message: caption?.trim() || "",
      image: { url: uploadResult.secure_url, publicId: uploadResult.public_id },
    });

    const io = req.app.get("io");

    if (groupId) {
      io.to(String(groupId)).emit("group-message", newMessage);
    } else {
      io.to(String(sender)).emit("receive-message", newMessage);
      if (String(receiver) !== String(sender)) {
        io.to(String(receiver)).emit("receive-message", newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////

 // Edit Message

//////////////////////////////////
const editeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { message },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////

// Edit Message via Socket

//////////////////////////////////
const editMessage = (io, socket) => {
  socket.on("edit-message", async ({ messageId, newMessage }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          message: newMessage,
          isEdited: true,
          editedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedMessage) {
        socket.emit("message-edit-error", {
          messageId,
          error: "Message not found",
        });
        return;
      }

      const payload = { messageId, newMessage };

      if (updatedMessage.conversationType === "group" && updatedMessage.group) {
        io.to(String(updatedMessage.group)).emit("message-edited", payload);
      } else {
        io.to(String(updatedMessage.sender)).emit("message-edited", payload);
        if (updatedMessage.receiver) {
          io.to(String(updatedMessage.receiver)).emit("message-edited", payload);
        }
      }
    } catch (error) {
      console.error("Error editing message:", error.message);
      socket.emit("message-edit-error", {
        messageId,
        error: "Failed to edit message",
      });
    }
  });
};

//////////////////////////////////

// Delete Message

//////////////////////////////////
const deleteMessage = (io, socket) => {
  socket.on("delete-message", async ({ messageId }) => {
    try {
      const deletedMessage = await Message.findByIdAndUpdate(
        messageId,
        { isDeleted: true },
        { new: true }
      );

      if (!deletedMessage) {
        socket.emit("message-delete-error", {
          messageId,
          error: "Message not found",
        });
        return;
      }

      const payload = { messageId };

      if (deletedMessage.conversationType === "group" && deletedMessage.group) {
        io.to(String(deletedMessage.group)).emit("message-deleted", payload);
      } else {
        io.to(String(deletedMessage.sender)).emit("message-deleted", payload);
        if (deletedMessage.receiver) {
          io.to(String(deletedMessage.receiver)).emit("message-deleted", payload);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error.message);
      socket.emit("message-delete-error", {
        messageId,
        error: "Failed to delete message",
      });
    }
  });
};


module.exports = {
  allMessages,
  uploadMessageImage,
  editeMessage,
  editMessage,
  deleteMessage,
};