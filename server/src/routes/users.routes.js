const { Router } = require("express");
const { getAllUsers, specificUser, syncProfile } = require("../controller/users.controllers");
const { auth } = require("../Auth/auth");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User lookups. Sign-up and sign-in are handled by Clerk on the frontend, not this API.
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users known to this app (synced from Clerk on their first authenticated request)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 */
router.get("/",auth, getAllUsers);

/**
 * @swagger
 * /api/users/userInfo:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/userInfo",auth, specificUser);

/**
 * @swagger
 * /api/users/sync-profile:
 *   post:
 *     summary: Re-sync the authenticated user's name/avatar from Clerk and broadcast the change over socket.io
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post("/sync-profile", auth, syncProfile);

module.exports = router;
