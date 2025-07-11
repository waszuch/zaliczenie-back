const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Tutaj w przyszłości dodamy logikę kontrolera
const roomController = require('../controllers/roomController');

// GET /api/rooms - Pobierz wszystkie salki (dla wszystkich zalogowanych)
router.get('/', protect, roomController.getAllRooms);

// POST /api/rooms - Stwórz nową salkę (tylko admin)
router.post('/', protect, admin, roomController.createRoom);

// PUT /api/rooms/:id - Aktualizuj salkę (tylko admin)
router.put('/:id', protect, admin, roomController.updateRoom);

// DELETE /api/rooms/:id - Usuń salkę (tylko admin)
router.delete('/:id', protect, admin, roomController.deleteRoom);


module.exports = router; 