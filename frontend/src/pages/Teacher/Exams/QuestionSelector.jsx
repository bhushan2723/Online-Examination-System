import { useState } from "react";
import { Button} from "react-bootstrap";
import "./QuestionSelector.css";
import QuestionFormModal from "../Modules/QuestionBank/QuestionFormModal";
import useQuestion from '../Modules/QuestionBank/hooks/useQuestion';

const QuestionSelector = ({ modules, examQuestions, onChange }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedExam, setSelectedExam] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const {isSaving, successInfo,resetSuccessInfo, addQuestion} = useQuestion("");
  
  const handleModuleChange = async (moduleId) => {
    setSelectedModule(moduleId);
    setSelectedAvailable([]);
    try {
      const res = await fetch(`/api/modules/${moduleId}/questions`, {
          headers: {
            "x-auth-token": localStorage.getItem("token")
          }
        });
      const data = await res.json();

      if (res.ok) {
        // Filter out questions that are already in examQuestions AND are not archived
        // Using !q.isArchived will handle both false and undefined values
        const filteredQuestions = data.filter(
          (q) => !examQuestions.some((eq) => eq._id === q._id) && !q.isArchived
        );
        setAvailableQuestions(filteredQuestions);
      } else {
        setAvailableQuestions([]);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setAvailableQuestions([]);
    }
  };

  const handleAddQuestion = async (questionData) => {
    const savedQuestion = await addQuestion(questionData);    
    if (savedQuestion._id !== null) {
      // Add the newly saved question to exam questions
      onChange([...examQuestions, 
        savedQuestion]);
      return savedQuestion;
    }
    
    return null;
  };

  const moveToExam = () => {
    onChange([...examQuestions, ...selectedAvailable]);
    setAvailableQuestions(
      availableQuestions.filter((q) => !selectedAvailable.includes(q))
    );
    setSelectedAvailable([]);
  };

  const moveToAvailable = () => {

    const questionsToMove = []

    for(const q of selectedExam){
      if(q.moduleId == selectedModule){
        questionsToMove.push(q);
      }
    }
    setAvailableQuestions([...availableQuestions, ...questionsToMove]);
    onChange(examQuestions.filter((q) => !selectedExam.includes(q)));
    setSelectedExam([]);
  };

  return (
    <div className="question-selector">
      {/* Module Dropdown */}
      <label>
        Choose from existing modules:{" "}
        <select onChange={(e) => handleModuleChange(e.target.value)}>
          <option value="">Select Module</option>
          {modules.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <div className="transfer-container">
        {/* Available List */}
        <div className="list">
          <div className="questions-fixed">
            <h4 className="listbox-title">Available Questions ({availableQuestions.length})</h4>
            {/* Header Row */}
            <div className="list-header">
              <label className="question select-all">
                <input
                  type="checkbox"
                  checked={
                    availableQuestions.length > 0 &&
                    selectedAvailable.length === availableQuestions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAvailable(availableQuestions);
                    } else {
                      setSelectedAvailable([]);
                    }
                  }}
                />
                Select All ({selectedAvailable.length})
              </label>
              <span className="marks-label">Marks</span>
            </div>
          </div>
          <div className="questions-scroll">
            {availableQuestions.map((q) => (
              <div key={q.id} className="question-row">
                <label className="question">
                  <input
                    type="checkbox"
                    checked={selectedAvailable.includes(q)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAvailable([...selectedAvailable, q]);
                      } else {
                        setSelectedAvailable(
                          selectedAvailable.filter((item) => item !== q)
                        );
                      }
                    }}
                  />
                  <span className="selector-question-text">{q.questionText}</span>
                </label>
                <span className="question-marks">{q.marks}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Buttons */}
        <div className="buttons">
          <button onClick={moveToExam} disabled={selectedAvailable.length === 0}>
            →
          </button>
          <button onClick={moveToAvailable} disabled={selectedExam.length === 0}>
            ←
          </button>
        </div>

        {/* Exam List */}
        <div className="list">
          <div className="questions-fixed">
            <span className="listbox-header d-flex justify-content-between align-items-center">
              <h4 className="listbox-title mb-3 flex-grow-1 text-center ms-1">Exam Questions ({examQuestions.length})</h4>
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="p-1 me-1" // Added ms-2 for margin on the left side
                onClick={() => setShowModal(true)}
                title="Add new question"
              >
                <i className="fa fa-plus"></i>
              </Button>
            </span>
            {/* Header Row */}
            <div className="list-header">
              <label className="question select-all">
                <input
                  type="checkbox"
                  checked={
                    examQuestions.length > 0 &&
                    selectedExam.length === examQuestions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedExam(examQuestions);
                    } else {
                      setSelectedExam([]);
                    }
                  }}
                />
                Select All ({selectedExam.length})
              </label>
              <span className="marks-label">
                Marks (
                  {examQuestions.reduce((total, question) => total + (question.marks || 0), 0)}
                )
              </span>
            </div>
          </div>
          <div className="questions-scroll">
            {examQuestions.map((q) => (
              <div key={q.id} className="question-row">
                <label className="question">
                  <input
                    type="checkbox"
                    checked={selectedExam.includes(q)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExam([...selectedExam, q]);
                      } else {
                        setSelectedExam(
                          selectedExam.filter((item) => item !== q)
                        );
                      }
                    }}
                  />
                  <span className="selector-question-text">{q.questionText}</span>
                </label>
                <span className="question-marks">{q.marks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuestionFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddQuestion}
        isSaving={isSaving}
        successInfo={successInfo}
        resetSuccessInfo={resetSuccessInfo}
        modules={modules}
      />
    </div>
  );
};

export default QuestionSelector;