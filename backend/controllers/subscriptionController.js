const Subscription = require("../models/Subscription");
const { v4: uuidv4 } = require("uuid");

exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.userId; // assuming you use auth middleware

    // Set duration based on plan
    let duration;
    if (plan === "Basic Plan") duration = 30;   // 30 days
    else if (plan === "Pro Plan") duration = 30; // 30 days
    else if (plan === "Enterprise") duration = 365; // 1 year
    else return res.status(400).json({ message: "Invalid plan" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // Generate dummy transaction ID
    const transactionId = "TXN-" + uuidv4().slice(0, 8).toUpperCase();

    // Check if user already has an active subscription
    let subscription = await Subscription.findOne({ user: userId });

    if (subscription) {
      // Update existing subscription
      subscription.plan = plan;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.status = "Active";
      subscription.transactionId = transactionId;

      await subscription.save();

      return res.status(200).json({
        message: "Subscription updated successfully",
        subscription,
      });
    } else {
      // Create new subscription
      subscription = new Subscription({
        user: userId,
        plan,
        startDate,
        endDate,
        status: "Active",
        transactionId,
      });

      await subscription.save();

      return res.status(201).json({
        message: "Subscription created successfully",
        subscription,
      });
    }
  } catch (err) {
    console.error("Error creating subscription:", err);
    res.status(500).json({ message: "Failed to create subscription" });
  }
};


// 👉 Get active subscription for logged-in user
exports.getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await Subscription.findOne({
      user: userId,
      status: "Active",
    }).sort({ createdAt: -1 }); // in case user has multiple, get latest

    if (!subscription) {
      return res.status(200).json({ subscription: null });
    }

    res.json({ subscription });
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
};
