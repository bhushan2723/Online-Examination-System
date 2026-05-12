// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const { createSubscription, getActiveSubscription } = require("../controllers/subscriptionController");
const auth = require("../middleware/authMiddleware"); // if you have auth middleware

router.post("/", auth, createSubscription);

// Get active subscription for logged-in user
router.get("/me", auth, getActiveSubscription);

module.exports = router;
