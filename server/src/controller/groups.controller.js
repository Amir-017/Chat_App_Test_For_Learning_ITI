const Group = require("../models/groups.models");
const Message = require("../models/messages.models");

const populateGroup = (query) => {
  return query.populate("admin", "name email").populate("members", "name email");
};

const emitGroupUpdate = (req, group) => {
  const io = req.app.get("io");

  if (!io || !group) {
    return;
  }

  const payload = group.toObject ? group.toObject() : group;
  const memberIds = (payload.members || []).map((member) => String(member._id || member));

  memberIds.forEach((memberId) => {
    io.to(memberId).emit("group-updated", payload);
  });

  io.to(String(payload._id)).emit("group-updated", payload);
};

const emitGroupUpdateToUser = (req, userId, group) => {
  const io = req.app.get("io");

  if (!io || !group) {
    return;
  }

  const payload = group.toObject ? group.toObject() : group;
  io.to(String(userId)).emit("group-updated", payload);
};

const assertGroupAdmin = (group, userId) => {
  if (!group) {
    return { allowed: false, status: 404, message: "Group not found" };
  }

  const adminId = String(group.admin?._id || group.admin);

  if (adminId !== String(userId)) {
    return { allowed: false, status: 403, message: "Only group admin can do this" };
  }

  return { allowed: true };
};

const createGroup = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const adminId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueMembers = Array.from(new Set([adminId, ...members]));

    const group = await Group.create({
      name: name.trim(),
      admin: adminId,
      members: uniqueMembers,
    });

    const populatedGroup = await populateGroup(Group.findById(group._id));

    emitGroupUpdate(req, populatedGroup);

    const io = req.app.get("io");
    if (io) {
      (populatedGroup.members || []).forEach((member) => {
        io.to(String(member._id)).emit("group-created", populatedGroup);
      });
    }

    res.status(201).json({
      message: "Group created successfully",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await populateGroup(
      Group.find({
        $or: [{ members: userId }, { removedMembers: userId }],
      }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      message: "Groups fetched successfully",
      groups,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await populateGroup(Group.findById(groupId));

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some((member) => String(member._id) === String(userId));
    const isRemoved = group.removedMembers.some((member) => String(member._id || member) === String(userId));

    if (!isMember && !isRemoved) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json({
      message: "Group fetched successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members = [] } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    const adminCheck = assertGroupAdmin(group, userId);

    if (!adminCheck.allowed) {
      return res.status(adminCheck.status).json({ message: adminCheck.message });
    }

    const newMembers = Array.from(new Set([...group.members.map(String), ...members.map(String), String(group.admin)]));
    group.members = newMembers;
    group.removedMembers = group.removedMembers.filter((member) => !members.map(String).includes(String(member)));
    await group.save();

    const populatedGroup = await populateGroup(Group.findById(group._id));
    emitGroupUpdate(req, populatedGroup);

    res.status(200).json({
      message: "Members added successfully",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    const adminCheck = assertGroupAdmin(group, userId);

    if (!adminCheck.allowed) {
      return res.status(adminCheck.status).json({ message: adminCheck.message });
    }

    if (String(group.admin) === String(memberId)) {
      return res.status(400).json({ message: "Admin cannot be removed from the group" });
    }

    group.members = group.members.filter((member) => String(member) !== String(memberId));
    group.removedMembers = Array.from(
      new Set([...group.removedMembers.map(String), String(memberId)])
    );
    await group.save();

    const populatedGroup = await populateGroup(Group.findById(group._id));
    emitGroupUpdate(req, populatedGroup);
    emitGroupUpdateToUser(req, memberId, populatedGroup);

    res.status(200).json({
      message: "Member removed successfully",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    const adminCheck = assertGroupAdmin(group, userId);

    if (!adminCheck.allowed) {
      return res.status(adminCheck.status).json({ message: adminCheck.message });
    }

    const memberIds = group.members.map((member) => String(member));

    await Group.findByIdAndDelete(groupId);
    await Message.deleteMany({ conversationType: "group", group: groupId });

    const io = req.app.get("io");
    if (io) {
      memberIds.forEach((memberId) => {
        io.to(memberId).emit("group-deleted", { groupId });
      });
      io.to(String(groupId)).emit("group-deleted", { groupId });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({
      conversationType: "group",
      group: groupId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      message: "Group messages fetched successfully",
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addGroupMembers,
  removeGroupMember,
  deleteGroup,
  getGroupMessages,
};