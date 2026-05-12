import { useState, useEffect } from "react";
import ExamStatusCard from "../../components/Exam/ExamStatusCard";
import ExamRegistrationModal from "./ExamRegistrationModal";
import ExamDetailsModal from "./ExamDetailsModal";

const StudentExamView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;
  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    // Fetch exams initially
    fetchExams();
  }, []);

  const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/exam-registration/my-exams", {
          headers: { "x-auth-token": token },
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (!exams || exams.length === 0) return;

    const now = new Date();

    const upcomingExams = exams
      .filter((exam) => new Date(exam.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const ongoingExams = exams.filter(
      (exam) => new Date(exam.startTime) <= now && new Date(exam.endTime) > now
    );

    let startTimer;
    let endTimer;
    let fallbackTimer;

    if (upcomingExams.length > 0) {
      const closestExam = upcomingExams[0];
      const startTime = new Date(closestExam.startTime).getTime();
      const endTime = new Date(closestExam.endTime).getTime();
      const diff = startTime - now.getTime();

      if (diff <= 10 * 60 * 1000) {
        // refresh at start
        startTimer = setTimeout(() => fetchExams(), diff);

        // refresh at end
        const msUntilEnd = endTime - Date.now();
        if (msUntilEnd > 0) {
          endTimer = setTimeout(() => {
            fetchExams();
          }, msUntilEnd);
        }
      } else {
        // no exam soon → fallback
        fallbackTimer = setTimeout(() => fetchExams(), 10 * 60 * 1000);
      }
    }

    // 🔥 Handle ongoing exams: only need endTimer
    if (ongoingExams.length > 0) {
      const ongoing = ongoingExams[0];
      const msUntilEnd = new Date(ongoing.endTime).getTime() - Date.now();
      if (msUntilEnd > 0) {
        endTimer = setTimeout(() => {
          fetchExams();
        }, msUntilEnd);
      }
    }

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (endTimer) clearTimeout(endTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [exams]);


  // sync selected exam whenever exams update
  useEffect(() => {
    if (selectedExam && exams.length > 0) {
      const latest = exams.find((e) => e._id === selectedExam.id);
      if (latest) {
        setSelectedExam((prev) => ({ ...prev, ...latest }));
      }
    }
  }, [exams, selectedExam?.id]);

  const handleCardClick = (exam) => setSelectedExam(exam);

  // ✅ Open Exam in a new window
  const handleStartExam = (exam, isLate = false) => {
    setSelectedExam(null);
    const token = localStorage.getItem("token");

    let timeLeft = exam.duration * 60 * 1000; // default: full duration in ms

    if (isLate) {
      const now = new Date();
      const examEnd = new Date(exam.endTime);

      // Remaining time = examEnd - now
      timeLeft = examEnd - now;

      if (timeLeft <= 0) {
        alert("Exam has already ended.");
        return;
      }
    }
    const url = `/exam-window?examId=${exam.id}&token=${encodeURIComponent(token)}&timeLeft=${timeLeft}`;
    window.open(
      url,
      "_blank",
      "width=1200,height=800,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  // Transform API exam object -> card fields
  const formattedExams = exams?.map((exam) => {
    const startDate = new Date(exam.startTime);
    const endDate = new Date(exam.endTime);

    const sameDay = startDate.toDateString() === endDate.toDateString();
    const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit" };

    const dateRange = startDate.toLocaleDateString("en-GB", dateOptions);

    const timeRange = `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`;

    return {
      ...exam,
      id: exam._id,
      title: exam.title,
      subtitle: `Teacher: ${exam.createdBy?.name || "Unknown"}`,
      dateRange,
      timeRange,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      status:
        exam.status === "In Progress"
          ? "In Progress"
          : exam.status === "Completed"
          ? "Completed"
          : "Upcoming",
      statusVariant:
        exam.status === "In Progress"
          ? "info"
          : exam.status === "Completed"
          ? "success"
          : "warning",
    };
  });

  const filteredExams = formattedExams?.filter((exam) =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExams?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container py-4 px-4">
      <h1 className="h3 fw-bold m-0 mb-2">Examinations</h1>

      {/* Search */}
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search examinations..."
          style={{ maxWidth: "250px" }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Exams Layout */}
      <section
        aria-label="Examination cards"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}
      >
        {/* Register card */}
        <div
          onClick={() => setShowModal(true)}
          style={{
            flex: "1 1 calc(33.333% - 1rem)",
            maxWidth: "15rem",
            minHeight: "8rem",
            border: "2px dashed #aaa",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
            cursor: "pointer",
            background: "#f9f9f9",
          }}
          data-cy="exam-register-button"
        >
          <div className="text-center">
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>+</div>
            <div>Register for an exam</div>
          </div>
        </div>

        <ExamRegistrationModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          onRegister={fetchExams}
        />

        {loading ? (
          <div className="text-center py-5" style={{ width: "100%" }}>
            <p className="text-muted">Loading exams...</p>
          </div>
        ) : currentExams?.length > 0 ? (
          currentExams.map((exam) => (
            <div key={exam.id} style={{ flex: "1 1 calc(33.333% - 1rem)", maxWidth: "15rem" }}>
              <ExamStatusCard
                title={exam.title}
                status={exam.status}
                statusVariant={exam.statusVariant}
                dateRange={exam.dateRange}
                timeRange={exam.timeRange}
                totalMarks={exam.totalMarks}
                totalQuestions={exam.totalQuestions}
                onCardClick={() => handleCardClick(exam)}
                maxWidth="20rem"
              />
            </div>
          ))
        ) : (
          <div className="text-center py-5" style={{ width: "100%" }}>
            <p className="text-muted">No exams found matching your search</p>
          </div>
        )}
      </section>

      <ExamDetailsModal
        show={!!selectedExam}
        handleClose={() => setSelectedExam(null)}
        exam={selectedExam}
        onStartExam={handleStartExam}
        onUnregisterSuccess={fetchExams}
        onShowInsights={(id) => console.log("Show Insights:", id)}
      />
    </div>
  );
};

export default StudentExamView;
