import React, { useState } from "react";

const ProgressModal = ({ student }) => {
  const [activeTab, setActiveTab] = useState("exams");
    // Calculate performance statistics for the modal
  const calculatePerformanceStats = (exams) => {
    if (!exams || exams.length === 0) return null;
    
    const totalExams = exams.length;
    const totalScore = exams.reduce((sum, exam) => sum + exam.score, 0);
    const totalPossible = exams.reduce((sum, exam) => sum + exam.totalMarks, 0);
    const avgScore = totalScore / totalExams;
    const avgPercentage = (totalScore / totalPossible) * 100;
    
    const statusCounts = exams.reduce((counts, exam) => {
      counts[exam.status] = (counts[exam.status] || 0) + 1;
      return counts;
    }, {});
    
    const avgTimeSpent = exams.reduce((sum, exam) => {
      const started = new Date(exam.startedAt);
      const submitted = new Date(exam.submittedAt);
      return sum + (submitted - started) / (1000 * 60); // in minutes
    }, 0) / totalExams;
    
    return {
      totalExams,
      totalScore,
      totalPossible,
      avgScore: avgScore.toFixed(2),
      avgPercentage: avgPercentage.toFixed(2),
      statusCounts,
      avgTimeSpent: avgTimeSpent.toFixed(2)
    };
  };

  const performanceStats = calculatePerformanceStats(student.exams);

  if (!student.exams || student.exams.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
        <h5>No Exam Data Available</h5>
        <p className="text-muted">This student hasn't taken any exams yet.</p>
      </div>
    );
  }



  return (
    <div>
      {/* Performance Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-6">
          <div className="card bg-light border-0 h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">Total Exams</h6>
              <h3 className="text-primary">{performanceStats.totalExams}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-light border-0 h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">Average Score</h6>
              <h3 className="text-info">{performanceStats.avgScore}/{performanceStats.totalPossible}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-light border-0 h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">Average Percentage</h6>
              <h3 className="text-success">{performanceStats.avgPercentage}%</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-light border-0 h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">Avg Time/Exam</h6>
              <h3 className="text-warning">{performanceStats.avgTimeSpent} min</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "exams" ? "active" : ""}`}
            onClick={() => setActiveTab("exams")}
          >
            <i className="fas fa-clipboard-list me-2"></i>Exam History
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <i className="fas fa-chart-line me-2"></i>Progress Tracking
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <i className="fas fa-chart-pie me-2"></i>Performance Analytics
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Exam History Tab */}
        {activeTab === "exams" && (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Time Spent</th>
                  <th>Tab Switches</th>
                </tr>
              </thead>
              <tbody>
                {student.exams.map((exam) => {
                  const started = new Date(exam.startedAt);
                  const submitted = new Date(exam.submittedAt);
                  const timeSpent = (submitted - started) / (1000 * 60); // minutes
                  
                  return (
                    <tr key={exam.attemptId}>
                      <td>{exam.examTitle}</td>
                      <td>{started.toLocaleDateString()}</td>
                      <td>{exam.score}/{exam.totalMarks}</td>
                      <td>{exam.percentage.toFixed(2)}%</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(exam.status)}`}>
                          {exam.status}
                        </span>
                      </td>
                      <td>{timeSpent.toFixed(2)} min</td>
                      <td>{exam.tabSwitchCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Progress Tracking Tab */}
        {activeTab === "progress" && (
          <div>
            <h5 className="mb-3">Score Trend Over Time</h5>
            <div className="progress-tracker mb-4">
              <div className="d-flex justify-content-between align-items-end" style={{ height: '200px' }}>
                {student.exams.map((exam, index) => {
                  const percentage = exam.percentage;
                  return (
                    <div key={exam.attemptId} className="d-flex flex-column align-items-center">
                      <div 
                        className="bg-primary rounded" 
                        style={{
                          width: '30px',
                          height: `${percentage * 1.5}px`,
                          minHeight: '5px'
                        }}
                        title={`${exam.examTitle}: ${percentage.toFixed(2)}%`}
                      ></div>
                      <small className="mt-2 text-muted">Exam {index + 1}</small>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <h5 className="mb-3">Time Management</h5>
            <div className="card">
              <div className="card-body">
                <p className="card-text">
                  Average time spent per exam: <strong>{performanceStats.avgTimeSpent} minutes</strong>
                </p>
                <div className="progress mb-3" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${Math.min(performanceStats.avgTimeSpent * 2, 100)}%` }}
                  >
                    {performanceStats.avgTimeSpent} min/exam
                  </div>
                </div>
                
                <p className="card-text">
                  Total tab switches across all exams: <strong>
                    {student.exams.reduce((sum, exam) => sum + exam.tabSwitchCount, 0)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h5 className="mb-3">Performance Distribution</h5>
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Exam Status</h6>
                  </div>
                  <div className="card-body">
                    {Object.entries(performanceStats.statusCounts).map(([status, count]) => (
                      <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-capitalize">{status}</span>
                        <span className="badge bg-primary rounded-pill">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Score Range Analysis</h6>
                  </div>
                  <div className="card-body">
                    {getScoreRangeAnalysis(student.exams).map((range, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{range.range}</span>
                          <span>{range.count} exams</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${range.color}`} 
                            role="progressbar" 
                            style={{ width: `${range.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'cheated': return 'danger';
    case 'passed': return 'success';
    case 'failed': return 'warning';
    default: return 'secondary';
  }
};

const getScoreRangeAnalysis = (exams) => {
  const ranges = [
    { range: "90-100%", min: 90, max: 100, color: "bg-success" },
    { range: "80-89%", min: 80, max: 89, color: "bg-info" },
    { range: "70-79%", min: 70, max: 79, color: "bg-primary" },
    { range: "60-69%", min: 60, max: 69, color: "bg-warning" },
    { range: "Below 60%", min: 0, max: 59, color: "bg-danger" }
  ];
  
  const totalExams = exams.length;
  
  return ranges.map(range => {
    const count = exams.filter(exam => {
      const percentage = exam.percentage;
      return percentage >= range.min && percentage <= range.max;
    }).length;
    
    return {
      ...range,
      count,
      percentage: totalExams > 0 ? (count / totalExams) * 100 : 0
    };
  });
};


export default ProgressModal;