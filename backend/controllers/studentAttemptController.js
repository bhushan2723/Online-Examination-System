// controllers/studentAttemptController.js
const StudentAttempt = require("../models/StudentAttempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

// Start attempt (called when exam window is opened)
const startAttempt = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.userId; // from auth middleware

    // Fetch exam details (to check maxAttempts)
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Count how many attempts student already has
    const attemptsCount = await StudentAttempt.countDocuments({ studentId, examId });

    if (attemptsCount >= exam.maxAttempts) {
      return res.status(400).json({ error: "Maximum attempts reached for this exam" });
    }

    // If already has an active attempt, return it
    const activeAttempt = await StudentAttempt.findOne({ studentId, examId, status: "in_progress" });
    if (activeAttempt) {
      return res.status(200).json(activeAttempt);
    }

    // Normalize IP address (handle ::1, IPv6, proxies)
    let ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() || // if behind proxy/load balancer
      req.connection?.remoteAddress ||
      req.ip;

    if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
      ipAddress = "localhost";
    }

    // Create fresh attempt
    const attempt = new StudentAttempt({
      studentId,
      examId,
      startedAt: new Date(),
      status: "in_progress",
      ipAddress,
      deviceInfo: {
        browser: req.headers["user-agent"] || "Unknown",
        os: req.headers["sec-ch-ua-platform"] || "Unknown", // can refine with user-agent-parser
        deviceType: req.headers["sec-ch-ua-mobile"] ? "Mobile" : "Desktop",
      },
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      timeRemaining: exam.duration,
      score: 0,
      tabSwitchCount: 0,
      answers: [] // initialize empty answers array
    });

    await attempt.save();
    res.status(201).json(attempt);
  } catch (err) {
    console.error("❌ Error starting attempt:", err);
    res.status(500).json({ error: "Could not start attempt" });
  }
};

// Update attempt (save progress, tab switches, etc.)
const updateAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const updates = req.body;

    const attempt = await StudentAttempt.findByIdAndUpdate(
      attemptId,
      { $set: updates },
      { new: true }
    );

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    res.status(200).json(attempt);
  } catch (err) {
    console.error("❌ Error updating attempt:", err);
    res.status(500).json({ error: "Could not update attempt" });
  }
};

// Submit attempt (final submission)
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, tabSwitchCount } = req.body;

    const attempt = await StudentAttempt.findById(attemptId).populate("examId");
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    const exam = attempt.examId;
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let totalScore = 0;
    let totalMarks = 0;

    // ✅ Reset old answers before saving new ones
    attempt.answers = [];

    for (const ans of answers) {
      const q = await Question.findById(ans.questionId);
      if (!q) continue;

      const isCorrect = q.options[q.correctOptionIndex] === ans.selectedOption;
      const marksObtained = isCorrect ? q.marks : 0;

      attempt.answers.push({
        questionId: q._id,
        selectedOption: ans.selectedOption,
        isCorrect,
        marksObtained
      });

      totalScore += marksObtained;
      totalMarks += q.marks;
    }

    const now = new Date();
    const examStart = new Date(exam.startTime);
    const examEnd = new Date(exam.endTime);

    // ⏱️ Calculate duration and remaining time
    const duration = Math.max(0, Math.floor((now - examStart) / 1000)); // in seconds
    const timeRemaining = Math.max(0, Math.floor((examEnd - now) / 1000)); // in seconds


    attempt.score = totalScore;
    attempt.totalMarks = totalMarks;
    attempt.submittedAt = now;
    attempt.tabSwitchCount = tabSwitchCount;
    attempt.duration = duration;
    attempt.timeRemaining = timeRemaining;

    // 🚨 Check for cheating
    if (tabSwitchCount >= exam.tabSwitchLimit) {
      attempt.status = "cheated";
    } else {
      attempt.status = "submitted";
    }

    await attempt.save();
    res.status(200).json(attempt);
  } catch (err) {
    console.error("❌ Error submitting attempt:", err);
    res.status(500).json({ error: "Could not submit attempt" });
  }
};

//Check if exam paper was already attempted
const checkAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.userId;

    const attempt = await StudentAttempt.findOne({ examId, studentId });
    if (attempt) {
      return res.json({ attempted: true });
    }
    res.json({ attempted: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { startAttempt, updateAttempt, submitAttempt, checkAttempt };
