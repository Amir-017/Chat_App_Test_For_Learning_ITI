const { Router } = require("express");
const { createUser, getAllUsers , login , specificUser} = require("../controller/users.controllers");
const { auth } = require("../Auth/auth");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Registration, login and user lookups
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email already exists
 */
router.post("/", createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 id: { type: string }
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", login);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
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
module.exports = router;
