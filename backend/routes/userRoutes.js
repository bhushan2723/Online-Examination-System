const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getUsers, addUser, approveUser, rejectUser, suspendUser, reconsiderUser } = require('../controllers/userController');
const { registerUser, loginUser } = require('../controllers/authController');
const uploadTeacherId = require("../middleware/uploadTeacherId");

// Public routes
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Email is invalid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], uploadTeacherId.single("teacherIdFile"), registerUser);

router.post('/login', loginUser);

// Basic user routes (you might want to protect these later)
router.get('/', getUsers);
router.post('/', addUser);
router.patch("/:id/approve", approveUser);
router.patch("/:id/reject", rejectUser);
router.patch("/:id/suspend", suspendUser);
router.patch("/:id/reconsider", reconsiderUser);



module.exports = router;