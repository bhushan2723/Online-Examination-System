const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: String,
    enum: ["Basic Plan", "Pro Plan", "Enterprise"],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Expired", "Cancelled"],
    default: "Active"
  },
  transactionId: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
