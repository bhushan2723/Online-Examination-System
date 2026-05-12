// utils/activityLogger.js
const Activity = require("../models/Activity");

const logActivity = async ({ userId, role, action, entityType, entityName }) => {
  try {
    await Activity.create({
      userId,
      role,
      action,
      entityType,
      entityName
    });
  } catch (err) {
    console.error("Error logging activity:", err.message);
  }
};

module.exports = logActivity;
