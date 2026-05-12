const express = require("express");
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  bulkDeleteQuestions,
  toggleArchiveQuestions,
  getArchivedQuestions,
  updateQuestion
} = require("../controllers/questionController.js");
const upload = require("../middleware/uploadMiddleware.js");
const auth = require("../middleware/authMiddleware.js"); // <-- import here

// Archive management
router.put("/archive-toggle", auth, toggleArchiveQuestions);
router.get("/archived", auth, getArchivedQuestions);

// Basic
router.get("/", auth, getQuestions); // ?moduleId=xxx
router.post("/", auth, upload.single("image"), createQuestion); 
router.put("/:questionId", auth, upload.single("image"), updateQuestion); 
router.delete("/bulk", auth, bulkDeleteQuestions);



module.exports = router;
