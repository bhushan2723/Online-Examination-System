// controllers/questionController.js
const Question = require("../models/Question.js");
const Module = require("../models/Module.js");
const Exam = require("../models/Exam.js");
const logActivity = require("../middleware/activityMiddleware.js");

// GET questions by moduleId with exam usage info
const getQuestions = async (req, res) => {
  const { moduleId } = req.query;
  if (!moduleId) {
    return res.status(400).json({ message: "moduleId is required" });
  }

  try {
    const questions = await Question.find({ moduleId }).lean();

    // Get all exams that use questions from this module
    const usedQuestionIds = await Exam.distinct("questions.questionRef", {
      "questions.type": "existing"
    });

    // Attach `isUsedInExam` flag
    const questionsWithUsage = questions.map(q => ({
      ...q,
      isUsedInExam: usedQuestionIds.some(
        id => id && id.toString() === q._id.toString()
      )
    }));

    res.json(questionsWithUsage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching questions" });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!questionId) {
      return res.status(400).json({ message: "questionId is required" });
    }

    console.log("ARchiving from hereee");

    const { paperId, moduleId, questionText, options, correctOptionIndex, marks, imageUrl } = req.body;

    // Validate and parse options
    if (!options) {
      return res.status(400).json({ error: "Options field is required" });
    }

    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid options format. Must be valid JSON." });
    }

    if (!Array.isArray(parsedOptions)) {
      return res.status(400).json({ error: "Options must be an array" });
    }

    // Find existing question
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    let url = null;
    if(req.file){
      url = `/uploads/questions/${req.file.filename}`;
    } else if(imageUrl && imageUrl.trim() !== ''){
      url = imageUrl;
    }else {
      url = null;
    }

    // Build update object
    const updateData = {
      questionText,
      options: parsedOptions,
      correctOptionIndex: parseInt(correctOptionIndex) || 0,
      marks: parseInt(marks) || 1,
      paperId: paperId || null,
      moduleId: moduleId && moduleId !== "null" && moduleId !== "undefined" && moduleId !== "" ? moduleId : null,
      imageUrl: url
    };

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true }
    );

    // ✅ Log activity
    if (req.user && req.user.userId) {
      let moduleName = null;
      if (updateData.moduleId) {
        const mod = await Module.findById(updateData.moduleId).select("name");
        moduleName = mod ? mod.name : null;
      }

      await logActivity({
        userId: req.user.userId,
        role: "Teacher",
        action: "updated",
        entityType: "question",
        entityName: questionText,
        extraInfo: moduleName ? `in module "${moduleName}"` : null,
      });
    }

    res.json(updatedQuestion);
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// POST new question
const createQuestion = async (req, res) => {
  try {
    console.log("Full request body:", req.body);
    console.log("Request file:", req.file);

    const { paperId, moduleId, questionText, options, correctOptionIndex, marks } = req.body;

    // Handle different representations of null/empty values
    let validatedModuleId = null;
    if (moduleId && moduleId !== "null" && moduleId !== "undefined" && moduleId !== "") {
      validatedModuleId = moduleId;
    }

    // Check if options is provided
    if (!options) {
      return res.status(400).json({ error: "Options field is required" });
    }

    // Parse options safely
    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
    } catch (parseError) {
      console.error("Error parsing options:", parseError);
      return res.status(400).json({ error: "Invalid options format. Must be valid JSON." });
    }

    // Validate that parsedOptions is an array
    if (!Array.isArray(parsedOptions)) {
      return res.status(400).json({ error: "Options must be an array" });
    }

    parsedOptions = parsedOptions.filter(opt => opt && opt.trim() !== "");

    // Ensure at least 2 valid options remain
    if (parsedOptions.length < 2) {
      return res.status(400).json({ error: "A question must have at least 2 valid options" });
    }
    
    const question = new Question({
      paperId: paperId || null,
      moduleId: validatedModuleId,
      questionText,
      options: parsedOptions,
      correctOptionIndex: parseInt(correctOptionIndex) || 0,
      marks: parseInt(marks) || 1,
      isArchived: false,
      imageUrl: req.file ? `/uploads/questions/${req.file.filename}` : null
    });

    const saved = await question.save();

    let savedModule = null;
    if (validatedModuleId) {
      savedModule = await Module.findByIdAndUpdate(
        validatedModuleId,
        { $inc: { questionCount: 1 } },
        { new: true } // get updated module doc
      );
    }

    // Log activity
    if (req.user) {
      await logActivity({
        userId: req.user.userId,
        role: "Teacher",
        action: "added a question",
        entityType: "module",
        entityName: savedModule ? savedModule.name : "Unknown module"
      });
    }

    res.json(saved);
  } catch (err) {
    console.error("Error saving question:", err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to save question" });
  }
};

// BULK DELETE questions
const bulkDeleteQuestions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }
    await Question.deleteMany({ _id: { $in: ids } });
    // Decrement counts per module
    const moduleCounts = {};
    questions.forEach(q => {
      if (q.moduleId) {
        moduleCounts[q.moduleId] = (moduleCounts[q.moduleId] || 0) + 1;
      }
    });

    // Bulk update each module
    for (const [moduleId, count] of Object.entries(moduleCounts)) {
      await Module.findByIdAndUpdate(moduleId, { $inc: { questionCount: -count } });
    }
    res.json({ message: "Questions deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleArchiveQuestions = async (req, res) => {
  try {
    const { questionIds, archive } = req.body;

        console.log("ARchiving from hereee - proper");


    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "No questionIds provided" });
    }

    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $set: { isArchived: archive } }
    );

    res.json({
      message: `Questions ${archive ? "archived" : "unarchived"} successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch with archived filter
const getArchivedQuestions = async (req, res) => {
  try {
    const { archived } = req.query; // ?archived=true or ?archived=false
    const filter = {};

    if (archived === "true") filter.isArchived = true;
    if (archived === "false") filter.isArchived = false;

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  bulkDeleteQuestions,
  toggleArchiveQuestions,
  getArchivedQuestions,
  updateQuestion
};
