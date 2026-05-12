import { useRef } from "react";
import { Button } from "react-bootstrap";
import ResultViewFilterPane from "./ResultViewFilterPane";

const ResultHeader = ({
  role,
  filters,
  setFilters,
  showFilterPane,
  setShowFilterPane,
  handleApplyFilters,
}) => {
  const filterButtonRef = useRef(null);

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <>
      <div
        className="mb-2 d-flex flex-row gap-2 justify-content-between align-items-start"
        style={{ position: "relative" }}
      >
        {/* Left Header */}
        <div className="left-header">
          <h3>Exam Results</h3>
          <p className="text-muted">
            {role === "Student"
              ? "View your attempted exams and result insights."
              : "View completed exams you have conducted."}
          </p>
        </div>

        {/* Filter Button */}
        <div className="d-flex" style={{ position: "relative" }}>
          <div ref={filterButtonRef}>
            <Button
              variant={
                Object.keys(filters).length > 0 ? "primary" : "outline-secondary"
              }
              onClick={() => setShowFilterPane(!showFilterPane)}
            >
              <i className="fa fa-filter me-2"></i>
              Filter
              {Object.keys(filters).length > 0 && <span className="ms-1">•</span>}
            </Button>
          </div>
        </div>

        {/* Filter Pane */}
        {showFilterPane && (
          <ResultViewFilterPane
            onApply={handleApplyFilters}
            onClose={() => setShowFilterPane(false)}
          />
        )}
      </div>
      {Object.values(filters).some((v) => v !== null && v !== "") && (
          <div className="filter-badges p-2 bg-light rounded d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <small className="text-muted me-2">Active filters:</small>

              {/* Exam Title */}
              {filters.title && (
                <span className="badge bg-secondary filter-badge me-1">
                  Title: {filters.title}
                </span>
              )}

              {/* Exam Dates */}
              {(filters.startDate || filters.endDate) && (
                <span className="badge bg-secondary filter-badge me-1">
                  {filters.startDate ? `From: ${filters.startDate}` : ""}
                  {filters.startDate && filters.endDate ? " " : ""}
                  {filters.endDate ? `To: ${filters.endDate}` : ""}
                </span>
              )}

              {/* Marks */}
              {(filters.minMarks !== null || filters.maxMarks !== null) && (
                <span className="badge bg-secondary filter-badge me-1">
                  Marks: {filters.minMarks ?? 0} - {filters.maxMarks ?? "∞"}
                </span>
              )}

              {/* Status */}
              {filters.status && (
                <span className="badge bg-secondary filter-badge me-1">
                  Status: {filters.status}
                </span>
              )}
            </div>

            {/* Clear Button */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </div>
      )}
    </>
  );
};

export default ResultHeader;
