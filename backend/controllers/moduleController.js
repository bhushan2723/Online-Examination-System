const Module = require('../models/Module.js');
const Question = require('../models/Question.js');
const Exam = require('../models/Exam.js');
const logActivity = require("../middleware/activityMiddleware.js")

// GET all modules for logged-in teacher
exports.getModules = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const modules = await Module.find({ teacherId }).lean();

    const updatedModules = await Promise.all(
      modules.map(async (mod) => {
        const questions = await Question.find({ moduleId: mod._id }).select('_id');
        const questionIds = questions.map((q) => q._id);

        const examUsingQuestion = await Exam.exists({
          'questions.questionRef': { $in: questionIds },
        });

        return {
          ...mod,
          _id: mod._id.toString(),
          usedInExam: !!examUsingQuestion,
        };
      })
    );

    res.json(updatedModules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET module by ID
exports.getModuleById = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.userId;

  try {
    const module = await Module.findOne({ _id: id, teacherId });
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
};

// CREATE module
exports.createModule = async (req, res) => {
  const { name, description, color } = req.body;
  const teacherId = req.user.userId;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const module = new Module({
      name,
      description,
      teacherId,
      color,
      questionCount: 0,
    });
    const savedModule = await module.save();

    // log activity
    await logActivity({
      userId: teacherId,
      role: "Teacher",
      action: "created",
      entityType: "module",
      entityName: savedModule.name
    });

    res.status(201).json(savedModule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create module' });
  }
};

// UPDATE module (blocked if used in exam)
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const teacherId = req.user.userId;

    const questions = await Question.find({ moduleId: id }).select('_id');
    const questionIds = questions.map((q) => q._id);

    const examUsingQuestion = await Exam.exists({
      'questions.questionRef': { $in: questionIds },
    });

    if (examUsingQuestion) {
      return res.status(400).json({
        message:
          'Module cannot be edited because its questions are already used in an exam.',
      });
    }

    const updated = await Module.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // log activity
    await logActivity({
      userId: teacherId,
      role: "Teacher",
      action: "updated",
      entityType: "module",
      entityName: updated.name
    });

    res.json(updated);

    

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE single module
exports.deleteModule = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.userId;

  try {
    const deletedModule = await Module.findOneAndDelete({ _id: id, teacherId });
    if (!deletedModule)
      return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};

// DELETE multiple modules
exports.deleteModulesBulk = async (req, res) => {
  const { ids } = req.body;
  const teacherId = req.user.userId;

  if (!ids || !Array.isArray(ids))
    return res.status(400).json({ error: 'Invalid ids array' });

  try {
    const result = await Module.deleteMany({
      _id: { $in: ids },
      teacherId,
    });
    res.json({ message: `Deleted ${result.deletedCount} module(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete modules' });
  }
};

// GET questions by module
exports.getQuestionsByModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const teacherId = req.user.userId;

    const module = await Module.findOne({ _id: moduleId, teacherId });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const questions = await Question.find({ moduleId });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
};
