import { Modal, Button } from "react-bootstrap";
import { Clipboard, User, Calendar, Clock, Hash, BookOpen } from "lucide-react";
import './ExamDetailsModal.css';

const ExamDetailsModal = ({ show, exam, onClose }) => {
  if (!exam) return null;
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);

  // ✅ Format dates
  const startDateStr = start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const endDateStr = end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const dateRange = (startDateStr === endDateStr)
    ? startDateStr
    : `${startDateStr} - ${endDateStr}`;

  // ✅ Format times
  const startTimeStr = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTimeStr = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const timeRange = `${startTimeStr} - ${endTimeStr}`;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered className="exam-details-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <BookOpen size={22} /> Exam Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Title and Description */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">Title</h5>
          <p className="text-muted fs-6">{exam.title || "—"}</p>

          <h5 className="fw-bold mt-3 mb-1">Description</h5>
          <p className="text-muted fs-6">{exam.description || "—"}</p>
        </div>

        {/* Info grid */}
        <div className="row g-3">
          {[
            { icon: Clipboard, label: "Exam Code", value: exam.examCode },
            { icon: User, label: "Created By", value: exam.createdBy?.name || "N/A" },
            { icon: Hash, label: "Total Questions", value: exam.totalQuestions },
            { icon: Hash, label: "Total Marks", value: exam.totalMarks },
            { icon: Calendar, label: "Date", value: dateRange },
            { icon: Clock, label: "Time", value: timeRange },
          ].map((item, idx) => (
            <div key={idx} className="col-md-6">
              <div className="info-card p-3 d-flex align-items-center gap-2">
                <item.icon size={18} className="text-primary" />
                <div>
                  <span className="fw-bold">{item.label}:</span>{" "}
                  <span className="text-muted">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExamDetailsModal;
