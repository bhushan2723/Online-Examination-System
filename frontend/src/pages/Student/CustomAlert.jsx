import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const CustomAlert = ({ config, onClose }) => {
  const { message, type = "info", autoClose = false, duration = 3, closeWindow = false } = config;
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (!autoClose) return;

    if (countdown === 0) {
      handleClose();
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, autoClose]);

  const handleClose = () => {
    onClose(closeWindow); // ✅ parent decides what to do
  };

  const typeColors = {
    success: "bg-success text-white",
    warning: "bg-warning text-dark",
    error: "bg-danger text-white",
    info: "bg-primary text-white",
  };

  return (
    <Modal show={!!message} onHide={handleClose} centered>
      <Modal.Header className={typeColors[type]}>
        <Modal.Title>
          {type === "success" && "✅ Success"}
          {type === "warning" && "⚠️ Warning"}
          {type === "error" && "❌ Error"}
          {type === "info" && "ℹ️ Info"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {autoClose && (
          <p className="text-muted small">
            Closing in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!autoClose && (
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomAlert;
