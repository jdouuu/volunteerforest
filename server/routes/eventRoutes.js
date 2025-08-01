// server/routes/eventRoutes.js
const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  matchVolunteersToEvents,
  recordVolunteerHistory,
  getUserHistory,
  getEventHistory
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and volunteer matching
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventDetails'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/EventDetails'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventDetails'
 */
router.route('/')
  .post(protect, authorizeRoles('admin'), createEvent) // Admin only
  .get(getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventDetails'
 *       404:
 *         description: Event not found
 *   put:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventDetails'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/EventDetails'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event removed successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 */
router.route('/:id')
  .get(getEventById)
  .put(protect, authorizeRoles('admin'), updateEvent) // Admin only
  .delete(protect, authorizeRoles('admin'), deleteEvent); // Admin only

/**
 * @swagger
 * /api/events/match:
 *   get:
 *     summary: Match volunteers to events based on criteria
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events with potential volunteer matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   event:
 *                     $ref: '#/components/schemas/EventDetails'
 *                   potentialVolunteers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         volunteer:
 *                           $ref: '#/components/schemas/UserProfile'
 *                         score:
 *                           type: number
 *       401:
 *         description: Not authorized
 */
router.get('/match', protect, authorizeRoles('admin'), matchVolunteersToEvents); // Admin or specific matching module

/**
 * @swagger
 * tags:
 *   name: Volunteer History
 *   description: Volunteer participation history management
 */

/**
 * @swagger
 * /api/history:
 *   post:
 *     summary: Record volunteer participation history
 *     tags: [Volunteer History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - participationDate
 *               - hoursVolunteered
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event
 *               participationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of participation
 *               feedback:
 *                 type: string
 *                 description: Optional feedback
 *               hoursVolunteered:
 *                 type: number
 *                 description: Hours volunteered
 *     responses:
 *       201:
 *         description: History recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 history:
 *                   $ref: '#/components/schemas/VolunteerHistory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Event or User not found
 */
router.post('/history', protect, recordVolunteerHistory);

/**
 * @swagger
 * /api/history/user/{userId}:
 *   get:
 *     summary: Get volunteer history for a specific user
 *     tags: [Volunteer History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's volunteer history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VolunteerHistory'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (if trying to view another user's history without admin rights)
 *       404:
 *         description: No history found
 */
router.get('/history/user/:userId', protect, getUserHistory);

/**
 * @swagger
 * /api/history/event/{eventId}:
 *   get:
 *     summary: Get volunteer history for a specific event (Admin access required)
 *     tags: [Volunteer History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event's volunteer history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VolunteerHistory'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (if roles implemented)
 *       404:
 *         description: No history found
 */
router.get('/history/event/:eventId', protect, authorizeRoles('admin'), getEventHistory); // Admin only

module.exports = router;
