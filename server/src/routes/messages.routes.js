const { Router } = require("express");
const { createUser, getAllUsers , login} = require("../controller/users.controllers");
const { auth } = require("../Auth/auth");
const { allMessages,uploadMessageImage,editeMessage,deleteMessage } = require("../controller/messages.controller");
const upload = require("../middleware/upload");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Direct/group message history and image uploads. Sending text messages, editing and deleting happen over Socket.IO, not REST.
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all messages visible to the current user (direct chats plus messages from groups they belong to)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages, oldest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 *       401:
 *         description: Unauthorized
 */
router.get("/",auth, allMessages);

/**
 * @swagger
 * /api/messages/upload-image:
 *   post:
 *     summary: Upload an image message to a direct chat or a group
 *     description: Uploads the image to Cloudinary, saves the message, and broadcasts it over Socket.IO (receive-message for direct chats, group-message for groups). Provide exactly one of receiver or groupId.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               receiver:
 *                 type: string
 *                 description: Recipient user id (direct chat)
 *               groupId:
 *                 type: string
 *                 description: Target group id (group chat)
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Image message created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: No image file, or neither receiver nor groupId provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of the target group
 *       404:
 *         description: Group not found
 */
router.post("/upload-image",auth, upload.single("image"), uploadMessageImage);

/**
 * @swagger
 * /api/messages/editeMessage/{id}:
 *   patch:
 *     summary: Edit a message's text
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Updated message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.patch("/editeMessage/:id",auth, editeMessage);
// router.delete("/:id",auth, deleteMessage);
module.exports = router;
