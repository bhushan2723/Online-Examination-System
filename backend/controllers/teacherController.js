const Exam = require('../models/Exam.js');
const StudentAttempt = require('../models/StudentAttempt.js');
const Module = require('../models/Module');
const Question = require('../models/Question');
const ExamRegistration = require('../models/ExamRegistration');
const Subscription = require('../models/Subscription');
const Activity = require("../models/Activity");
const mongoose = require('mongoose');

exports.getDashboard = async(req, res) => {
    try {
        if (req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const teacherId = req.user.userId;
        const now = new Date();

        // 1) Basic exam counts
        const totalExams = await Exam.countDocuments({ createdBy: teacherId });
        const upcomingExams = await Exam.countDocuments({
            createdBy: teacherId,
            startTime: { $gte: now },
        });

        // 2) Closest upcoming exam and students registered
        const closestUpcomingExam = await Exam.findOne({
                createdBy: teacherId,
                startTime: { $gte: now },
            })
            .sort({ startTime: 1 })
            .select('_id title startTime totalMarks examCode')
            .lean();

        let studentsRegisteredForClosestUpcomingExam = 0;
        if (closestUpcomingExam) {
            studentsRegisteredForClosestUpcomingExam = await ExamRegistration.countDocuments({
                examId: closestUpcomingExam._id,
                status: { $in: ['registered', 'attempted', 'completed'] },
            });
        }

        // 3) Pending evaluations
        const pendingEvaluations = await Exam.countDocuments({
            createdBy: teacherId,
            resultPublished: false,
            endTime: { $lt: now },
        });

        let pendingEvaluationsPercentage = 0;
        if (totalExams > 0) {
            pendingEvaluationsPercentage = Number(
                ((pendingEvaluations / totalExams) * 100).toFixed(2)
            );
        }

        // 4) Total modules
        const totalModules = await Module.countDocuments({ teacherId: teacherId });

        // 5) Total questions for all modules
        const moduleIds = await Module.find({ teacherId: teacherId }).distinct('_id');
        let totalQuestions = 0;
        if (moduleIds.length) {
            totalQuestions = await Question.countDocuments({ moduleId: { $in: moduleIds } });
        }

        // 6) Active subscription (if any)
        const hasActiveSubscription = await Subscription.exists({
            user: teacherId,
            status: 'Active',
        });

        // 7) Top 4 exams by average percentage score (only teacher's exams)
        const topExams = await StudentAttempt.aggregate([
            // Join Exam to filter only teacher's exams
            {
                $lookup: {
                    from: "exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam"
                }
            },
            { $unwind: "$exam" },
            // Filter only exams created by this teacher
            {
                $match: {
                    "exam.createdBy": new mongoose.Types.ObjectId(teacherId),
                    status: "submitted" // only submitted attempts count
                }
            },
            // Group by exam and compute average percentage
            {
                $group: {
                    _id: "$examId",
                    averageRawScore: { $avg: "$score" },
                    totalMarks: { $first: "$exam.totalMarks" },
                    title: { $first: "$exam.title" }
                }
            },
            // Calculate percentage (avgScore / totalMarks * 100)
            {
                $addFields: {
                    averagePercentage: {
                        $cond: [
                            { $gt: ["$totalMarks", 0] },
                            { $multiply: [{ $divide: ["$averageRawScore", "$totalMarks"] }, 100] },
                            0
                        ]
                    }
                }
            },
            // Sort by percentage
            { $sort: { averagePercentage: -1 } },
            // Limit top 4
            { $limit: 4 },
            // Final shape
            {
                $project: {
                    _id: 0,
                    examId: "$_id",
                    title: 1,
                    averagePercentage: { $round: ["$averagePercentage", 2] } // round to 2 decimals
                }
            }
        ]);

        // 8) Get recent activities
        const activities = await Activity.find({ userId: teacherId })
            .sort({ timestamp: -1 })
            .limit(10);

        res.json({
            teacher: { id: teacherId },
            stats: {
                totalExams,
                upcomingExams,
                closestUpcomingExam: closestUpcomingExam ?
                    {
                        id: closestUpcomingExam._id,
                        title: closestUpcomingExam.title,
                        date: closestUpcomingExam.startTime,
                        totalMarks: closestUpcomingExam.totalMarks,
                        examCode: closestUpcomingExam.examCode,
                        studentsRegistered: studentsRegisteredForClosestUpcomingExam,
                    } :
                    null,
                pendingEvaluations,
                pendingEvaluationsPercentage,
                totalModules,
                totalQuestions,
                hasActiveSubscription: !!hasActiveSubscription,
                topExamsByAverageScore: topExams
            },
            recentActivities: activities
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: err.message });
    }
};