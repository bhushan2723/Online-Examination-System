// QuestionBank.js
import React, { useState, useMemo, useRef } from 'react';
import { Button } from "react-bootstrap";
import QuestionTable from './QuestionTable';
import QuestionFormModal from './QuestionFormModal';
import DuplicateWarningModal from './DuplicateWarningModal';
import SuccessNotification from './SuccessNotification';
import FilterPane from './FilterPane';
import ImportModal from './ImportModal';
import useQuestion from './hooks/useQuestion';
import ArchiveButton from './ArchiveButton';
import './QuestionBank.css';

export default function QuestionBank({ selectedModule, onBack }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilterPane, setShowFilterPane] = useState(false); 
  const [filters, setFilters] = useState({});
  const [archiveState, setArchiveState] = useState(false);
  const filterButtonRef = useRef(null);

  // For Excel import

  const { 
    questions, 
    loading, 
    error, 
    isSaving,
    duplicateInfo,  
    successInfo,
    toggleArchiveQuestions,
    addQuestion, 
    deleteQuestions,
    resetDuplicateInfo, 
    resetSuccessInfo
  } = useQuestion(selectedModule?._id);
  
  // Filter questions based on applied filters
  const filteredQuestions = useMemo(() => {
    // Default: show only active questions when no filters are applied
    if (!filters || Object.keys(filters).length === 0) {
      return questions.filter(q => !q.isArchived);
    }
    
    return questions.filter(question => {
      // Filter by search text
      if (filters.searchText && !question.questionText.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }
      
      // Filter by marks range
      if (filters.minMarks !== null && question.marks < filters.minMarks) {
        return false;
      }
      
      if (filters.maxMarks !== null && question.marks > filters.maxMarks) {
        return false;
      }
      
      // Filter by question status (either archived or active, not both)
      if (filters.questionStatus === 'active' && question.isArchived) {
        return false;
      }
      
      if (filters.questionStatus === 'archived' && !question.isArchived) {
        return false;
      }
      
      return true;
    });
  }, [questions, filters]);

  const toggleSelectQuestion = (questionId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedQuestionIds.length === 0) return;
    const success = await deleteQuestions(selectedQuestionIds);
    if (success) {
      setSelectedQuestionIds([]);
    }
  };

  const handleAddQuestion = async (questionData) => {
    return await addQuestion(questionData);
  };

  // Handle applying filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setArchiveState(newFilters.questionStatus == 'active' ? false : true)
    setShowFilterPane(false);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setArchiveState(false)
    setFilters({});
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Loading questions...</p>
    </div>
  </div>;
  
  if (error) return <div className="alert alert-danger m-4">Error: {error}</div>;

  return (
    <div className="h-100 d-flex flex-column">
      {/* Success Notification */}
      <SuccessNotification 
        successInfo={successInfo} 
        onClose={resetSuccessInfo} 
      />
      
      {/* Header and controls */}
      <div className="header-container" style={{ position: "relative" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-secondary" onClick={onBack} className='d-flex justify-contents-center align-items-center'>
            <i className="fa fa-caret-left"></i> Back to Modules
          </Button>

          <div className="text-center">
            <h5 className="mb-1 fw-bold" style={{ letterSpacing: "1px", fontSize: "1.2rem" }}>
              Question Bank ({filteredQuestions.length})
            </h5>
            <h6 className="mb-0 text-secondary" style={{ letterSpacing: "0.5px", fontSize: "1rem" }}>
              {selectedModule.name}
            </h6>
          </div>

          {/* Show buttons only when there are questions or filters are applied */}
          
            <div className="d-flex gap-2 position-relative">
              {/* Toggle Button (shows only when questions are selected) */}
              {(filteredQuestions.length > 0 || Object.keys(filters).length > 0) && (selectedQuestionIds.length > 0 || true) && (
                <ArchiveButton 
                  state={archiveState}
                  selectedQuestionIds={selectedQuestionIds} 
                  toggleArchiveQuestions={toggleArchiveQuestions}
                  setSelectedQuestionIds={setSelectedQuestionIds}
                />
              )}
              
              {/* Filter Button - Updated */}
              <div ref={filterButtonRef}>
                <Button
                  variant={Object.keys(filters).length > 0 ? "primary" : "outline-secondary"}
                  onClick={() => setShowFilterPane(!showFilterPane)}
                  disabled={selectedQuestionIds.length > 0}
                >
                  <i className="fa fa-filter me-2"></i>
                  Filter
                  {Object.keys(filters).length > 0 && (
                    <span className="ms-1">•</span>
                  )}
                </Button>
              </div>
              

              {(filteredQuestions.length > 0 || Object.keys(filters).length > 0) && (
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(true)}
                disabled={selectedQuestionIds.length > 0}
              >
                <i className="fa fa-plus me-2"></i>New
              </Button>
              )}

              <ImportModal
                disabled={selectedQuestionIds.length > 0}
                selectedModule={selectedModule}
                addQuestion={addQuestion}
              />

              {/* Filter Pane */}
              {showFilterPane && (
                <FilterPane
                  onApply={handleApplyFilters}
                  onClose={() => setShowFilterPane(false)}
                  questions={questions}
                />
              )}
            </div>
        </div>

        {/* Show active filters and clear option */}
        {Object.keys(filters).length > 0 && (
          <div className="filter-badges p-2 bg-light rounded d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <small className="text-muted me-2">Active filters:</small>
              {filters.searchText && (
                <span className="badge bg-secondary filter-badge">
                  Search: {filters.searchText}
                </span>
              )}
              {(filters.minMarks !== null || filters.maxMarks !== null) && (
                <span className="badge bg-secondary filter-badge">
                  Marks: {filters.minMarks || 0}-{filters.maxMarks || '∞'}
                </span>
              )}
              {filters.questionStatus && (
                <span className="badge bg-secondary filter-badge">
                  {filters.questionStatus === 'active' ? 'Active Questions' : 'Archived Questions'}
                </span>
              )}
            </div>
            <Button variant="outline-danger" size="sm" onClick={handleClearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {selectedQuestionIds.length > 0 && (
          <div className="overlay">
            <Button variant="danger" onClick={handleDeleteSelected}>
              <i className="fa fa-trash" /> Delete Selected ({selectedQuestionIds.length})
            </Button>
            <button
              className="btn-close-selection"
              onClick={() => setSelectedQuestionIds([])}
              aria-label="Clear selection"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Show no questions screen when no questions exist */}
      {filteredQuestions.length === 0 && Object.keys(filters).length === 0 ? (
        <div className="d-flex flex-column justify-content-center align-items-center text-center py-5 flex-grow-1">
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" 
                stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="text-muted mb-3">No Questions Found</h4>
          <p className="text-muted mb-4" style={{ maxWidth: "500px" }}>
            This module doesn't have any questions yet. Questions are the building blocks of your exams.
            Get started by adding your first question to this module.
          </p>
          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="px-4 py-2"
            >
              <i className="fa fa-plus me-2"></i>Add Your First Question
            </Button>
          </div>
        </div>
      ) : filteredQuestions.length === 0 && Object.keys(filters).length > 0 ? (
        <div className="d-flex flex-column justify-content-center align-items-center text-center py-5 flex-grow-1">
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" 
                stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L15 15" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="text-muted mb-3">No Questions Match Your Filters</h4>
          <p className="text-muted mb-4" style={{ maxWidth: "500px" }}>
            No questions match the current filter criteria. Try adjusting your filters or 
            <Button variant="link" className="p-0 ms-1" onClick={handleClearFilters}>
              clear all filters
            </Button> to see all questions.
          </p>
        </div>
      ) : (
        /* Question table (only shown when there are questions) */
        <QuestionTable
          questions={filteredQuestions}
          selectedQuestionIds={selectedQuestionIds}
          expandedRow={expandedRow}
          onSelect={toggleSelectQuestion}
          onSelectAll={toggleSelectAll}
          onExpand={setExpandedRow}
          addQuestion={addQuestion}
        />
      )}

      {/* Modals */}
      <QuestionFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddQuestion}
        isSaving={isSaving}
        successInfo={successInfo}
      />

      <DuplicateWarningModal
        duplicateInfo={duplicateInfo}
        onHide={resetDuplicateInfo}
      />
    </div>
  );
}