const express = require("express");
const router = express.Router();
const { 
  getExamsByTeacher, 
  createExam, 
  getExamById, 
  updateExam, 
  deleteExam,
  startExamAttempt,
  getCompletedExamsByTeacher,
  getCompletedExamsByStudent,
  getReportCard,
  getStudentAttemptReport,
  publishResult,
  getTop4ExamsByAverageScore
} = require("../controllers/examController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/exams/completed - Get completed exams for logged-in teacher
router.get("/completed", authMiddleware, getCompletedExamsByTeacher);

// GET /api/exams - Get all exams for logged-in teacher
router.get("/", authMiddleware, getExamsByTeacher);

// POST /api/exams - Create a new exam
router.post("/", authMiddleware, createExam);

// GET /api/exams/:id - Get single exam by ID
router.get("/:id", authMiddleware, getExamById);

// PUT /api/exams/:id - Update an exam
router.put("/:id", authMiddleware, updateExam);

// DELETE /api/exams/:id - Delete an exam
router.delete("/:id", authMiddleware, deleteExam);

// Start exam attempt
router.post('/:examId/start', authMiddleware, startExamAttempt);

// GET /api/exams/:examId/report-card - Detailed report card for an exam
router.get('/:examId/report-card', authMiddleware, getReportCard);

router.get("/:examId/student/:studentId", authMiddleware, getStudentAttemptReport);

// GET /api/exams/student/completed - Get completed exams for logged-in student
router.get("/student/completed", authMiddleware, getCompletedExamsByStudent);

router.put("/:id/publish", authMiddleware, publishResult);




module.exports = router;