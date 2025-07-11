const express = require('express');
const router = express.Router();

// Tutaj w przyszłości dodamy logikę kontrolera
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router; 