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

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group creation and membership management
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a group (the creator becomes admin and a member)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               members:
 *                 type: array
 *                 items: { type: string }
 *                 description: User ids to add besides the creator
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 group: { $ref: '#/components/schemas/Group' }
 *       400:
 *         description: Group name is required
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, createGroup);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: List groups the current user belongs to (including ones they were removed from)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 groups:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Group' }
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getMyGroups);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get a single group by id
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Group fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 group: { $ref: '#/components/schemas/Group' }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Group not found
 */
router.get("/:groupId", auth, getGroupById);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   post:
 *     summary: Add members to a group (admin only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [members]
 *             properties:
 *               members:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Members added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 group: { $ref: '#/components/schemas/Group' }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only group admin can do this
 *       404:
 *         description: Group not found
 */
router.post("/:groupId/members", auth, addGroupMembers);

/**
 * @swagger
 * /api/groups/{groupId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a group (admin only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 group: { $ref: '#/components/schemas/Group' }
 *       400:
 *         description: Admin cannot be removed from the group
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only group admin can do this
 *       404:
 *         description: Group not found
 */
router.delete("/:groupId/members/:memberId", auth, removeGroupMember);

/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   get:
 *     summary: Get all messages for a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Group messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 messages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Message' }
 *       401:
 *         description: Unauthorized
 */
router.get("/:groupId/messages", auth, getGroupMessages);

module.exports = router;
