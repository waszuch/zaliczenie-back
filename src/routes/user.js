const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const userController = require('../controllers/userController');

router.get('/', protect, admin, userController.getUsers);

module.exports = router; 