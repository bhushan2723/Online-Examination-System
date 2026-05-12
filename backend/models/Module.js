const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: String,
  description: String,
  questionCount: Number,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});

moduleSchema.set('toJSON', { virtuals: true });
moduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Module', moduleSchema);
