import { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  InputGroup,
} from "react-bootstrap";
import SuccessNotification from "./SuccessNotification";

const QuestionFormModal = ({
  show,
  onHide,
  onSave,
  isSaving,
  successInfo,
  resetSuccessInfo,
  modules,
  initialData = null,
  isEdit = false,
  isEditable = true,
}) => {
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    imageUrl: null,
    options: ["", "", "", ""],
    answer: "",
    marks: 1,
    paperId: null,
    moduleId: null,
  });
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("question");
  const [duplicateErrors, setDuplicateErrors] = useState([]);

  // Create refs for sections
  const questionRef = useRef(null);
  const optionsRef = useRef(null);
  const settingsRef = useRef(null);

  // Reset form when modal is opened/closed or when question is successfully added
  useEffect(() => {
    if (!show || successInfo?.show) {
      setNewQuestion({
        questionText: "",
        imageUrl: null,
        options: ["", "", "", ""],
        answer: "",
        marks: 1,
        paperId: null,
        moduleId: null,
      });
      setPreview(null);
      setDuplicateErrors([]);
      setActiveTab("question");
    }
  }, [show, successInfo?.show]);

  useEffect(() => {
    if (initialData) {
      setNewQuestion({
        questionText: initialData.questionText || "",
        options: initialData.options || ["", "", "", ""],
        answer:
          typeof initialData.correctOptionIndex === "number"
            ? initialData.options[initialData.correctOptionIndex] || ""
            : "",
        marks: initialData.marks ?? 1,
        paperId: initialData.paperId || null,
        moduleId: initialData.moduleId || null,
        imageUrl: initialData.imageUrl || null, // keep existing image reference
      });
    }
  }, [initialData]);

  const handleAddQuestion = async () => {
    await onSave(newQuestion);
  };

  const addOption = () => {
    if (newQuestion.options.length < 8) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, ""],
        answer: "", // Reset answer when adding new options
      });
    }
  };

  const removeOption = (index) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
      // If removed option was the correct answer, reset the answer
      const updatedAnswer =
        newQuestion.answer === newQuestion.options[index]
          ? ""
          : newQuestion.answer;

      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
        answer: updatedAnswer,
      });
    }
  };

  const updateOptionCount = (count) => {
    const currentCount = newQuestion.options.length;

    if (count > currentCount) {
      // Add options
      const optionsToAdd = Array(count - currentCount).fill("");
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, ...optionsToAdd],
      });
    } else if (count < currentCount) {
      // Remove options from the end
      const updatedOptions = newQuestion.options.slice(0, count);
      // Check if the correct answer is being removed
      const updatedAnswer = newQuestion.options
        .slice(count)
        .includes(newQuestion.answer)
        ? ""
        : newQuestion.answer;

      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
        answer: updatedAnswer,
      });
    }
  };

  const handleTabClick = (tab, ref) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Success Notification */}
      <SuccessNotification
        successInfo={successInfo}
        onClose={resetSuccessInfo}
      />
      <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            {isEdit ? "Edit Question" : "Add New Question"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Navigation Tabs */}
          <div className="mb-4">
            <div className="d-flex border-bottom">
              <button
                className={`btn btn-link text-decoration-none px-3 py-2 ${
                  activeTab === "question"
                    ? "border-bottom border-primary border-3 text-primary fw-bold"
                    : "text-secondary"
                }`}
                onClick={() => handleTabClick("question", questionRef)}
              >
                <i className="bi bi-question-circle me-2"></i>
                Question
              </button>
              <button
                className={`btn btn-link text-decoration-none px-3 py-2 ${
                  activeTab === "options"
                    ? "border-bottom border-primary border-3 text-primary fw-bold"
                    : "text-secondary"
                }`}
                onClick={() => handleTabClick("options", optionsRef)}
              >
                <i className="bi bi-list-check me-2"></i>
                Options
              </button>
              <button
                className={`btn btn-link text-decoration-none px-3 py-2 ${
                  activeTab === "settings"
                    ? "border-bottom border-primary border-3 text-primary fw-bold"
                    : "text-secondary"
                }`}
                onClick={() => handleTabClick("settings", settingsRef)}
              >
                <i className="bi bi-gear me-2"></i>
                Settings
              </button>
            </div>
          </div>

          <Form>
            {/* Question Details - Always visible but highlighted when active */}
            <div
              ref={questionRef}
              className={activeTab !== "question" ? "opacity-75" : ""}
            >
              <h6 className="fw-bold mb-3 text-primary">
                <i className="bi bi-question-circle me-2"></i>
                Question Details
              </h6>
              {/* Module Selection - Optional */}
              {modules?.length > 0 && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Module (Optional)
                  </Form.Label>
                  <Form.Select
                    value={newQuestion.moduleId || ""}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        moduleId: e.target.value,
                      })
                    }
                    className="focus-ring"
                  >
                    <option value=" ">None</option>
                    {modules.map((module) => (
                      <option key={module._id} value={module._id}>
                        {module.name}
                      </option>
                    ))}
                  </Form.Select>

                  {/* Warning message when no module is selected */}
                  {!newQuestion.moduleId && (
                    <Form.Text className="text-warning">
                      <i className="fa fa-exclamation-triangle me-1"></i>
                      This question will not be saved under any module
                    </Form.Text>
                  )}

                  {/* Info message when a module is selected */}
                  {newQuestion.moduleId && (
                    <Form.Text className="text-info">
                      <i className="fa fa-info-circle me-1"></i>
                      This question will be saved under{" "}
                      <strong>
                        {
                          modules.find((m) => m._id === newQuestion.moduleId)
                            ?.name
                        }
                      </strong>
                    </Form.Text>
                  )}
                </Form.Group>
              )}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold d-flex justify-content-between align-items-center">
                  <span>Question Text</span>
                  <Badge bg="light" text="dark" className="fs-ms">
                    {newQuestion.questionText.length}/500
                  </Badge>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your question here..."
                  value={newQuestion.questionText}
                  onChange={(e) => {
                    setNewQuestion({
                      ...newQuestion,
                      questionText: e.target.value,
                    });
                  }}
                  maxLength={500}
                  className="focus-ring"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Attach Image (optional)
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="imageUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewQuestion({ ...newQuestion, imageFile: file });
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  {/* Upload Button (if no image at all) */}
                  {!preview && !newQuestion.imageUrl && (
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        document.getElementById("imageUpload").click()
                      }
                      className="d-flex align-items-center"
                    >
                      <i className="bi bi-cloud-upload me-2"></i> Upload Image
                    </Button>
                  )}

                  {/* Show Preview if newly uploaded */}
                  {preview && (
                    <div className="position-relative">
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                        }}
                      />
                      <button
                        type="button"
                        className="btn-close position-absolute"
                        style={{
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setNewQuestion({ ...newQuestion, imageFile: null });
                          setPreview(null);
                        }}
                      ></button>
                    </div>
                  )}

                  {/* Show Existing Image with hover + remove */}
                  {!preview && newQuestion.imageUrl && (
                    <div className="position-relative">
                      <img
                        src={`http://localhost:5000${newQuestion.imageUrl}`}
                        alt="Question illustration"
                        className="img-fluid rounded"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                        }}
                      />

                      {/* Hover Overlay for Replace */}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          document.getElementById("imageUpload").click()
                        }
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0)
                        }
                      >
                        <i className="bi bi-cloud-upload me-2"></i> Upload New
                        Image
                      </div>

                      {/* Remove Existing Image Button */}
                      <button
                        type="button"
                        className="btn-close position-absolute"
                        style={{
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setNewQuestion({ ...newQuestion, imageUrl: null });
                        }}
                      ></button>
                    </div>
                  )}
                </div>
              </Form.Group>
            </div>

            {/* Options Section */}
            <div
              ref={optionsRef}
              className={activeTab !== "options" ? "opacity-75" : ""}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-primary mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  Options
                </h6>

                {/* Option Count Selector */}
                <div className="d-flex align-items-center">
                  <span className="me-2 text-muted small">
                    Number of options:
                  </span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={newQuestion.options.length}
                    onChange={(e) =>
                      updateOptionCount(parseInt(e.target.value))
                    }
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newQuestion.options.map((opt, idx) => (
                <Form.Group className="mb-3" key={idx}>
                  <Form.Label className="fw-semibold d-flex justify-content-between align-items-center">
                    <span>
                      Option {idx + 1}
                      {duplicateErrors[idx] && (
                        <span
                          style={{
                            color: "red",
                            marginLeft: "8px",
                            fontSize: "0.9em",
                          }}
                        >
                          {duplicateErrors[idx]}
                        </span>
                      )}
                    </span>
                    {newQuestion.options.length > 2 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeOption(idx)}
                        className="py-0"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className={`cursor-pointer ${
                        newQuestion.answer === opt
                          ? "bg-success text-white"
                          : "bg-light"
                      }`}
                      onClick={() =>
                        setNewQuestion({ ...newQuestion, answer: opt })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={`Enter option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newQuestion.options];
                        const newValue = e.target.value;

                        const isDuplicate =
                          newValue &&
                          updated.some(
                            (option, optionIdx) =>
                              optionIdx !== idx && option === newValue
                          );

                        const newErrors = [...duplicateErrors];
                        newErrors[idx] = isDuplicate
                          ? "Duplicate options are not allowed"
                          : "";
                        setDuplicateErrors(newErrors);

                        updated[idx] = newValue;
                        setNewQuestion({ ...newQuestion, options: updated });
                      }}
                      className="focus-ring"
                    />
                  </InputGroup>
                </Form.Group>
              ))}

              {/* Add Option button (only show if less than max) */}
              {newQuestion.options.length < 8 && (
                <div className="mb-4">
                  <Button
                    variant="outline-success"
                    onClick={addOption}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-plus-circle me-2"></i> Add Another
                    Option
                  </Button>
                </div>
              )}
            </div>

            {/* Correct Answer & Marks - Always visible but highlighted when active */}
            <div
              ref={settingsRef}
              className={activeTab !== "settings" ? "opacity-75" : ""}
            >
              <h6 className="fw-bold mt-4 mb-3 text-primary">
                <i className="bi bi-gear me-2"></i>
                Settings
              </h6>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Correct Answer
                    </Form.Label>
                    <Form.Select
                      value={newQuestion.answer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          answer: e.target.value,
                        })
                      }
                      className="focus-ring"
                    >
                      <option value="">Select correct option</option>
                      {newQuestion.options.map((opt, idx) =>
                        opt ? (
                          <option key={idx} value={opt}>
                            {String.fromCharCode(65 + idx)}: {opt}
                          </option>
                        ) : null
                      )}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Or click on the option letter to set as correct
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Marks</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={10}
                      value={newQuestion.marks}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          marks: Number(e.target.value),
                        })
                      }
                      className="focus-ring"
                    />
                    <Form.Text className="text-muted">
                      Points awarded for correct answer (1-10)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Badge bg="light" text="dark" className="me-2">
              Options: {newQuestion.options.length}
            </Badge>
            <Badge bg="light" text="dark">
              Marks: {newQuestion.marks}
            </Badge>
          </div>
          <div>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="me-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddQuestion}
              disabled={
                isSaving ||
                !newQuestion.questionText.trim() ||
                !newQuestion.answer.trim() ||
                duplicateErrors.some((err) => err)
              }
            >
              {isSaving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save Question
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuestionFormModal;
