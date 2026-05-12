import React, { useState, useMemo } from "react";
import { Spinner } from "react-bootstrap";
import StudentAnalysisModal from "./StudentAnalysisModal"; // ✅ import it
import "./StudentTable.css";

const StudentTable = ({ students, examId, avgScore }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("attended");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [studentReport, setStudentReport] = useState(null);

  // ✅ Normalize students from backend into UI-friendly objects
  const normalizedStudents = useMemo(
    () =>
      students.map((s) => {
        const attended = s.status !== "absent";
        const statusLabel = attended
          ? s.pass
            ? "Passed"
            : "Failed"
          : "Absent";

        const scoreColor = s.pass ? "green" : "red";
        const gradeColor =
          s.grade === "Excellent"
            ? "green"
            : s.grade === "Average"
            ? "yellow"
            : "red";

        const timeSpent = s.timeSpentMinutes
          ? `${s.timeSpentMinutes} min`
          : attended
          ? "-"
          : "0 min";

        const submittedAt = s.submittedAt
          ? new Date(s.submittedAt).toLocaleString()
          : attended
          ? "In Progress / Cheated"
          : "Absent";

        return {
          ...s,
          attended,
          statusLabel,
          score: `${s.score}/${s.totalMarks}`,
          scoreValue: s.score,
          scoreColor,
          grade: s.grade,
          gradeColor,
          timeSpent,
          timeSpentValue: s.timeSpentMinutes || 0,
          submittedAt,
          img: "/default-avatar.png",
        };
      }),
    [students]
  );

  // Sorting
  const sortedStudents = [...normalizedStudents].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });

  // Filtering
  const filteredStudents = sortedStudents.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Passed" && s.statusLabel === "Passed") ||
      (statusFilter === "Failed" && s.statusLabel === "Failed");

    const matchesGrade = gradeFilter === "all" || gradeFilter === s.grade;

    const matchesTab =
      activeTab === "attended" ? s.attended === true : s.attended === false;

    return matchesSearch && matchesStatus && matchesGrade && matchesTab;
  });

  const attendedCount = normalizedStudents.filter((s) => s.attended).length;
  const absentCount = normalizedStudents.filter((s) => !s.attended).length;

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <i className="fas fa-chevron-down ms-1"></i>;
    return sortConfig.direction === "asc" ? (
      <i className="fas fa-chevron-up ms-1 text-primary"></i>
    ) : (
      <i className="fas fa-chevron-down ms-1 text-primary"></i>
    );
  };

  // 🔎 Fetch student detail and open modal
  const handleSeeDetail = async (studentId) => {
    setShowModal(true);
    setLoadingDetail(true);
    setStudentReport(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/exams/${examId}/student/${studentId}`,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch student report");
      const data = await res.json();
      setStudentReport(data);
    } catch (err) {
      console.error("❌ Error fetching student attempt report:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Tabs */}
      <div className="d-flex align-items-center gap-4 mb-4 nav-fake">
        <div
          className={`d-flex align-items-center gap-1 ${
            activeTab === "attended" ? "active-tab" : "inactive"
          }`}
          onClick={() => setActiveTab("attended")}
        >
          <span>Attended</span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            ({attendedCount})
          </span>
        </div>
        <div
          className={`d-flex align-items-center gap-1 ${
            activeTab === "absent" ? "active-tab" : "inactive"
          }`}
          onClick={() => setActiveTab("absent")}
        >
          <span>Absent</span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            ({absentCount})
          </span>
        </div>
      </div>

      {/* Filters */}
      <form
        className="row g-3 align-items-center mb-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-auto">
          <div className="input-group search-input">
            <input
              type="text"
              className="form-control"
              placeholder="Search name or e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status: all</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="all">Grade: all</option>
            <option value="Excellent">Excellent</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </form>

      {/* Table */}
      <div className="table-responsive">
        <table className="table align-middle text-nowrap">
          <thead>
            <tr
              className="text-secondary fw-semibold"
              style={{ fontSize: "0.875rem" }}
            >
              <th scope="col" className="ps-4" onClick={() => handleSort("name")}>
                Student name {renderSortIcon("name")}
              </th>
              <th scope="col" onClick={() => handleSort("statusLabel")}>
                Status {renderSortIcon("statusLabel")}
              </th>
              <th scope="col" onClick={() => handleSort("scoreValue")}>
                Score {renderSortIcon("scoreValue")}
              </th>
              <th scope="col" onClick={() => handleSort("grade")}>
                Grade {renderSortIcon("grade")}
              </th>
              <th scope="col" onClick={() => handleSort("timeSpentValue")}>
                Time Spent {renderSortIcon("timeSpentValue")}
              </th>
              <th scope="col" onClick={() => handleSort("submittedAt")}>
                Submitted / Timeout {renderSortIcon("submittedAt")}
              </th>
              <th scope="col" className="pe-4">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index}>
                <td className="ps-4 d-flex align-items-center">
                  <img
                    src={student.img}
                    alt={student.name}
                    className="student-img"
                  />
                  {student.name}
                </td>
                <td>
                  <span
                    className={
                      student.statusLabel === "Passed"
                        ? "badge-passed"
                        : student.statusLabel === "Failed"
                        ? "badge-failed"
                        : "badge-absent"
                    }
                  >
                    {student.statusLabel}
                  </span>
                </td>
                <td>
                  <span className={`score-${student.scoreColor}`}>
                    {student.score}
                  </span>
                </td>
                <td>
                  <span className={`grade-${student.gradeColor}`}>
                    {student.grade}
                  </span>
                </td>
                <td>{student.timeSpent}</td>
                <td>{student.submittedAt}</td>
                <td className="pe-4">
                  <button
                    className="btn btn-link text-primary fw-semibold p-0"
                    onClick={() => handleSeeDetail(student.studentId)}
                  >
                    See Detail
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Use StudentAnalysisModal instead of inline modal */}
      <StudentAnalysisModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        student={studentReport?.student}
        exam={studentReport?.exam}
        loading={loadingDetail}
        classAverage={avgScore}
      />
    </div>
  );
};

export default StudentTable;
