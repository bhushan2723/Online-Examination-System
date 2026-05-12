// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation: Teacher must upload PDF
    if (role === "Teacher" && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID PDF is required for Teacher registration.",
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is already registered' 
      });
    }

    // Check if username already exists
    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({ 
        success: false,
        message: 'Username is already taken' 
      });
    }

    // Create user (password will be hashed automatically)
    const user = new User({ 
      name, 
      email, 
      passwordHash: password, // hashed by pre-save hook
      role: role || 'Student',
      status: role === 'Teacher' ? 'Under Review' : 'Active', // optional logic
      teacherIdFile: req.file ? req.file.filename : null, // save filename
    });
    
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


// Login User
exports.loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Find user and explicitly select passwordHash
    const user = await User.findOne({ name })
      .select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // Check user status
    if (user.status === 'Under Review') {
      return res.status(403).json({
        success: false,
        message: 'Your account is under review. Please wait until verification is completed.'
      });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support for assistance.'
      });
    }

    // Only allow login if Active
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
