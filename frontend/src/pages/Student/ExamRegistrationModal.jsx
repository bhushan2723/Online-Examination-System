import { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

const ExamRegistrationModal = ({ show, handleClose, onRegister }) => {
  const [examCode, setExamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!examCode.trim()) {
      setError("Please enter a valid exam code.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch(`http://localhost:5000/api/exam-registration/${examCode}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem('token')
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed.");
      }

      const data = await response.json();

      // Success
      setSuccess("You have successfully registered for the exam!");
      setExamCode("");

      setTimeout(() => {
        handleClose();
        setSuccess("");
        if (onRegister) {
          onRegister(); // ✅ refresh list in parent
        }
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid exam code. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleCloseClick = () =>{
    setError("");
    setSuccess("");
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleCloseClick} centered>
      <Modal.Header closeButton>
        <Modal.Title>Register for an Exam</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted mb-3">
          Enter the <strong>exam code</strong> provided by your teacher or
          institution to register for the exam.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form.Group controlId="examCode">
          <Form.Label>Exam Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter exam code"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            disabled={loading}
            autoFocus
            data-cy="exam-code-input"
          />
          <Form.Text className="text-muted">
            Example: <code>CS101-MID2025</code>
          </Form.Text>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseClick} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleRegister} disabled={loading} data-cy="exam-submit">
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExamRegistrationModal;
