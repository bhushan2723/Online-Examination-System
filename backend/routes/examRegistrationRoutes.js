// routes/examRegistration.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  registerForExam,
  getMyExams,
  getExamRegistrations,
  cancelRegistrationSelf,
  cancelRegistrationByTeacher
} = require('../controllers/examRegistrationController');

// Register for an exam
router.post('/:examCode/register', auth, registerForExam);

// Get student's registered exams
router.get('/my-exams', auth, getMyExams);

// Get all registrations for an exam (for teachers)
router.get('/exam/:examId', auth, getExamRegistrations);

// Student Cancel registration for an exam
router.delete('/:examId/cancel', auth, cancelRegistrationSelf);

// Teacher Cancel registration for an exam
router.delete('/:examId/students/:studentId/cancel', auth, cancelRegistrationByTeacher);


module.exports = router;