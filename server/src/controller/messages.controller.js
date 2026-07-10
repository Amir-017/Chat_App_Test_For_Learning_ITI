const Message = require("../models/messages.models");
////////////////////////////////

 // Get All Messages

//////////////////////////////////
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
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

    //   io.to(String(deletedMessage.sender)).emit("message-deleted", { messageId });
      io.to(String(deletedMessage.receiver)).emit("message-deleted", { messageId });
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
  editeMessage,
  deleteMessage,
};