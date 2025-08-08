const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Event = require('../models/Event');

const router = express.Router();

// GET /api/events?page=&limit=
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({}).sort({ startDate: 1 }).skip(skip).limit(limit),
      Event.countDocuments({})
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      success: true,
      data: {
        events,
        total,
        page,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid event id' });
  }
});

// POST /api/events (admin)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const required = ['title','description','eventType','requiredSkills','location','startDate','endDate','duration','maxVolunteers','organizer'];
    for (const key of required) {
      if (body[key] === undefined || body[key] === null || (Array.isArray(body[key]) && body[key].length === 0)) {
        return res.status(400).json({ success: false, message: `Missing required field: ${key}` });
      }
    }

    const created = await Event.create(body);
    res.status(201).json({ success: true, data: created, message: 'Event created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/events/:id (admin)
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: updated, message: 'Event updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/:id (admin)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/events/:id/register (volunteer registers self)
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.currentVolunteers >= event.maxVolunteers) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    event.currentVolunteers += 1;
    await event.save();
    res.json({ success: true, message: 'Registered for event', data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

