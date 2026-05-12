// controllers/userController.js
const User = require('../models/User');

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new user
const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const newUser = new User({
      name,
      email,
      passwordHash: password,
      role
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Approve teacher
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'Active';
    user.rejectionReason = null;
    await user.save();

    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject teacher
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'Rejected';
    user.rejectionReason = reason || 'No reason provided';
    await user.save();

    res.json({ message: 'User rejected successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend teacher
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "Under Review";
    await user.save();

    res.json({ message: "User suspended successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reconsider teacher (Rejected → Under Review)
const reconsiderUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status !== "Rejected") {
      return res.status(400).json({ message: "Only rejected users can be reconsidered" });
    }

    user.status = "Under Review";
    user.rejectionReason = null;
    await user.save();

    res.json({ message: "User moved back to Under Review", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { getUsers, addUser, approveUser, rejectUser, suspendUser, reconsiderUser };
