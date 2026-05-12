// ExamFilterPane.js
import React, { useState, useRef } from "react";
import useClickOutside from "../Modules/QuestionBank/hooks/useClickOutside";
import { Form, InputGroup, Button } from "react-bootstrap";

const ResultViewFilterPane = ({ onApply, onClose }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minMarks, setMinMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [status, setStatus] = useState("");

  const filterPaneRef = useRef();
  useClickOutside(filterPaneRef, onClose);

  const handleApply = () => {
    const filters = {
      title,
      startDate: startDate || null,
      endDate: endDate || null,
      minMarks: minMarks ? parseInt(minMarks, 10) : null,
      maxMarks: maxMarks ? parseInt(maxMarks, 10) : null,
      status: status || null,
    };
    onApply(filters);
  };

  const handleCancel = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setMinMarks("");
    setMaxMarks("");
    setStatus("");
    onClose();
  };

  return (
    <div className="filter-pane" ref={filterPaneRef}>
      <div className="filter-pane-content">
        {/* Title Search */}
        <div className="mb-3">
          <h6 className="mb-2 fw-bold">Exam Title</h6>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search exam title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>
        </div>

        {/* Date Filters */}
        <div className="mb-3">
          <h6 className="mb-2 fw-bold">Exam Date</h6>
          <div className="d-flex gap-2">
            <Form.Group className="flex-fill">
              <Form.Label className="small">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="flex-fill">
              <Form.Label className="small">End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </div>
        </div>

        {/* Marks Filter */}
        <div className="mb-3">
          <h6 className="mb-2 fw-bold">Marks Range</h6>
          <InputGroup>
            <Form.Control
              type="number"
              placeholder="Min"
              value={minMarks}
              onChange={(e) => setMinMarks(e.target.value)}
              min="0"
            />
            <InputGroup.Text>-</InputGroup.Text>
            <Form.Control
              type="number"
              placeholder="Max"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              min="0"
            />
          </InputGroup>
        </div>

        {/* Status Dropdown */}
        <div className="mb-3">
          <h6 className="mb-2 fw-bold">Status</h6>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultViewFilterPane;
