import { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const ExamDetailsModal = ({
  show,
  handleClose,
  exam,
  onStartExam,
  onShowInsights,
  onUnregisterSuccess,
}) => {
  const [confirmUnregister, setConfirmUnregister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // track attempt check
  const [checkingAttempt, setCheckingAttempt] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(null); // null = not checked yet

  // 🔎 Fetch attempt status whenever modal opens
  useEffect(() => {
    const fetchAttemptStatus = async () => {
      if (!show || !exam) {
        setHasAttempted(null); // reset when modal closed
        return;
      }

      setCheckingAttempt(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/attempt/check/${exam.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        if (!res.ok) throw new Error("Failed to check attempt status");
        const data = await res.json();
        setHasAttempted(data.attempted);
      } catch (err) {
        setError(err.message);
      } finally {
        setCheckingAttempt(false);
      }
    };

    fetchAttemptStatus();
  }, [show, exam?.id, exam?.status]);

  if (!exam) return null;
  const { title, description, status, id } = exam;

  // 🔎 Unregister
  const unRegister = async (examId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/exam-registration/${examId}/cancel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to unregister from exam");
      }

      if (onUnregisterSuccess) {
        onUnregisterSuccess();
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Footer buttons
  const renderFooter = () => {
    if (checkingAttempt) {
      return (
        <div className="d-flex justify-content-center w-100">
          <Spinner animation="border" size="sm" /> Checking attempt...
        </div>
      );
    }

    // In Progress but already attempted
    if (status === "In Progress" && hasAttempted) {
      return (
        <div className="w-100 d-flex justify-content-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      );
    }

    // Completed but not attempted → Absent
    if (status === "Completed" && hasAttempted === false) {
      return (
        <div className="w-100 d-flex justify-content-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      );
    }

    if (status === "Upcoming") {
      const now = new Date();
      const startTime = exam.startTime ? new Date(exam.startTime) : null;
      const canStart = startTime && now >= startTime;

      if (confirmUnregister) {
        return (
          <div className="d-flex justify-content-between w-100 align-items-center">
            <span className="text-danger fw-semibold">
              Are you sure you want to unregister?
            </span>
            <div className="d-flex flex-row align-items-center">
              <Button
                variant="outline-secondary"
                onClick={() => setConfirmUnregister(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="ms-2"
                onClick={() => {
                  unRegister(id);
                  setConfirmUnregister(false);
                }}
                disabled={loading}
              >
                {loading ? "Unregistering..." : "Yes, Unregister"}
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="d-flex w-100 justify-content-between align-items-start">
          {/* Left buttons */}
          <div className="d-flex">
            <Button
              variant="outline-danger"
              onClick={() => setConfirmUnregister(true)}
            >
              Unregister
            </Button>
            <Button variant="secondary" className="ms-2" onClick={handleClose}>
              Close
            </Button>
          </div>

          {/* Right start button */}
          <div className="d-flex flex-column align-items-end">
            <Button
              variant={canStart ? "primary" : "outline-secondary"}
              disabled={!canStart}
              className={!canStart ? "opacity-75 fw-semibold" : ""}
              onClick={() => canStart && onStartExam?.(id)}
            >
              {canStart ? "Start" : "Not Available"}
            </Button>
            {!canStart && (
              <small className="text-muted mt-1">
                Starts at {startTime?.toLocaleString() || "N/A"}
              </small>
            )}
          </div>
        </div>
      );
    }

    if (status === "In Progress") {
      return (
        <div className="d-flex justify-content-between w-100">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onStartExam?.(exam, true)}>
            Start
          </Button>
        </div>
      );
    }

    if (status === "Completed" || status === "Cancelled") {
      return (
        <div className="d-flex justify-content-between w-100">
          <Button variant="primary" onClick={() => onShowInsights?.(id)}>
            Show Insights
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      );
    }

    return (
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}

        {checkingAttempt && <p>Checking your attempt status...</p>}

        {status === "In Progress" && hasAttempted && (
          <p className="text-danger fw-semibold">
            You have already attempted this exam. You cannot retake it.
          </p>
        )}

        {status === "Completed" && hasAttempted === false && (
          <p className="text-danger fw-semibold">
            You were marked <u>Absent</u> for this exam.
          </p>
        )}

        {status === "In Progress" && hasAttempted === false && (
          <p className="text-warning fw-semibold">
            This exam is currently in progress.
          </p>
        )}

        {(status === "Upcoming" ||
          status === "Completed" ||
          status === "Cancelled") &&
          (description || "No description available for this exam.")}
      </Modal.Body>

      <Modal.Footer>{renderFooter()}</Modal.Footer>
    </Modal>
  );
};

export default ExamDetailsModal;
