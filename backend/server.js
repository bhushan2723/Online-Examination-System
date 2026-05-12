const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const Exam = require('./models/Exam.js');
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const moduleRoutes = require('./routes/moduleRoutes.js');
const questionRoutes = require("./routes/questionRoutes.js");
const examRoutes = require('./routes/examRoutes.js');
const examRegistrationRoutes = require('./routes/examRegistrationRoutes.js');
const templateRoutes = require('./routes/templateRoutes.js');
const studentAttemptRoutes = require('./routes/studentAttemptRoutes.js');
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const progressRoutes = require("./routes/progressRoutes");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true
};

app.use(cors(corsOptions));


// API Routes
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/modules', moduleRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-registration", examRegistrationRoutes);
app.use("/api/attempt", studentAttemptRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/uploads", express.static("uploads"));



// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Serve static files from React
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Serve teacher ID PDFs
app.use("/uploads/teacherIds", express.static(path.join(__dirname, "uploads/teacherIds")));

// IMPORTANT: Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// 🔹 CRON JOB - Run every 1 minute to update exam statuses
cron.schedule('* * * * *', async () => {
  try {
    await Exam.updateAllStatuses();
    console.log("✅ Exam statuses updated");
  } catch (err) {
    console.error("❌ Error updating exam statuses:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));