const Exam = require("../models/Exam");
const StudentAttempt = require("../models/StudentAttempt");
const ExamRegistration = require("../models/ExamRegistration");
const mongoose = require("mongoose");

exports.getDashboard = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const studentId = req.user.userId;
    const now = new Date();

    // 1) Total exams attempted
    const totalExamsAttempted = await StudentAttempt.countDocuments({
      studentId,
    });

    // 2) Upcoming exams count
    const totalUpcomingExams = await ExamRegistration.countDocuments({
      studentId,
    });

    // 3) Average score across all exams
    const avgResult = await StudentAttempt.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $project: {
          scoreNum: { $toDouble: "$score" },
          totalMarksNum: { $toDouble: "$totalMarks" },
        },
      },
      {
        $project: {
          percentage: {
            $cond: [
              { $gt: ["$totalMarksNum", 0] },
              {
                $multiply: [{ $divide: ["$scoreNum", "$totalMarksNum"] }, 100],
              },
              0,
            ],
          },
        },
      },
      { $group: { _id: null, avgPercentage: { $avg: "$percentage" } } },
    ]);
    const averageScore = avgResult.length > 0 ? avgResult[0].avgPercentage : 0;

    // 4) Pass rate
    const attempts = await StudentAttempt.find({ studentId }).populate(
      "examId",
      "title passMark totalMarks"
    );
    let passed = 0;
    for (const att of attempts) {
      const passMark = att.examId.passMark || 40; // fallback %
      const percentage = (att.score / att.totalMarks) * 100;
      if (percentage >= passMark) passed++;
    }
    const passRate =
      totalExamsAttempted > 0 ? (passed / totalExamsAttempted) * 100 : 0;

    // 5) Highest score exam
    let highestExam = null;
    if (attempts.length > 0) {
      const top = attempts
        .map((att) => ({
          title: att.examId.title,
          percentage: (att.score / att.totalMarks) * 100,
        }))
        .sort((a, b) => b.percentage - a.percentage)[0];
      highestExam = top;
    }

    // 6) Closest upcoming exam

    const upcoming = await ExamRegistration.aggregate([
      // only registrations for this student (and optionally only 'registered' status)
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          status: "registered",
        },
      },

      // join with exams collection (use actual collection name from Mongoose model)
      {
        $lookup: {
          from: Exam.collection.name, // usually 'exams'
          localField: "examId",
          foreignField: "_id",
          as: "exam",
        },
      },

      // convert exam array to object
      { $unwind: "$exam" },

      // keep only future exams
      { $match: { "exam.startTime": { $gte: now } } },

      // earliest startTime first
      { $sort: { "exam.startTime": 1 } },

      // only the closest one
      { $limit: 1 },

      // return only fields the student needs
      {
        $project: {
          _id: 0,
          registrationId: "$_id",
          registeredAt: 1,
          title: "$exam.title",
          startTime: "$exam.startTime",
          endTime: "$exam.endTime",
          duration: "$exam.duration",
          totalMarks: "$exam.totalMarks",
          examCode: "$exam.examCode",
        },
      },
    ]);

    const closestUpcomingExam =
      upcoming && upcoming.length ? upcoming[0] : null;

     // 7) Last 4 completed exams
    const lastCompletedExams = await StudentAttempt.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId), status: "submitted" } },
      {
        $lookup: {
          from: Exam.collection.name,
          localField: "examId",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      { $sort: { submittedAt: -1 } }, // latest first
      { $limit: 4 },
      {
        $project: {
          _id: 0,
          title: "$exam.title",
          percentage: {
            $cond: [
              { $gt: ["$totalMarks", 0] },
              { $multiply: [{ $divide: ["$score", "$totalMarks"] }, 100] },
              0,
            ],
          },
          score: "$score",
          totalMarks: "$totalMarks",
          submittedAt: 1,
        },
      },
    ]);

    res.json({
      stats: {
        totalExamsAttempted,
        totalUpcomingExams,
        averageScore: Number(averageScore.toFixed(2)),
        passRate: Number(passRate.toFixed(2)),
        highestExam,
        closestUpcomingExam, 
        lastCompletedExams
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: err.message });
  }
};
