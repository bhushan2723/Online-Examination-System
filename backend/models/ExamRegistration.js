const mongoose = require('mongoose');

const examRegistrationSchema = new mongoose.Schema({
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
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['registered', 'attempted', 'completed', 'absent'], 
    default: 'registered' 
  },
  attemptId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentAttempt' 
  }
}, { 
  timestamps: true 
});

// Compound index to ensure a student can only register once for an exam
examRegistrationSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('ExamRegistration', examRegistrationSchema);