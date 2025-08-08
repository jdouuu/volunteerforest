// server/routes/reportRoutes.js
const express = require('express');
const {
  getVolunteerReport,
  getEventReport,
  getSummaryReport
} = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Administrative reporting endpoints
 */

/**
 * @swagger
 * /api/reports/volunteers:
 *   get:
 *     summary: Get volunteer participation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events until this date
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [environmental, education, healthcare, community, animals, seniors, children]
 *         description: Filter by event type
 *       - in: query
 *         name: skillFilter
 *         schema:
 *           type: string
 *         description: Comma-separated list of skills to filter by
 *       - in: query
 *         name: minHours
 *         schema:
 *           type: integer
 *         description: Minimum total hours volunteered
 *       - in: query
 *         name: maxHours
 *         schema:
 *           type: integer
 *         description: Maximum total hours volunteered
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *         description: Report format
 *     responses:
 *       200:
 *         description: Volunteer report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/volunteers', protect, authorizeRoles('admin'), getVolunteerReport);

/**
 * @swagger
 * /api/reports/events:
 *   get:
 *     summary: Get event management report with volunteer assignments
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events until this date
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [environmental, education, healthcare, community, animals, seniors, children]
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed, cancelled]
 *         description: Filter by event status
 *       - in: query
 *         name: organizerFilter
 *         schema:
 *           type: string
 *         description: Filter by organizer name (partial match)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *         description: Report format
 *     responses:
 *       200:
 *         description: Event report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/events', protect, authorizeRoles('admin'), getEventReport);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get overall system summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *         description: Report format
 *     responses:
 *       200:
 *         description: Summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/summary', protect, authorizeRoles('admin'), getSummaryReport);

module.exports = router;
