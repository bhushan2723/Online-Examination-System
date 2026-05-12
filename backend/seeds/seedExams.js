// seedExams.js
const Exam = require("../models/Exam"); // adjust path

const seedExams = async (teacherId) => {
  try {
    const exams = [
      {
        title: "Physics - CE 1",
        description: "First physics exam",
        createdBy: teacherId,
        startTime: new Date("2025-08-20T12:00:00Z"),
        endTime: new Date("2025-08-20T14:00:00Z"),
        duration: 120,
        examCode: "PHY123",
        totalQuestions: 25,
        totalMarks: 25,
      },
      {
        title: "Maths - CE 2",
        description: "Algebra & Geometry",
        createdBy: teacherId,
        startTime: new Date("2025-08-22T09:00:00Z"),
        endTime: new Date("2025-08-22T11:00:00Z"),
        duration: 120,
        examCode: "MTH456",
        totalQuestions: 30,
        totalMarks: 30,
      },
      {
        title: "Chemistry - CE 3",
        description: "Organic Chemistry basics",
        createdBy: teacherId,
        startTime: new Date("2025-08-25T10:00:00Z"),
        endTime: new Date("2025-08-25T12:00:00Z"),
        duration: 120,
        examCode: "CHE789",
        totalQuestions: 20,
        totalMarks: 20,
      },
    ];

    await Exam.deleteMany({ createdBy: teacherId }); // clean old exams if reseeding
    const inserted = await Exam.insertMany(exams);

    console.log(`✅ Seeded ${inserted.length} exams for teacher ${teacherId}`);
    return inserted;
  } catch (err) {
    console.error("❌ Error seeding exams:", err.message);
  }
};

module.exports = { seedExams };
