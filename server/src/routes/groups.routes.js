const { Router } = require("express");
const { auth } = require("../Auth/auth");
const {
  createGroup,
  getMyGroups,
  getGroupById,
  addGroupMembers,
  removeGroupMember,
  getGroupMessages,
} = require("../controller/groups.controller");

const router = Router();

router.post("/", auth, createGroup);
router.get("/", auth, getMyGroups);
router.get("/:groupId", auth, getGroupById);
router.post("/:groupId/members", auth, addGroupMembers);
router.delete("/:groupId/members/:memberId", auth, removeGroupMember);
router.get("/:groupId/messages", auth, getGroupMessages);

module.exports = router;