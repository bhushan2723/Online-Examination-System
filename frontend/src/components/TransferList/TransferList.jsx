import { useState, useEffect } from "react";
import {Button} from "react-bootstrap";
import "./TransferList.css";
import useQuestion from "../../pages/Teacher/Modules/QuestionBank/hooks/useQuestion";
import QuestionFormModal from "../../pages/Teacher/Modules/QuestionBank/QuestionFormModal";

const TransferList = ({
  availableQuestions,
  examQuestions,
  setAvailableQuestions,
  setExamQuestions,
  activeModuleId,
  renderItem,
  leftTitle = "Available",
  rightTitle = "Exam Questions",
  getItemKey = (item) => item._id, // unique id for item
  getItemLabel = (item) => item.questionText,
  showMarks = true,
  getItemMarks = (item) => item.marks || 0,
  enableCustomQuestion = false,
  modules
}) => {
  const [checkedLeft, setCheckedLeft] = useState([]);
  const [checkedRight, setCheckedRight] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const {isSaving, successInfo, addQuestion} = useQuestion("");


  // 🔹 Reset checkboxes when availableQuestions updates OR module changes
  useEffect(() => {
    setCheckedLeft([]);
    setCheckedRight([]);
  }, [availableQuestions, activeModuleId]);

   // Get IDs of already selected questions
  const selectedIds = new Set(examQuestions.map((q) => q._id));

  // 🔹 Only items from active module should be visible in both lists
  const filteredAvailable = availableQuestions.filter(
    (q) => q.moduleId === activeModuleId && !selectedIds.has(q._id)
  );

  const filteredSelected = examQuestions;


  // Move from left → right
  const moveToRight = () => {
    const newItems = checkedLeft.filter(
      (item) => !filteredSelected.some((s) => s._id === item._id)
    );

    setExamQuestions([...examQuestions, ...newItems]);
    setAvailableQuestions(
      availableQuestions.filter((q) => !checkedLeft.some((sel) => sel._id === q._id))
    );
    setCheckedLeft([]);
  };

  // Move from right → left
  const moveToLeft = () => {
    const remainingSelected = examQuestions.filter(
      (q) => !checkedRight.some((sel) => sel._id === q._id)
    );

    const movedItems = checkedRight.filter(
      (sel) => sel.moduleId === activeModuleId
    );

    // Add items back to available
    setAvailableQuestions([...availableQuestions, ...movedItems]);

    // Update examQuestions without moved ones
    setExamQuestions(remainingSelected);
    setCheckedRight([]);
  };

  const handleAddQuestion = async (questionData) => {
    const savedQuestion = await addQuestion(questionData);

    //addQuestion does not return newly saved question id, so no id is given to new question in exam, thus cannot compare with available list
    
    if (savedQuestion) {
      // Add the newly saved question to exam questions
      setExamQuestions([...examQuestions, questionData]);
      return savedQuestion;
    }
    
    return null;
  };

  return (
    <div className="transfer-container">
      {/* Left List */}
      <div className="list">
        <div className="questions-fixed">
          <h4 className="listbox-title">
            {leftTitle} ({filteredAvailable.length})
          </h4>
          <div className="list-header">
            <label className="question select-all">
              <input
                type="checkbox"
                checked={
                  filteredAvailable.length > 0 &&
                  checkedLeft.length === filteredAvailable.length
                }
                onChange={(e) =>
                  e.target.checked
                    ? setCheckedLeft(filteredAvailable)
                    : setCheckedLeft([])
                }
              />
              Select All ({checkedLeft.length})
            </label>
            {showMarks && <span className="marks-label">Marks</span>}
          </div>
        </div>
        <div className="questions-scroll">
          {filteredAvailable.map((item) => (
            <div key={getItemKey(item)} className="question-row">
              <label className="question">
                <input
                  type="checkbox"
                  checked={checkedLeft.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCheckedLeft([...checkedLeft, item]);
                    } else {
                      setCheckedLeft(checkedLeft.filter((i) => i !== item));
                    }
                  }}
                />
                {renderItem ? renderItem(item) : getItemLabel(item)}
              </label>
              {showMarks && (
                <span className="question-marks">{getItemMarks(item)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="buttons">
        <button onClick={moveToRight} disabled={checkedLeft.length === 0}>
          →
        </button>
        <button onClick={moveToLeft} disabled={checkedRight.length === 0}>
          ←
        </button>
      </div>

      {/* Right List */}
      <div className="list">
        <div className="questions-fixed">
          <span className="listbox-header d-flex justify-content-between align-items-center">
              <h4 className="listbox-title mb-3 flex-grow-1 text-center ms-1">Exam Questions ({examQuestions.length})</h4>
              {enableCustomQuestion &&(
                <Button 
                variant="outline-secondary" 
                size="sm"
                className="p-1 me-1" // Added ms-2 for margin on the left side
                onClick={() => setShowModal(true)}
                title="Add new question"
              >
                <i className="fa fa-plus"></i>
              </Button>
              )}
            </span>
          <div className="list-header">
            <label className="question select-all">
              <input
                type="checkbox"
                checked={
                  filteredSelected.length > 0 &&
                  checkedRight.length === filteredSelected.length
                }
                onChange={(e) =>
                  e.target.checked
                    ? setCheckedRight(filteredSelected)
                    : setCheckedRight([])
                }
              />
              Select All ({checkedRight.length})
            </label>
            {showMarks && (
              <span className="marks-label">
                Marks (
                {filteredSelected.reduce((sum, q) => sum + getItemMarks(q), 0)})
              </span>
            )}

          </div>
        </div>
        <div className="questions-scroll">
          {filteredSelected.map((item) => (
            <div key={getItemKey(item)} className="question-row">
              <label className="question">
                <input
                  type="checkbox"
                  checked={checkedRight.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCheckedRight([...checkedRight, item]);
                    } else {
                      setCheckedRight(checkedRight.filter((i) => i !== item));
                    }
                  }}
                />
                {renderItem ? renderItem(item) : getItemLabel(item)}
              </label>
              {showMarks && (
                <span className="question-marks">{getItemMarks(item)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <QuestionFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddQuestion}
        isSaving={isSaving}
        successInfo={successInfo}
        modules={modules}
      />
    </div>

  );
};

export default TransferList;
