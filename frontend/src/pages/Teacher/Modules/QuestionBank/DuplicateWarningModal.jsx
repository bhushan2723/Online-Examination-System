import {
  Modal,
  Button
} from "react-bootstrap";

const DuplicateWarningModal = ({ duplicateInfo, onHide }) => {
  return (
    <Modal show={duplicateInfo.show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {duplicateInfo.message ? (
            <p>⚠️ {duplicateInfo.message}</p>
          ) : (
            <>
              <p>
                ❌ This question already exists in your bank as{" "}
                <strong>Question {duplicateInfo.questionNumber}</strong>.
              </p>
              <p>
                <strong>Existing:</strong> {duplicateInfo.existing}
              </p>
              <p>
                <strong>Your Attempt:</strong> {duplicateInfo.attempted}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              onHide({
                show: false,
                existing: null,
                attempted: null,
                questionNumber: null,
                message: null,
              })
            }
          >
            Okay, Got it
          </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default DuplicateWarningModal;