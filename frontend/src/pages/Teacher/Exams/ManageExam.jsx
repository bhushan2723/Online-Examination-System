import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import ExamStatusCard from '../../../components/Exam/ExamStatusCard';
import ExamDetailsModal from './ExamDetailsModal';
import ExamFilterPane from "./ExamFilterPane";
import './ManageExam.css';

const ManageExam = ({ onCreate, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const[data, setData] = useState([]);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({});
  const filterButtonRef = useRef(null);
  const [showFilterPane, setShowFilterPane] = useState(false); 


  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("⚠️ No token found, redirect to login maybe.");
          setLoading(false);
          return;
        }

        const response = await fetch('/api/exams', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token, 
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setData(data);

        // Map backend exam docs into frontend format
        const mappedExams = data.map(exam => {
          const { status, statusVariant } = getExamStatus(exam.startTime, exam.endTime);

          const start = new Date(exam.startTime);
          const end = new Date(exam.endTime);

          // ✅ Format dates
          const startDateStr = start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          const endDateStr = end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          const dateRange = startDateStr;

          // ✅ Format times
          const startTimeStr = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          const endTimeStr = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          const timeRange = `${startTimeStr} - ${endTimeStr}`;

          return {
            id: exam._id,
            title: exam.title,
            totalMarks: exam.totalMarks,
            startTime: exam.startTime,   // keep for filters
            endTime: exam.endTime,       // keep for filters
            dateRange,
            timeRange,
            status,
            statusVariant,
          };
        });


        setExams(mappedExams);
      } catch (err) {
        console.error("❌ Error fetching exams:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

    // 👇 compute status from time
  const getExamStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { status: 'Upcoming', statusVariant: 'warning' };
    if (now >= start && now <= end) return { status: 'In Progress', statusVariant: 'primary' };
    return { status: 'Completed', statusVariant: 'success' };
  };

  const handleCardClick = (examId) => {
    const exam = data.find(e => e.id === examId);
    setSelectedExam(exam);

    const rawExamData = data.find(e => e._id === examId);
    // Check if exam status is "Upcoming" - allow editing
    const now = new Date();
    const startTime = new Date(rawExamData.startTime);
    const timeUntilStart = startTime - now;
    const tenMinutesInMs = 10 * 60 * 1000;

    if (rawExamData.status === "Upcoming" && timeUntilStart > tenMinutesInMs) {
        onEdit(rawExamData);
    } else {
        // For "In Progress", "Completed", or "Canceled" exams, show modal
        setShowModal(true);
    }
  };

    // Filter exams based on applied filters
  const filteredExams = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return exams; // show all exams when no filters applied
    }

    return exams.filter(exam => {
      // Filter by exam title
      if (filters.title && !exam.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }

      // Filter by start date
      if (filters.startDate) {
        const examStart = new Date(exam.startTime);
        if (examStart < new Date(filters.startDate)) {
          return false;
        }
      }

      // Filter by end date
      if (filters.endDate) {
        const examEnd = new Date(exam.endTime);
        if (examEnd > new Date(filters.endDate)) {
          return false;
        }
      }

      // Filter by marks range
      if (filters.minMarks !== null && exam.totalMarks < filters.minMarks) {
        return false;
      }
      if (filters.maxMarks !== null && exam.totalMarks > filters.maxMarks) {
        return false;
      }

      // Filter by status
      if (filters.status && exam.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [exams, filters]);


  // Pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  const handleAddExam = () => {
    onCreate();
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle applying filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterPane(false);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="p-4" style={{ width: "100%", position: "relative", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div className="header-container" style={{ position: "relative" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Manage Exams ({exams.length})</h3>
            {/* Show filter and add buttons only when there are exams or filters are applied */}
            {(exams.length > 0 || Object.keys(filters).length > 0) && (
              <div className='d-flex' style={{position: "relative"}}>
                {/* Filter Button - Updated */}
                <div ref={filterButtonRef}>
                  <Button
                    variant={Object.keys(filters).length > 0 ? "primary" : "outline-secondary"}
                    onClick={() => setShowFilterPane(!showFilterPane)}
                  >
                    <i className="fa fa-filter me-2"></i>
                    Filter
                    {Object.keys(filters).length > 0 && (
                      <span className="ms-1">•</span>
                    )}
                  </Button>
                </div>

                {/* Filter Pane */}
                {showFilterPane && (
                  <ExamFilterPane
                    onApply={handleApplyFilters}
                    onClose={() => setShowFilterPane(false)}
                  />
                )}
              </div>
            )}
          </div>
          {/* Show active filters and clear option */}
          {Object.values(filters).some(v => v !== null && v !== "" ) && (
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
              <Button variant="outline-danger" size="sm" onClick={handleClearFilters}>
                Clear all
              </Button>
            </div>
          )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading exams...</p>
          </div>
        </div>
      ) : exams.length === 0 && Object.keys(filters).length === 0 ? (
        // No exams screen
        <div className="d-flex flex-column justify-content-center align-items-center text-center py-5 flex-grow-1">
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14L12 17M12 11L12 11.001M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" 
                stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="text-muted mb-3">No Exams Found</h4>
          <p className="text-muted mb-4" style={{ maxWidth: "500px" }}>
            You haven't created any exams yet. Exams are scheduled assessments that students can take.
            Get started by creating your first exam.
          </p>
          <Button 
            variant="primary" 
            onClick={handleAddExam}
            className="px-4 py-2"
          >
            Create Your First Exam
          </Button>
        </div>
      ) : filteredExams.length === 0 && Object.keys(filters).length > 0 ? (
        // No exams match filters screen
        <div className="d-flex flex-column justify-content-center align-items-center text-center py-5 flex-grow-1">
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14L12 17M12 11L12 11.001M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" 
                stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L15 15" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="text-muted mb-3">No Exams Match Your Filters</h4>
          <p className="text-muted mb-4" style={{ maxWidth: "500px" }}>
            No exams match the current filter criteria. Try adjusting your filters or 
            <Button variant="link" className="p-0 ms-1" onClick={handleClearFilters}>
              clear all filters
            </Button> to see all exams.
          </p>
        </div>
      ) : (
        // Exams Layout (only shown when there are exams)
        <section
          aria-label="Examination cards"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Add Exam card */}
          <div
            onClick={handleAddExam}
            style={{
              flex: '1 1 calc(33.333% - 1rem)',
              maxWidth: '15rem',
              minHeight: '8rem',
              border: '2px dashed #aaa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
              cursor: 'pointer',
              background: '#f9f9f9'
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>+</div>
              <div>Add New Exam</div>
            </div>
          </div>

          {/* Render fetched exams */}
          {currentExams.map(exam => (
            <div
              key={exam.id}
              style={{
                flex: '1 1 calc(33.333% - 1rem)',
                maxWidth: '15rem'
              }}
            >
              <ExamStatusCard
                title={exam.title}
                subtitle={exam.subtitle}
                dateRange={exam.dateRange}
                timeRange={exam.timeRange}
                totalMarks={exam.totalMarks}
                status={exam.status}
                statusVariant={exam.statusVariant}
                onCardClick={() => handleCardClick(exam.id)}
                maxWidth='100%'
              />
            </div>
          ))}
        </section>
      )}

      {/* Pagination - Only show when there are exams */}
      {!loading && exams.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-auto" style={{
          backgroundColor: '#fff',
          padding: '0.75rem 0rem 1rem 0.75rem',
          zIndex: 1000,
        }}>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => goToPage(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <ExamDetailsModal
        show={showModal}
        exam={selectedExam}
        onClose={() => setShowModal(false)}
        onSave={(updatedExam) => {
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default ManageExam;