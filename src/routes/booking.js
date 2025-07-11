const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const bookingController = require('../controllers/bookingController');

// GET /api/bookings - Pobierz wszystkie rezerwacje (admin) lub swoje (user)
router.get('/', protect, bookingController.getBookings);

// POST /api/bookings - Stwórz nową rezerwację
router.post('/', protect, bookingController.createBooking);

// PUT /api/bookings/:id - Aktualizuj rezerwację (użytkownik może edytować swoje, admin wszystkie)
router.put('/:id', protect, bookingController.updateBooking);

// DELETE /api/bookings/:id - Usuń rezerwację (tylko admin)
router.delete('/:id', protect, admin, bookingController.deleteBooking);

module.exports = router; 