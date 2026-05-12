import { Button, Modal, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";

const ExamSubmissionModal = ({ show, exam, answers, onClose, onConfirm }) => {
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger' | 'warning', message: string }

  const validateAnswers = () => {
    const discrepancies = [];
    let unansweredQuestionCount = 0;
    let answeredQuestionCount = 0;
    let notAttemptedQuestionCount = 0;
    let underReviewQuestionCount = 0;

    answers.forEach((ans) => {
      if (ans.state === "review") {
        underReviewQuestionCount++;
      }
      if (ans.state === "not-attempted") {
        notAttemptedQuestionCount++;
      }
      if (ans.state === "not-answered") {
        unansweredQuestionCount++;
      }
      if (ans.state === "answered") {
        answeredQuestionCount++;
      }
    });

    if (notAttemptedQuestionCount > 0) {
      discrepancies.push(`${notAttemptedQuestionCount} question(s) not attempted.`);
    }

    if (unansweredQuestionCount > 0) {
      discrepancies.push(`${unansweredQuestionCount} question(s) unanswered.`);
    }

    if (underReviewQuestionCount > 0) {
      discrepancies.push(`${underReviewQuestionCount} question(s) marked for review.`);
    }

    return discrepancies;
  };

  // ✅ Run validation when modal opens
  useEffect(() => {
    if (show) {
      const discrepancies = validateAnswers();
      if (discrepancies.length > 0) {
        setAlert({
          type: "danger",
          message: (
            <ul style={{ marginBottom: 0 }}>
              {discrepancies.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ),
        });
      } else {
        setAlert({
          type: "success",
          message: "All questions validated. Ready for submission."
        });
      }
    }
  }, [show, answers]); // re-check if answers change while modal is open

  const onSubmit = () => {
    // 👉 You could still do final validation here if needed
    onConfirm();
    onClose(); // close after submit
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Exam Submission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && (
          <Alert
            variant={alert.type}
            onClose={() => setAlert(null)}
            dismissible
            className="mb-3"
          >
            {alert.message}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Submit Test
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExamSubmissionModal;
