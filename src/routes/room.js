const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const roomController = require('../controllers/roomController');

router.get('/', protect, roomController.getAllRooms);

router.post('/', protect, admin, roomController.createRoom);

router.put('/:id', protect, admin, roomController.updateRoom);

router.delete('/:id', protect, admin, roomController.deleteRoom);

module.exports = router; 