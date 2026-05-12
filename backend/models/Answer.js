const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAttempt', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
