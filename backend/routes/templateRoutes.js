const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const templateController = require('../controllers/templateController');

// Teacher Dashboard Route
router.get('/download-template', authMiddleware, templateController.downloadTemplate);

module.exports = router;