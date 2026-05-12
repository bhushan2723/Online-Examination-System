// controllers/examRegistrationController.js
const ExamRegistration = require('../models/ExamRegistration');
const Exam = require('../models/Exam');

// Register for an exam using examCode
const registerForExam = async (req, res) => {
  try {
    const { examCode } = req.params; // examCode comes from frontend
    const studentId = req.user.userId;
    

    // Find exam by examCode
    const exam = await Exam.findOne({ examCode });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found with provided code' });
    }

    // Check if already registered
    const existingRegistration = await ExamRegistration.findOne({
      studentId,
      examId: exam._id
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this exam' });
    }

    // Create registration
    const registration = new ExamRegistration({
      studentId,
      examId: exam._id
    });

    await registration.save();
    res.status(201).json({ message: 'Registration successful', registration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get student's registered exams with limited fields + teacher name
const getMyExams = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Step 1: Find registrations
    const registrations = await ExamRegistration.find({ studentId }).select("examId");

    if (!registrations.length) {
      return res.json([]);
    }

    // Step 2: Extract examIds
    const examIds = registrations.map(r => r.examId);

    // Step 3: Query exams with selected fields & populate teacher name
    const exams = await Exam.find({ _id: { $in: examIds } })
      .select("title description createdBy startTime endTime duration totalQuestions totalMarks examCode status")
      .populate("createdBy", "name") // 👈 only get teacher name
      .sort({ createdAt: -1 });

    // Step 4: Return clean array
    res.json(exams);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all registrations for an exam (for teachers)
const getExamRegistrations = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Check if user is teacher and exam owner
    const exam = await Exam.findById(examId);
    if (exam.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const registrations = await ExamRegistration.find({ examId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student cancels their own registration
const cancelRegistrationSelf = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.userId; // logged-in student

    const registration = await ExamRegistration.findOneAndDelete({
      studentId,
      examId
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher cancels a student’s registration
const cancelRegistrationByTeacher = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    // ✅ Check ownership
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    if (exam.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel for this exam' });
    }

    const registration = await ExamRegistration.findOneAndDelete({
      studentId,
      examId
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Student registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerForExam,
  getMyExams,
  getExamRegistrations,
  cancelRegistrationSelf,
  cancelRegistrationByTeacher
};