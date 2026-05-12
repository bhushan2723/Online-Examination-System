const Exam = require("../models/Exam");
const Question = require("../models/Question");
const ExcelJS = require("exceljs");
const ExamRegistration = require('../models/ExamRegistration');
const StudentAttempt = require('../models/StudentAttempt');
const logActivity = require("../middleware/activityMiddleware");
const mongoose = require('mongoose');

// --- helpers ---
const gradeFromPercent = (p) => {
  if (p >= 80) return "Excellent";
  if (p >= 50) return "Average";
  return "Poor";
};

const minutesDiff = (start, end) => {
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
};

// GET exams for logged-in teacher
const getExamsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.userId; 
    const exams = await Exam.find({ createdBy: teacherId })
      .populate('questions.questionRef')
      .sort({ startTime: 1 });

    // Manually update status for each exam to ensure it's current
    const now = new Date();
    const updatedExams = exams.map(exam => {
      // Create a plain object to avoid mongoose document issues
      const examObj = exam.toObject();
      
      if (now < exam.startTime) {
        examObj.status = "Upcoming";
      } else if (now >= exam.startTime && now <= exam.endTime) {
        examObj.status = "In Progress";
      } else if (now > exam.endTime) {
        examObj.status = "Completed";
      }
      
      return examObj;
    });

    // Define the sorting order for statuses
    const statusOrder = {
      "In Progress": 1,
      "Upcoming": 2,
      "Completed": 3,
      "Canceled": 4
    };

    // Sort exams by status priority and then by start time
    const sortedExams = updatedExams.sort((a, b) => {
      // First, sort by status priority
      const statusComparison = statusOrder[a.status] - statusOrder[b.status];
      
      if (statusComparison !== 0) {
        return statusComparison;
      }
      
      // If same status, sort by start time
      // For "In Progress" and "Upcoming", sort ascending (earliest first)
      // For "Completed" and "Canceled", sort descending (most recent first)
      if (a.status === "In Progress" || a.status === "Upcoming") {
        return new Date(a.startTime) - new Date(b.startTime);
      } else {
        return new Date(b.startTime) - new Date(a.startTime);
      }
    });

    res.status(200).json(sortedExams);
  } catch (err) {
    console.error("❌ Error fetching exams:", err.message);
    res.status(500).json({ error: "Server error while fetching exams" });
  }
};

// GET completed exams for logged-in teacher (for result insights)
const getCompletedExamsByTeacher = async (req, res) => {
  try {
    // await Exam.updateAllStatuses(); 
    const teacherId = req.user.userId;
    const now = new Date();

    // Fetch only completed exams created by this teacher
    const exams = await Exam.find({
      createdBy: teacherId,
      endTime: { $lt: now }   // exams whose endTime is in the past
    })
    .populate('questions.questionRef')
    .sort({ endTime: -1 }); // latest completed first

    // Ensure status field is always marked correctly
    const completedExams = exams.map(exam => {
      const examObj = exam.toObject();
      examObj.status = "Completed";
      return examObj;
    });

    res.status(200).json(completedExams);
  } catch (err) {
    console.error("❌ Error fetching completed exams:", err.message);
    res.status(500).json({ error: "Server error while fetching completed exams" });
  }
};


