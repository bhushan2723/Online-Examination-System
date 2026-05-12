import { Card, Badge } from "react-bootstrap";
import { useState } from "react";
import QuestionFormModal from "./QuestionFormModal";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";

const QuestionDetailRow = ({
  question,
  index,
  addQuestion,
  showEdit = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleEdit = () => {
    setShowModal(true);
  };

  const saveChanges = async (data) => {
    return await addQuestion({
      ...data, // keep all existing fields in `data`
      questionId: question._id, // add the questionId
    });
  };

  return (
    <>
      <tr>
        <td colSpan="5" className="p-0">
          <div className="p-3 bg-light">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex flex-row gap-3 justify-content-center align-items-center">
                    <h6 className="fw-bold mb-0">Q{index + 1}</h6>
                    {showEdit &&
                      (question.isUsedInExam ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-disabled">
                              Locked — already used in an exam
                            </Tooltip>
                          }
                        >
                          <span className="d-inline-block">
                            <Button disabled style={{ pointerEvents: "none" }}>
                              Edit
                            </Button>
                          </span>
                        </OverlayTrigger>
                      ) : (
                        <Button onClick={handleEdit}>Edit</Button>
                      ))}
                  </div>
                  {question.imageUrl && <Badge bg="secondary">Has Image</Badge>}
                </div>
                <p className="mb-3">{question.questionText}</p>
                {question.imageUrl && (
                  <img
                    src={`http://localhost:5000${question.imageUrl}`}
                    className="img-fluid rounded mb-3"
                    alt="Question illustration"
                    style={{
                      maxHeight: "200px",
                      width: "300px",
                      objectFit: "cover",
                    }}
                  />
                )}
                <h6>Options:</h6>
                <ul>
                  {question.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={
                        question.correctOptionIndex === idx
                          ? "fw-bold text-success"
                          : ""
                      }
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </div>
        </td>
      </tr>

      {showModal && (
        <QuestionFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={saveChanges}
          initialData={question}
          isEdit={true}
          isEditable={!question.isUsedInExam}
        />
      )}
    </>
  );
};

export default QuestionDetailRow;
