const StudentAttempt = require('../models/StudentAttempt');
const Exam = require('../models/Exam');
const mongoose = require("mongoose");

exports.getStudentProgress = async (req, res) => {
  try {
    const { examId, studentName, minScore } = req.query;
    const teacherId = req.user.userId;

    // Step 1: Fetch all exam IDs created by this teacher
    const teacherExams = await Exam.find({ createdBy: teacherId }).select('_id');
    const teacherExamIds = teacherExams.map(e => e._id);

    if (teacherExamIds.length === 0) {
      return res.json({ students: [] }); // No exams for this teacher
    }

    // Step 2: Find students that match filters
    let studentFilterMatch = {
      examId: { $in: teacherExamIds }
    };
    if (examId) studentFilterMatch.examId = new mongoose.Types.ObjectId(examId);

    // Build pipeline to get filtered student IDs
    const filteredStudentsPipeline = [
      { $match: studentFilterMatch },

      // Lookup student info
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      // Apply studentName filter if provided
      ...(studentName
        ? [
            {
              $match: {
                "student.name": { $regex: studentName, $options: "i" }
              }
            }
          ]
        : []),

      // Compute percentage for minScore filter
      {
        $addFields: {
          percentage: { $multiply: [{ $divide: ["$score", "$totalMarks"] }, 100] }
        }
      },

      // Apply minScore filter if provided
      ...(minScore
        ? [
            {
              $match: {
                percentage: { $gte: Number(minScore) }
              }
            }
          ]
        : []),

      // Group by student to get list of student IDs
      {
        $group: {
          _id: "$studentId",
        }
      }
    ];

    const filteredStudents = await StudentAttempt.aggregate(filteredStudentsPipeline);
    const filteredStudentIds = filteredStudents.map(s => s._id);

    if (filteredStudentIds.length === 0) {
      return res.json({ students: [] }); // No students matched
    }

    // Step 3: Get **all attempts for filtered students** under this teacher
    const allAttemptsPipeline = [
      {
        $match: {
          studentId: { $in: filteredStudentIds },
          examId: { $in: teacherExamIds }
        }
      },

      // Lookup student info
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      // Lookup exam info
      {
        $lookup: {
          from: "exams",
          localField: "examId",
          foreignField: "_id",
          as: "exam"
        }
      },
      { $unwind: "$exam" },

      // Compute percentage
      {
        $addFields: {
          percentage: { $multiply: [{ $divide: ["$score", "$totalMarks"] }, 100] }
        }
      },

      // Project exam details
      {
        $project: {
          _id: 0,
          attemptId: "$_id",
          examId: "$exam._id",
          examTitle: "$exam.title",
          studentId: "$student._id",
          studentName: "$student.name",
          score: 1,
          totalMarks: 1,
          percentage: 1,
          status: 1,
          startedAt: 1,
          submittedAt: 1,
          tabSwitchCount: 1,
          createdAt: 1
        }
      },

      // Group by student to calculate metrics
      {
        $group: {
          _id: "$studentId",
          studentName: { $first: "$studentName" },
          exams: { $push: "$$ROOT" },
          totalExamsAttempted: { $sum: 1 },
          averageScore: { $avg: "$score" },
          averagePercentage: { $avg: "$percentage" },
          totalTabSwitches: { $sum: "$tabSwitchCount" }
        }
      },

      // Add trend based on last 2 attempts
      {
        $addFields: {
          examsSorted: {
            $slice: [
              { $reverseArray: { $sortArray: { input: "$exams", sortBy: { createdAt: 1 } } } },
              2
            ]
          }
        }
      },
      {
        $addFields: {
          trend: {
            $let: {
              vars: { exams: "$examsSorted" },
              in: {
                $cond: [
                  { $lt: [{ $size: "$$exams" }, 2] },
                  "neutral",
                  {
                    $cond: [
                      { $gt: [ { $arrayElemAt: ["$$exams.percentage", 0] }, { $arrayElemAt: ["$$exams.percentage", 1] } ] },
                      "positive",
                      {
                        $cond: [
                          { $lt: [ { $arrayElemAt: ["$$exams.percentage", 0] }, { $arrayElemAt: ["$$exams.percentage", 1] } ] },
                          "negative",
                          "neutral"
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },

      // Final projection
      {
        $project: {
          studentId: "$_id",
          studentName: 1,
          exams: 1,
          totalExamsAttempted: 1,
          averageScore: 1,
          averagePercentage: { $round: ["$averagePercentage", 2] },
          averageTabSwitches: { $round: ["$totalTabSwitches", 2] },
          trend: 1
        }
      }
    ];

    const students = await StudentAttempt.aggregate(allAttemptsPipeline);

    res.json({ students });
  } catch (err) {
    console.error("❌ Progress fetch error:", err);
    res.status(500).json({ error: "Server error fetching progress" });
  }
};
