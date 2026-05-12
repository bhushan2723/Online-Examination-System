import { useEffect, useState } from "react";
import ResultInsight from "./ResultInsight";
import ExamStatusCard from "../../../components/Exam/ExamStatusCard";
import ResultHeader from "./ResultHeader";

const TeacherResultView = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const [showFilterPane, setShowFilterPane] = useState(false);
  const [filters, setFilters] = useState({});

  const [rawExamData, setRawExamData] = useState([]);
  const [uiExamData, setUiExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // adjust as needed

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/exams/completed",
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch completed exams");
      }

      const data = await response.json();
      setRawExamData(data);

      const mappedExams = data.map((exam) => {
        const { status, statusVariant } = getExamStatus(
          exam.startTime,
          exam.endTime
        );

        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);

        const startDateStr = start.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const endDateStr = end.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const dateRange = startDateStr;

        const startTimeStr = start.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const endTimeStr = end.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const timeRange = `${startTimeStr} - ${endTimeStr}`;

        return {
          id: exam._id,
          title: exam.title,
          totalMarks: exam.totalMarks,
          dateRange,
          timeRange,
          status,
          statusVariant,
        };
      });

      setUiExamData(mappedExams);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const getExamStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { status: "Upcoming", statusVariant: "warning" };
    if (now >= start && now <= end)
      return { status: "In Progress", statusVariant: "primary" };
    return { status: "Completed", statusVariant: "success" };
  };

  const handleCardClick = (examId) => {
    const exam = rawExamData.find((e) => e._id === examId);
    setSelectedExam(exam);
  };

  const filteredExams = uiExamData.filter((exam) => {
    if (
      filters.title &&
      !exam.title.toLowerCase().includes(filters.title.toLowerCase())
    ) {
      return false;
    }
    if (filters.startDate) {
      const examStart = new Date(exam.dateRange.split(" - ")[0]);
      if (examStart < new Date(filters.startDate)) return false;
    }
    if (filters.endDate) {
      const examEnd = new Date(exam.dateRange.split(" - ").pop());
      if (examEnd > new Date(filters.endDate)) return false;
    }
    if (filters.minMarks !== null && exam.totalMarks < filters.minMarks) {
      return false;
    }
    if (filters.maxMarks !== null && exam.totalMarks > filters.maxMarks) {
      return false;
    }
    if (filters.status && exam.status !== filters.status) {
      return false;
    }
    return true;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle applying filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterPane(false);
    setCurrentPage(1); // ✅ reset to first page on filter change
  };

  if (loading)
    return <p className="text-center py-5">Loading completed exams...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;

  return (
    <>
      {selectedExam ? (
        <ResultInsight
          examId={selectedExam._id}
          onBack={() => setSelectedExam(null)}
        />
      ) : (
        <>
          <ResultHeader
            role={role}
            filters={filters}
            setFilters={setFilters}
            showFilterPane={showFilterPane}
            setShowFilterPane={setShowFilterPane}
            handleApplyFilters={handleApplyFilters}
          />

          {currentExams.length > 0 ? (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)", // 5 fixed slots
                gap: "1rem",
                justifyItems: "center", // keeps cards centered in their slot
              }}
            >
              {currentExams.map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    width: "240px", // fixed width for each card
                  }}
                >
                  <ExamStatusCard
                    title={exam.title}
                    dateRange={exam.dateRange}
                    timeRange={exam.timeRange}
                    totalMarks={exam.totalMarks}
                    status={exam.status}
                    statusVariant={exam.statusVariant}
                    onCardClick={() => handleCardClick(exam.id)}
                    maxWidth="100%"
                  />
                </div>
              ))}
            </section>
          ) : (
            <div className="text-center py-5" style={{ width: "100%" }}>
              <h5 className="text-muted mb-2">No completed exams available</h5>
              <p className="text-muted small">
                Once you’ve conducted exams, they will appear here for review.
              </p>
            </div>
          )}

          {/* ✅ Pagination Controls */}
          {filteredExams.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => goToPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TeacherResultView;
