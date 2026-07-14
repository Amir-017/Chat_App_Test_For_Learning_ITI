const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    conversationType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    isSeen: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre("validate", function () {
  if (!this.message?.trim() && !this.image?.url) {
    throw new Error("Message must contain text or an image");
  }
});

module.exports = mongoose.model("Message", messageSchema);