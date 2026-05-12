import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RejectModal = ({ show, onClose, onSubmit, userName }) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason(""); // Reset input 
    onClose();
  };

  const handleSubmit = () => {
    if (!reason.trim()) return; // Require reason
    onSubmit(reason);
    setReason(""); // Reset input after submit
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reject {userName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Reason for rejection</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleSubmit}>
          Reject
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejectModal;
