const mongoose = require('mongoose');
const Question = require('../models/Question.js');

const seedQuestions = async (moduleId, paperId = null) => {
  if (!moduleId) throw new Error("moduleId is required to seed questions");

  const objModuleId = new mongoose.Types.ObjectId(moduleId);

  const questions = [
    {
      moduleId: objModuleId,
      paperId: paperId ? new mongoose.Types.ObjectId(paperId) : null,
      questionText: "What is the unit of force?",
      options: ["Newton", "Pascal", "Joule", "Watt"],
      correctOptionIndex: 0,
      marks: 2,
      isArchived: false
    },
    {
      moduleId: objModuleId,
      paperId: paperId ? new mongoose.Types.ObjectId(paperId) : null,
      questionText: "Acceleration due to gravity on Earth?",
      options: ["9.8 m/s²", "10 m/s²", "9.8 km/s²", "8.9 m/s²"],
      correctOptionIndex: 0,
      marks: 2,
      isArchived: false

    },
    {
      moduleId: objModuleId,
      paperId: paperId ? new mongoose.Types.ObjectId(paperId) : null,
      questionText: "Which law explains action-reaction?",
      options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Law of Conservation"],
      correctOptionIndex: 2,
      marks: 2,
      isArchived: false

    }
  ];

  await Question.deleteMany({ moduleId: objModuleId });

  const insertedQuestions = await Question.insertMany(questions);
  console.log(`Seeded ${insertedQuestions.length} questions for moduleId: ${moduleId}`);
  return insertedQuestions;
};

module.exports = { seedQuestions };
