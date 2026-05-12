const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  selectedOption: String,
  isCorrect: Boolean,
  marksObtained: { 
    type: Number, 
    default: 0 
  }
});

const attemptSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  submittedAt: Date,
  score: { 
    type: Number, 
    default: 0 
  },
  totalMarks: { 
    type: Number, 
    required: true 
  },
  tabSwitchCount: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['in_progress', 'submitted', 'cheated'], 
    default: 'in_progress' 
  },
  answers: [answerSchema],
  duration: { 
    type: Number, 
    required: true 
  },
  timeRemaining: { 
    type: Number 
  },
  ipAddress: String,
  deviceInfo: {
    browser: String,
    os: String,
    deviceType: String
  }
}, { 
  timestamps: true 
});

// Index for better query performance
attemptSchema.index({ studentId: 1, examId: 1 });

module.exports = mongoose.model('StudentAttempt', attemptSchema);