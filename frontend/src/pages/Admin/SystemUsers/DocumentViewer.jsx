import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function DocumentViewer({ path }) {
  const [show, setShow] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  if (!path) return null; // if no file, render nothing

  return (
    <>
      {/* View Button */}
      <Button variant="secondary" size="sm" onClick={handleOpen}>
        View
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Teacher ID</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <iframe
            src={path}
            title="Teacher ID PDF"
            style={{ width: "100%", height: "100%" }}
            frameBorder="0"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
