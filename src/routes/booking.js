const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const bookingController = require('../controllers/bookingController');

router.get('/', protect, bookingController.getBookings);

router.get('/calendar', protect, bookingController.getCalendarBookings);

router.post('/', protect, bookingController.createBooking);

router.put('/:id', protect, bookingController.updateBooking);

router.delete('/:id', protect, admin, bookingController.deleteBooking);

module.exports = router; 