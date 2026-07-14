const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', authorize('admin', 'leader'), createEvent);
router.put('/:id', authorize('admin', 'leader'), updateEvent);
router.delete('/:id', authorize('admin'), deleteEvent);

module.exports = router;
