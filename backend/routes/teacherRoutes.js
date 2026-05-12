const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const teacherController = require('../controllers/teacherController');

// Teacher Dashboard Route
router.get('/dashboard', authMiddleware, teacherController.getDashboard);

module.exports = router;