import { useEffect, useState } from "react";
import ExamStatusCard from "../../../components/Exam/ExamStatusCard";
import StudentResultInsight from "./StudentResultInsight";
import ResultHeader from "./ResultHeader";

const StudentResultView = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const [showFilterPane, setShowFilterPane] = useState(false);
  const [filters, setFilters] = useState({});

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/exams/student/completed",
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch student exams");
      const data = await response.json();

      const mapped = data.map((entry) => {
        const { exam, result, feedback } = entry;

        const start = new Date(exam.completedOn);
        const startDateStr = start.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const startTimeStr = start.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        return {
          id: exam.examId,
          title: exam.title,
          createdBy: exam.createdBy,
          totalMarks: exam.totalMarks,
          duration: exam.duration,
          completedOn: new Date(exam.completedOn).toLocaleString(),
          dateRange: startDateStr,
          timeRange: startTimeStr,
          score: result.score,
          percentage: result.percentage,
          grade: result.grade,
          pass: result.pass,
          status: result.status,
          submittedAt: result.submittedAt
            ? new Date(result.submittedAt).toLocaleString()
            : null,
          timeSpent: result.timeSpentMinutes,
          resultPublished: exam.resultPublished,
          feedback,
        };
      });

      setExams(mapped);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    // Filter by title
    if (
      filters.title &&
      !exam.title.toLowerCase().includes(filters.title.toLowerCase())
    ) {
      return false;
    }

    // Filter by start date
    if (filters.startDate) {
      const examStart = new Date(exam.dateRange.split(" - ")[0]); // take start of date range
      if (examStart < new Date(filters.startDate)) {
        return false;
      }
    }

    // Filter by end date
    if (filters.endDate) {
      const examEnd = new Date(exam.dateRange.split(" - ").pop()); // take end of date range
      if (examEnd > new Date(filters.endDate)) {
        return false;
      }
    }

    // Filter by marks
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

  // Handle applying filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterPane(false);
  };

  if (loading) return <p>Loading your results...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <>
      <ResultHeader
        role={role}
        filters={filters}
        setFilters={setFilters}
        showFilterPane={showFilterPane}
        setShowFilterPane={setShowFilterPane}
        handleApplyFilters={handleApplyFilters}
      />

      {filteredExams.length > 0 ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)", // 5 fixed slots
            gap: "1rem",
            justifyItems: "center", // keeps cards centered in their slot
          }}
        >
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              style={{
                width: "240px", // fixed width for each card
              }}
            >
              <ExamStatusCard
                key={exam.id}
                title={exam.title}
                subtitle={`By ${exam.createdBy}`}
                dateRange={exam.dateRange}
                timeRange={exam.timeRange}
                totalMarks={exam.totalMarks}
                status={
                  exam.resultPublished
                    ? `${exam.score}/${exam.totalMarks} (${exam.percentage}%)`
                    : `Not Published Yet`
                }
                statusVariant={exam.resultPublished ? "success" : "danger"}
                showFooter={exam.resultPublished}
                showChevron={false}
                onCardClick={() => setSelectedExam(exam)}
              />
            </div>
          ))}
        </section>
      ) : (
        <div className="text-center py-5" style={{ width: "100%" }}>
          <h5 className="text-muted mb-2">No completed exams available</h5>
          <p className="text-muted small">
            Once you attempt exams, they will appear here with your scores.
          </p>
        </div>
      )}

      {/* Result Modal */}
      <StudentResultInsight
        exam={selectedExam}
        show={!!selectedExam}
        onClose={() => setSelectedExam(null)}
      />
    </>
  );
};

export default StudentResultView;
