// routes/studentAttemptRoutes.js
const express = require("express");
const router = express.Router();
const { startAttempt, updateAttempt, submitAttempt, checkAttempt } = require("../controllers/studentAttemptController");
const auth = require("../middleware/authMiddleware"); // ✅ your JWT middleware

// Start exam attempt
router.post("/start", auth, startAttempt);

// Save progress (optional, for autosave / tab switch tracking)
router.put("/:attemptId/update", auth, updateAttempt);

// Submit exam
router.put("/:attemptId/submit", auth, submitAttempt);

// Check if student already attempted this exam
router.get("/check/:examId", auth, checkAttempt);


module.exports = router;
