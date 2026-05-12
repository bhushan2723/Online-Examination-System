// FilterPane.js
import React, { useState, useRef } from 'react';
import useClickOutside from './hooks/useClickOutside';
import { Form, InputGroup, Button, ButtonGroup } from 'react-bootstrap';

const FilterPane = ({ onApply, onClose, questions }) => {
  const [searchText, setSearchText] = useState('');
  const [minMarks, setMinMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const filterPaneRef = useRef();
  const [questionStatus, setQuestionStatus] = useState('active'); // 'active' or 'archived'

  useClickOutside(filterPaneRef, onClose);


  const handleApply = () => {
    const filters = {
      searchText,
      minMarks: minMarks ? parseInt(minMarks) : null,
      maxMarks: maxMarks ? parseInt(maxMarks) : null,
      questionStatus // Add this instead of showArchived
    };
    onApply(filters);
  };

  const handleCancel = () => {
    // Reset filters when canceling
    setSearchText('');
    setMinMarks('');
    setMaxMarks('');
    setQuestionStatus('active');
    onClose();
  };

  return (
    <div className="filter-pane" ref={filterPaneRef}>
      <div className="filter-pane-content">
        {/* Search Section */}
        <div className="mb-3">
          <h6 className="mb-2 fw-bold">Search</h6>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search questions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Group>
        </div>

        {/* Filter Section */}
        <div>
          <h6 className="mb-2 fw-bold">Filter by:</h6>
          
          {/* Marks Filter */}
          <Form.Group className="mb-3">
            <Form.Label>Marks Range</Form.Label>
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
          </Form.Group>

          {/* Question Status Filter - Updated */}
          <Form.Group className="mb-3">
            <Form.Label>Question Status</Form.Label>
            <div>
              <ButtonGroup>
                <Button
                  variant={questionStatus === 'active' ? 'primary' : 'outline-primary'}
                  onClick={() => setQuestionStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={questionStatus === 'archived' ? 'primary' : 'outline-primary'}
                  onClick={() => setQuestionStatus('archived')}
                >
                  Archived
                </Button>
              </ButtonGroup>
            </div>
          </Form.Group>
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

export default FilterPane;