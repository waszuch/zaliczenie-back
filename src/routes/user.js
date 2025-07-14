const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const userController = require('../controllers/userController');

// GET /api/users - Pobierz listę użytkowników (tylko admin)
router.get('/', protect, admin, userController.getUsers);

module.exports = router; 