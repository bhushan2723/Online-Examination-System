import React, { useState, useMemo } from "react";
import "./StudentList.css";
import ProgressModal from "./ProgressModal";

const StudentList = ({ students }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Normalize student data for table
  const normalizedStudents = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        averagePercentageNum: s.averagePercentage || 0,
        averagePercentage: s.averagePercentage?.toFixed(2) || "0.00",
      })),
    [students]
  );

  // Sorting
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return normalizedStudents;

    return [...normalizedStudents].sort((a, b) => {
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];

      if (sortConfig.key === "averagePercentage") {
        valueA = a.averagePercentageNum;
        valueB = b.averagePercentageNum;
      }

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
  }, [normalizedStudents, sortConfig]);

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

  const handleViewMore = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex align-items-center gap-4 mb-4 nav-fake">
        <div className="active-tab">
          Students ({students.length})
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle text-nowrap">
          <thead>
            <tr className="text-secondary fw-semibold" style={{ fontSize: "0.875rem" }}>
              <th scope="col" className="ps-4" onClick={() => handleSort("studentName")}>
                Student Name {renderSortIcon("studentName")}
              </th>
              <th
                scope="col"
                className="text-center"
                onClick={() => handleSort("totalExamsAttempted")}
              >
                Total Exams {renderSortIcon("totalExamsAttempted")}
              </th>
              <th
                scope="col"
                className="text-center"
                onClick={() => handleSort("averagePercentage")}
              >
                Avg Percentage {renderSortIcon("averagePercentage")}
              </th>
              <th
                scope="col"
                className="text-center"
              >
                Trend
              </th>
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.studentId}>
                <td className="ps-4">{student.studentName}</td>
                <td className="text-center">{student.totalExamsAttempted}</td>
                <td className="text-center">{student.averagePercentage}%</td>
                <td className="text-center">{student.trend}</td>
                <td className="text-center">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleViewMore(student)}
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))}
            {sortedStudents.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Student Performance Modal */}
      {showModal && selectedStudent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-graduate me-2"></i>
                  {selectedStudent.studentName} - Performance Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <ProgressModal student={selectedStudent} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default StudentList;