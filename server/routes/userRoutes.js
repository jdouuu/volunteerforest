// server/routes/userRoutes.js
const express = require('express');
const { getUserProfile, updateUserProfile, getAllUserProfiles } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profiles
 *   description: User profile management
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [User Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authorized, token failed or no token
 *       404:
 *         description: User profile not found
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [User Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipcode:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User profile not found
 */
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

/**
 * @swagger
 * /api/users/all-profiles:
 *   get:
 *     summary: Get all user profiles (Admin access required)
 *     tags: [User Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (if roles implemented)
 *       404:
 *         description: No user profiles found
 */
router.get('/all-profiles', protect, authorizeRoles('admin'), getAllUserProfiles); // Placeholder for admin role

module.exports = router;
