import { useState, useEffect } from "react";
import QuestionSelector from "./QuestionSelector";
import StudentTab from "./StudentTab";
import "./ExamForm.css";
import { Button } from "react-bootstrap";


const ExamForm = ({ onBack, examToEdit = null }) => {
  const isEditMode = !!examToEdit;
  
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    tabSwitchLimit: 3,
    examCode: "",
    selectedQuestions: [],
  });

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // "details", "questions", "settings"
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/modules", {
          headers: {
            "x-auth-token": token
          }
        });
        if (!res.ok) throw new Error("Failed to fetch modules");
        const data = await res.json();
        setModules(data);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Load exam data if in edit mode
  useEffect(() => {
    if (examToEdit) {
      setExamData({
        title: examToEdit.title || "",
        description: examToEdit.description || "",
        duration: examToEdit.duration || 60,
        totalMarks: examToEdit.totalMarks || 100,
        startTime: examToEdit.startTime ? new Date(examToEdit.startTime).toISOString().slice(0, 16) : "",
        endTime: examToEdit.endTime ? new Date(examToEdit.endTime).toISOString().slice(0, 16) : "",
        maxAttempts: examToEdit.maxAttempts || 1,
        tabSwitchLimit: examToEdit.tabSwitchLimit || 3,
        examCode: examToEdit.examCode || "",
        selectedQuestions: examToEdit.questions 
          ? examToEdit.questions.filter(q => q.type === "existing").map(q => q.questionRef)
          : [],
      });
    }
  }, [examToEdit]);

  const validateForm = () => {
    const errors = {};
    
    if (!examData.title.trim()) errors.title = "Exam title is required";
    if (examData.duration < 1) errors.duration = "Duration must be at least 1 minute";
    if (!examData.startTime) errors.startTime = "Start time is required";
    if (!examData.endTime) errors.endTime = "End time is required";
    if (new Date(examData.startTime) >= new Date(examData.endTime)) {
      errors.endTime = "End time must be after start time";
    }
    if (examData.maxAttempts < 1) errors.maxAttempts = "Max attempts must be at least 1";
    if (examData.tabSwitchLimit < 0) errors.tabSwitchLimit = "Tab switch limit cannot be negative";
    
    // Validate that at least one question is selected
    if (examData.selectedQuestions.length === 0) {
      errors.questions = "At least one question is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setExamData((prev) => {
    const updatedData = { ...prev, [name]: value };

    // Auto-calculate duration if startTime or endTime changes
    if (name === "startTime" || name === "endTime") {
      if (updatedData.startTime && updatedData.endTime) {
        const start = new Date(updatedData.startTime);
        const end = new Date(updatedData.endTime);
        const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60))); // in minutes
        updatedData.duration = diffMinutes;
      }
    }

    return updatedData;
  });

  // Clear validation error for this field
  if (validationErrors[name]) {
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
  }
};


  const handleQuestionsChange = (questions) => {
    setExamData((prev) => ({ ...prev, selectedQuestions: questions }));
  };

  const generateExamCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setExamData(prev => ({ ...prev, examCode: code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab("details");
      return;
    }
    
    try {
      // Calculate total marks and questions from selected questions
      const totalMarks = examData.selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
      const totalQuestions = examData.selectedQuestions.length;
      
      const examPayload = {
        title: examData.title,
        description: examData.description,
        duration: parseInt(examData.duration),
        startTime: examData.startTime,
        endTime: examData.endTime,
        maxAttempts: parseInt(examData.maxAttempts),
        tabSwitchLimit: parseInt(examData.tabSwitchLimit),
        examCode: examData.examCode || undefined,
        totalMarks,
        totalQuestions,
        questions: examData.selectedQuestions.map(q => ({
          type: "existing",
          questionRef: q._id
        }))
      };
            
      const url = isEditMode 
        ? `http://localhost:5000/api/exams/${examToEdit._id}`
        : "http://localhost:5000/api/exams";
      
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token")
        },
        body: JSON.stringify(examPayload)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to ${isEditMode ? 'update' : 'create'} exam`);
      }
      
      setSuccessMessage(`Exam ${isEditMode ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        onBack(); // Go back to previous page
      }, 2000);
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setExamData({
          title: "",
          description: "",
          duration: 60,
          totalMarks: 100,
          startTime: "",
          endTime: "",
          maxAttempts: 1,
          tabSwitchLimit: 3,
          examCode: "",
          selectedQuestions: [],
        });
      }
      
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} exam:`, err);
      alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} exam. Please try again.`);
    }
  };

  return (
    <div className="container py-4 px-4 exam-form-container" style={{overflow:"auto"}}>
      {successMessage && (
        <div className="alert alert-success exam-success-alert alert-dismissible fade show">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
        </div>
      )}
      <div className="d-flex align-items-center mb-4" style={{gap:'12px'}}>
        <Button variant="outline-secondary" onClick={onBack} className='d-flex justify-contents-center align-items-center'>
          <i className="fa fa-caret-left"></i> Back
        </Button>
        <h1 className="h3 m-0">{isEditMode ? "Edit Exam" : "Create Exam"}</h1>
      </div>

      {loading && <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-3 exam-form-tabs">
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                <i className="fa fa-info-circle me-2"></i>Exam Details
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
                onClick={() => setActiveTab("questions")}
              >
                <i className="fa fa-question-circle me-2"></i>Questions
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                <i className="fa fa-cog me-2"></i>Settings
              </button>
            </li>
            {
              isEditMode && (
                <li className="nav-item">
                  <button 
                    type="button"
                    className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                    onClick={() => setActiveTab("students")}
                  >
                    <i className="fa fa-users me-2"></i>Students
                  </button>
                </li>
              )
            }
          </ul>

          {/* Exam Details Tab */}
          {activeTab === "details" && (
            <div className="card p-4 shadow-sm mb-3 exam-form-card">
              <h5 className="fw-bold mb-2">Exam Information</h5>
              
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label fw-semibold">Exam Title *</label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.title ? "is-invalid" : ""}`}
                    name="title"
                    value={examData.title}
                    onChange={handleChange}
                    placeholder="Enter exam title"
                    required
                  />
                  {validationErrors.title && <div className="invalid-feedback">{validationErrors.title}</div>}
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={examData.description}
                    onChange={handleChange}
                    placeholder="Enter exam description"
                    rows="3"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Start Time *</label>
                  <input
                    type="datetime-local"
                    className={`form-control ${validationErrors.startTime ? "is-invalid" : ""}`}
                    name="startTime"
                    value={examData.startTime}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.startTime && <div className="invalid-feedback">{validationErrors.startTime}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">End Time *</label>
                  <input
                    type="datetime-local"
                    className={`form-control ${validationErrors.endTime ? "is-invalid" : ""}`}
                    name="endTime"
                    value={examData.endTime}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.endTime && <div className="invalid-feedback">{validationErrors.endTime}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Duration (minutes) *</label>
                  <input
                    type="number"
                    className={`form-control ${validationErrors.duration ? "is-invalid" : ""}`}
                    name="duration"
                    value={examData.duration}
                    onChange={handleChange}
                    min="1"
                    readOnly
                    required
                  />
                  {validationErrors.duration ? <div className="invalid-feedback">{validationErrors.duration}</div> : <div className="form-text">Auto-calculated from start and end time</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Total Marks *</label>
                  <input
                    type="number"
                    className={`form-control ${validationErrors.totalMarks ? "is-invalid" : ""}`}
                    name="totalMarks"
                    value={examData.totalMarks}
                    onChange={handleChange}
                    min="1"
                    required
                    readOnly={isEditMode} // Total marks is calculated from questions in edit mode
                  />
                  {isEditMode && (
                    <div className="form-text">Total marks is calculated from selected questions</div>
                  )}
                  {validationErrors.totalMarks && <div className="invalid-feedback">{validationErrors.totalMarks}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="card p-4 shadow-sm mb-3 exam-form-card">
              <h5 className="fw-bold mb-4">Select Questions</h5>
              {/* Question validation error */}
              {validationErrors.questions && (
                <div className="alert alert-danger">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  {validationErrors.questions}
                </div>
              )}
              <div className="alert alert-info">
                <i className="fa fa-info-circle me-2"></i>
                Select questions from your question bank. The exam will automatically calculate total marks based on selected questions.
              </div>
              <QuestionSelector 
                onChange={handleQuestionsChange} 
                modules={modules} 
                examQuestions={examData?.selectedQuestions}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="card p-4 shadow-sm mb-3 exam-form-card">
              <h5 className="fw-bold mb-4">Exam Settings</h5>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Max Attempts</label>
                  <input
                    type="number"
                    className={`form-control ${validationErrors.maxAttempts ? "is-invalid" : ""}`}
                    name="maxAttempts"
                    value={examData.maxAttempts}
                    onChange={handleChange}
                    min="1"
                  />
                  {validationErrors.maxAttempts && <div className="invalid-feedback">{validationErrors.maxAttempts}</div>}
                  <div className="form-text">Number of times a student can attempt this exam (default: 1)</div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Tab Switch Limit</label>
                  <input
                    type="number"
                    className={`form-control ${validationErrors.tabSwitchLimit ? "is-invalid" : ""}`}
                    name="tabSwitchLimit"
                    value={examData.tabSwitchLimit}
                    onChange={handleChange}
                    min="0"
                  />
                  {validationErrors.tabSwitchLimit && <div className="invalid-feedback">{validationErrors.tabSwitchLimit}</div>}
                  <div className="form-text">Number of times students can switch tabs during exam (0 = no switching allowed)</div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Exam Code</label>
                  <div className="input-group exam-code-group">
                    <input
                      type="text"
                      className="form-control"
                      name="examCode"
                      value={examData.examCode}
                      onChange={handleChange}
                      placeholder="Unique exam code"
                      readOnly={isEditMode} // Exam code should not be changed in edit mode
                    />
                    {!isEditMode && (
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={generateExamCode}
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  <div className="form-text">
                    {isEditMode 
                      ? "Exam code cannot be changed after creation" 
                      : "Unique code for students to join the exam (auto-generated if empty)"
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {
            activeTab == "students" && (
              <div className="card p-4 shadow-sm mb-3 h-100 exam-form-card">
                <h5 className="fw-bold mb-4">Registered Students</h5>
                <StudentTab selectedExam={examToEdit} />
              </div>
            )
          }

          {/* Navigation and Submit Buttons */}
          <div className="d-flex justify-content-between mt-2 mb-1">
            <div className="mb-3">
              {activeTab === "questions" && (
                <button 
                  type="button" 
                  className="btn btn-outline-primary me-2"
                  onClick={() => setActiveTab("details")}
                >
                  <i className="fa fa-arrow-left me-2"></i>Back to Details
                </button>
              )}
              {activeTab === "settings" && (
                <button 
                  type="button" 
                  className="btn btn-outline-primary me-2"
                  onClick={() => setActiveTab("questions")}
                >
                  <i className="fa fa-arrow-left me-2"></i>Back to Questions
                </button>
              )}
            </div>
            
            <div>
              {activeTab === "details" && (
                <button 
                  type="button" 
                  className="btn btn-primary me-2"
                  onClick={() => setActiveTab("questions")}
                >
                  Next: Questions <i className="fa fa-arrow-right ms-2"></i>
                </button>
              )}
              {activeTab === "questions" && (
                <button 
                  type="button" 
                  className="btn btn-primary me-2"
                  onClick={() => setActiveTab("settings")}
                >
                  Next: Settings <i className="fa fa-arrow-right ms-2"></i>
                </button>
              )}
              {activeTab === "settings" && (
                <button type="submit" className="btn btn-success">
                  <i className="fa fa-check me-2"></i>
                  {isEditMode ? "Update Exam" : "Create Exam"}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ExamForm;