// CREATE a new exam
const createExam = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    
    // Validate required fields
    const { title, startTime, endTime, duration, questions } = req.body;
    
    if (!title || !startTime || !endTime || !duration) {
      return res.status(400).json({ 
        error: "Title, start time, end time, and duration are required" 
      });
    }

    // Validate dates
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const now = new Date();

    if (startDate >= endDate) {
      return res.status(400).json({ 
        error: "End time must be after start time" 
      });
    }

    if (endDate <= now) {
      return res.status(400).json({ 
        error: "End time must be in the future" 
      });
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        error: "At least one question is required" 
      });
    }

    // Calculate total marks and questions
    let totalMarks = 0;
    let totalQuestions = questions.length;

    // For existing questions, verify they exist and get their marks
    for (const question of questions) {
      if (question.type === "existing") {
        const existingQuestion = await Question.findById(question.questionRef);
        if (!existingQuestion) {
          return res.status(400).json({ 
            error: `Question with ID ${question.questionRef} not found` 
          });
        }
        totalMarks += existingQuestion.marks;
      } else if (question.type === "custom") {
        if (!question.customQuestion || !question.customQuestion.marks) {
          return res.status(400).json({ 
            error: "Custom questions must have marks specified" 
          });
        }
        totalMarks += question.customQuestion.marks;
      }
    }

    // Generate unique exam code if not provided
    const examCode = req.body.examCode || generateExamCode();

    // Determine initial status based on current time
    let status = "Upcoming";
    const nowTime = new Date();
    if (nowTime >= startDate && nowTime <= endDate) {
      status = "In Progress";
    } else if (nowTime > endDate) {
      status = "Completed";
    }

    // Create exam object
    const examData = {
      ...req.body,
      createdBy: teacherId,
      totalMarks,
      totalQuestions,
      examCode,
      status, // Add the status field
    };

    // Save exam to database
    const newExam = new Exam(examData);
    const savedExam = await newExam.save();

    // Populate the saved exam with question details for response
    await savedExam.populate([
      { path: 'questions.questionRef', model: 'Question' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // log activity
    await logActivity({
      userId: teacherId,
      role: "Teacher",
      action: "created",
      entityType: "exam",
      entityName: savedExam.title
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam: savedExam
    });

  } catch (err) {
    console.error("❌ Error creating exam:", err.message);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(err.errors).map(e => e.message).join(', ') 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Exam code already exists" 
      });
    }
    
    res.status(500).json({ error: "Server error while creating exam" });
  }
};

// GET single exam by ID
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOne({ _id: id })
      .populate({
        path: "questions.questionRef",
        select: "-correctOptionIndex" // exclude the answer field
      })
      .populate("createdBy", "name email");

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Update status in real-time
    const now = new Date();
    if (now < exam.startTime) {
      exam.status = "Upcoming";
    } else if (now >= exam.startTime && now <= exam.endTime) {
      exam.status = "In Progress";
    } else if (now > exam.endTime) {
      exam.status = "Completed";
    }

    // Only save if status has changed
    if (exam.isModified("status")) {
      await exam.save();
    }

    res.status(200).json(exam);
  } catch (err) {
    console.error("❌ Error fetching exam:", err.message);
    res.status(500).json({ error: "Server error while fetching exam" });
  }
};

// UPDATE exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;
    const updateData = { ...req.body };

    // Find the exam first
    const exam = await Exam.findOne({ _id: id, createdBy: teacherId });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // If dates are being updated, recalculate status
    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime ? new Date(updateData.startTime) : exam.startTime;
      const endTime = updateData.endTime ? new Date(updateData.endTime) : exam.endTime;
      const now = new Date();

      if (now < startTime) {
        updateData.status = "Upcoming";
      } else if (now >= startTime && now <= endTime) {
        updateData.status = "In Progress";
      } else if (now > endTime) {
        updateData.status = "Completed";
      }
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('questions.questionRef');

    // log activity
    await logActivity({
      userId: req.user._id,
      role: "Teacher",
      action: "updated",
      entityType: "exam",
      entityName: updatedExam.title
    });

    res.status(200).json({
      message: "Exam updated successfully",
      exam: updatedExam
    });
  } catch (err) {
    console.error("❌ Error updating exam:", err.message);
    res.status(500).json({ error: "Server error while updating exam" });
  }
};

// DELETE exam
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;

    const exam = await Exam.findOneAndDelete({ _id: id, createdBy: teacherId });
    
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting exam:", err.message);
    res.status(500).json({ error: "Server error while deleting exam" });
  }
};

// Helper function to generate unique exam code
const generateExamCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const startExamAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.userId;
    
    // Check if registered
    const registration = await ExamRegistration.findOne({
      studentId,
      examId
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Not registered for this exam' });
    }

    // Get exam details
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // ✅ Check if student has exceeded max attempts
    const attemptCount = await StudentAttempt.countDocuments({ examId, studentId });
    if (attemptCount >= exam.maxAttempts) {
      return res.status(400).json({ 
        error: `Maximum number of attempts (${exam.maxAttempts}) reached for this exam` 
      });
    }
    
    // Check if exam is available
    // const now = new Date();
    // if (now < exam.startTime || now > exam.endTime) {
    //   return res.status(400).json({ error: 'Exam is not currently available' });
    // }
    
    // Create new attempt
    const attempt = new StudentAttempt({
      studentId,
      examId,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      status: 'in_progress'
    });
    
    await attempt.save();
    
    // Update registration with attempt reference
    registration.attemptId = attempt._id;
    registration.status = 'attempted';
    await registration.save();
    
    res.status(200).json({ attempt, exam });
  } catch (error) {
    console.error("❌ Error starting exam attempt:", error.message);
    res.status(500).json({ error: error.message });
  }
};
// --- GET report card ---
/**
 * GET /api/exams/:examId/report-card
 * Returns a comprehensive report for the given exam or Excel if ?export=excel
 */
