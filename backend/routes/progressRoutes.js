// routes/studentAttemptRoutes.js
const express = require("express");
const router = express.Router();
const { getStudentProgress } = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ your JWT middleware

// GET /api/progress?examId=...&studentId=...&minScore=...
router.get("/", authMiddleware, getStudentProgress);

module.exports = router;
