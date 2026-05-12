const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["Teacher", "Student"], required: true },
  action: { type: String, required: true },      // "created", "edited", "submitted", etc.
  entityType: { type: String, required: true },  // "exam", "module", "question"
  entityName: { type: String, required: true },  // e.g., "Midterm Exam - OOP"
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", activitySchema);