const getReportCard = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user.userId;
    const exportExcel = req.query.export === "excel";

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ error: "Invalid examId" });
    }

    // 1) Fetch exam
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    if (String(exam.createdBy) !== String(teacherId)) {
      return res.status(403).json({ error: "You are not authorized to view this exam report" });
    }

    const passMark = Math.ceil((exam.totalMarks || 0) * 0.4); // 40% (rounded up)

    // 2) Fetch registrations (with student name)
    const registrations = await ExamRegistration.find({ examId })
      .populate({ path: 'studentId', select: 'name email' })
      .lean();

    // 3) Fetch attempts for this exam (include updatedAt so we can pick latest properly)
    const attempts = await StudentAttempt.find({ examId })
      .select(
        'studentId status score totalMarks startedAt submittedAt timeRemaining duration createdAt updatedAt'
      )
      .lean();

    // 4) If multiple attempts exist, keep the latest one
    //    Prefer submittedAt > updatedAt > createdAt
    const latestAttemptByStudent = new Map();

    for (const att of attempts) {
      const sid = String(att.studentId);
      const prev = latestAttemptByStudent.get(sid);

      const prevTime = prev
        ? (prev.submittedAt || prev.updatedAt || prev.createdAt)
        : null;
      const currTime = att.submittedAt || att.updatedAt || att.createdAt;

      if (!prev || (currTime && prevTime && new Date(currTime) > new Date(prevTime))) {
        latestAttemptByStudent.set(sid, att);
      }
    }

    // 5) Build lists
    const attemptedStudents = [];
    const absentStudents = [];
    let presentCount = 0;
    let passCount = 0;
    let failCount = 0;

    for (const reg of registrations) {
      const sid = String(reg.studentId?._id || reg.studentId);
      const sName = reg.studentId?.name || "Unknown";
      const attempt = latestAttemptByStudent.get(sid);

      if (attempt) {
        // Present (attempt exists irrespective of status)
        presentCount++;

        const score = attempt.score || 0;
        const total = attempt.totalMarks ?? exam.totalMarks ?? 0;
        const percent = total > 0 ? Math.round((score / total) * 100) : 0;

        // Cheat handling: count as present, but FAIL regardless of score
        const isCheated = attempt.status === 'cheated';
        const isPass = !isCheated && score >= passMark;

        if (isPass) passCount++; else failCount++;

        attemptedStudents.push({
          studentId: sid,
          name: sName,
          pass: isPass,
          score,
          totalMarks: total,
          percentage: percent,
          grade: gradeFromPercent(percent),
          status: attempt.status, // submitted | cheated | in_progress
          timeSpentMinutes: minutesDiff(attempt.startedAt, attempt.submittedAt) ?? (
            // fallback if submittedAt missing: duration - timeRemaining
            typeof attempt.duration === 'number' && typeof attempt.timeRemaining === 'number'
              ? Math.max(0, attempt.duration - attempt.timeRemaining)
              : null
          ),
          startedAt: attempt.startedAt || null,
          submittedAt: attempt.submittedAt || null
        });
      } else {
        // Absent (registered but no attempt record)
        absentStudents.push({
          studentId: sid,
          name: sName,
          pass: false,
          score: 0,
          totalMarks: exam.totalMarks || 0,
          percentage: 0,
          grade: "Absent",
          status: "absent",
          timeSpentMinutes: 0,
          startedAt: null,
          submittedAt: null
        });
      }
    }

    // 6) Response
    const response = {
      exam: {
        examId: String(exam._id),
        title: exam.title,
        numberOfQuestions: exam.totalQuestions ?? (exam.questions?.length || 0),
        duration: exam.duration,              // minutes
        totalMarks: exam.totalMarks || 0,
        resultPublished: exam.resultPublished,
        passMark,                             // 40% rule
      },
      counts: {
        totalRegistered: registrations.length,
        totalAbsent: absentStudents.length,   // registered but no attempt
        totalPresent: presentCount,           // registered with attempt
        totalPass: passCount,
        totalFail: failCount
      },
      attemptedStudents: attemptedStudents
        // optional: keep a consistent order (e.g., highest score first)
        .sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || '')),
      absentStudents: absentStudents
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    };

    // 7) Excel export
    if (exportExcel) {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "OES System";
      workbook.created = new Date();

      // --- Sheet 1: Exam Summary ---
      const summarySheet = workbook.addWorksheet("Exam Summary");
      summarySheet.columns = [
        { header: "Field", key: "field", width: 30 },
        { header: "Value", key: "value", width: 30 },
      ];
      summarySheet.addRows([
        { field: "Exam Title", value: response.exam.title },
        { field: "Number of Questions", value: response.exam.numberOfQuestions },
        { field: "Duration (minutes)", value: response.exam.duration },
        { field: "Total Marks", value: response.exam.totalMarks },
        { field: "Pass Mark", value: response.exam.passMark },
        { field: "Registered Students", value: response.counts.totalRegistered },
        { field: "Present", value: response.counts.totalPresent },
        { field: "Absent", value: response.counts.totalAbsent },
        { field: "Pass", value: response.counts.totalPass },
        { field: "Fail", value: response.counts.totalFail },
      ]);
      // Styling
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
      summarySheet.views = [{ state: "frozen", ySplit: 1 }];

      // --- Sheet 2: Attempted Students ---
      const attemptedSheet = workbook.addWorksheet("Attempted Students");
      attemptedSheet.columns = [
        { header: "Student Name", key: "name", width: 25 },
        { header: "Score", key: "score", width: 10 },
        { header: "Total Marks", key: "totalMarks", width: 12 },
        { header: "Percentage", key: "percentage", width: 12 },
        { header: "Grade", key: "grade", width: 8 },
        { header: "Pass", key: "pass", width: 8 },
        { header: "Status", key: "status", width: 15 },
        { header: "Time Spent (mins)", key: "timeSpentMinutes", width: 15 },
        { header: "Started At", key: "startedAt", width: 20 },
        { header: "Submitted At", key: "submittedAt", width: 20 },
      ];
      response.attemptedStudents.forEach((s) => {
        attemptedSheet.addRow({
          ...s,
          percentage: s.percentage / 100, // Excel percentage format
        });
      });
      attemptedSheet.getRow(1).font = { bold: true };
      attemptedSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB0C4DE" } };
      attemptedSheet.views = [{ state: "frozen", ySplit: 1 }];
      attemptedSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        });
      });
      attemptedSheet.getColumn("percentage").numFmt = "0%";

      // --- Sheet 3: Absent Students ---
      const absentSheet = workbook.addWorksheet("Absent Students");
      absentSheet.columns = [
        { header: "Student Name", key: "name", width: 25 },
        { header: "Status", key: "status", width: 12 },
        { header: "Score", key: "score", width: 10 },
        { header: "Total Marks", key: "totalMarks", width: 12 },
        { header: "Percentage", key: "percentage", width: 12 },
        { header: "Grade", key: "grade", width: 8 },
      ];
      response.absentStudents.forEach((s) => {
        absentSheet.addRow({
          ...s,
          percentage: s.percentage / 100,
        });
      });
      absentSheet.getRow(1).font = { bold: true };
      absentSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB0C4DE" } };
      absentSheet.views = [{ state: "frozen", ySplit: 1 }];
      absentSheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        });
      });
      absentSheet.getColumn("percentage").numFmt = "0%";

      // Send workbook
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ExamReport_${exam.title.replace(/\s+/g, "_")}.xlsx`
      );
      await workbook.xlsx.write(res);
      return res.end();
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error building report card:", err);
    return res.status(500).json({ error: "Server error while building report card" });
  }
};

// GET /api/exams/:examId/student/:studentId
const getStudentAttemptReport = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const teacherId = req.user.userId;

    // 1. Validate exam exists & belongs to this teacher
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (String(exam.createdBy) !== String(teacherId)) {
      return res.status(403).json({ error: "Not authorized to view this report" });
    }

    // 2. Find the *latest* attempt for this student
    const attempt = await StudentAttempt.findOne({ examId, studentId })
      .populate("studentId", "name email")
      .populate({
        path: "answers.questionId",
        select: "questionText options correctOptionIndex"
      })
      .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 }) // latest attempt first
      .lean();

    if (!attempt) {
      return res.status(404).json({ error: "No attempt found for this student" });
    }

    // 3. Build response object
    const passMark = Math.ceil((exam.totalMarks || 0) * 0.4); // 40% threshold

    const response = {
      exam: {
        examId: exam._id,
        title: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passMark,
        tabSwitchLimit: exam.tabSwitchLimit,
      },
      student: {
        studentId: attempt.studentId._id,
        name: attempt.studentId.name,
        email: attempt.studentId.email,
        score: attempt.score ?? 0,
        totalMarks: attempt.totalMarks ?? exam.totalMarks,
        percentage:
          (attempt.totalMarks ?? 0) > 0
            ? Math.round((attempt.score / attempt.totalMarks) * 100)
            : 0,
        pass: attempt.score >= passMark && attempt.status !== "cheated",
        grade:
          attempt.status === "cheated"
            ? "Cheated"
            : attempt.score >= passMark
            ? attempt.score / attempt.totalMarks >= 0.75
              ? "Excellent"
              : "Average"
            : "Poor",
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpentMinutes: attempt.submittedAt
          ? Math.round((attempt.submittedAt - attempt.startedAt) / 60000)
          : (typeof attempt.duration === "number" &&
             typeof attempt.timeRemaining === "number"
              ? Math.max(0, attempt.duration - attempt.timeRemaining)
              : null),
        tabSwitchCount: attempt.tabSwitchCount,
        ipAddress: attempt.ipAddress,
        deviceInfo: attempt.deviceInfo,
        answers: attempt.answers?.map((ans) => {
          const q = ans.questionId; // populated question
          return {
            questionId: q?._id || ans.questionId,
            questionText: q?.questionText || null,
            selectedOption: ans.selectedOption,
            correctOption: q?.options?.[q?.correctOptionIndex] ?? null,
            isCorrect: ans.isCorrect,
            marksObtained: ans.marksObtained,
          };
        }) ?? [],
      },
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching student attempt report:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCompletedExamsByStudent = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // 1) Find registrations for this student
    const registrations = await ExamRegistration.find({ studentId })
      .populate({
        path: "examId",
        populate: { path: "createdBy", select: "name email" }
      })
      .lean();

    // 2) Filter only exams that are completed + attempted at least once
    const completedExams = [];

    for (const reg of registrations) {
      const exam = reg.examId;
      if (!exam) continue;
      if (exam.status !== "Completed") continue;

      // Get latest attempt for this exam
      const attempt = await StudentAttempt.findOne({
        examId: exam._id,
        studentId
      })
        .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 })
        .lean();

      if (!attempt) continue; // skip if never attempted

      // Pass/Fail calculation
      const passMark = Math.ceil((exam.totalMarks || 0) * 0.4);
      const score = attempt.score ?? 0;
      const percent = exam.totalMarks > 0
        ? Math.round((score / exam.totalMarks) * 100)
        : 0;

      const grade =
        attempt.status === "cheated"
          ? "Cheated"
          : score >= passMark
          ? score / exam.totalMarks >= 0.75
            ? "Excellent"
            : "Average"
          : "Poor";

      // Build student-friendly result object
      completedExams.push({
        exam: {
          examId: exam._id,
          title: exam.title,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          createdBy: exam.createdBy?.name || "Unknown Teacher",
          completedOn: exam.endTime,
          resultPublished: exam.resultPublished
        },
        result: {
          score,
          percentage: percent,
          grade,
          pass: score >= passMark && attempt.status !== "cheated",
          status: attempt.status, // submitted, cheated, etc.
          submittedAt: attempt.submittedAt,
          timeSpentMinutes: attempt.submittedAt
            ? Math.round((attempt.submittedAt - attempt.startedAt) / 60000)
            : (typeof attempt.duration === "number" &&
               typeof attempt.timeRemaining === "number"
                ? Math.max(0, attempt.duration - attempt.timeRemaining)
                : null),
        },
        feedback: attempt.feedback || null // ✅ Optional teacher feedback
      });
    }

    // 3) Return sorted results (latest completed first)
    completedExams.sort((a, b) => new Date(b.exam.completedOn) - new Date(a.exam.completedOn));

    res.status(200).json(completedExams);
  } catch (err) {
    console.error("❌ Error fetching student completed exams:", err.message);
    res.status(500).json({ error: "Server error while fetching completed exams" });
  }
};

const publishResult = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.resultPublished = true;
    await exam.save();

    res.json({ message: "Results published", exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { 
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
  publishResult
};