import { Modal, Button, Row, Col, Card, Table, Spinner, Badge } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import "./StudentAnalysisModal.css";

const COLORS = ["#28a745", "#dc3545", "#ffc107"]; // correct, incorrect, unanswered

const StudentAnalysisModal = ({ show, handleClose, student, exam, loading, classAverage }) => {
  return (
    <Modal size="xl" show={show} onHide={handleClose} centered className="student-analysis-modal">
      {/* Header */}
      <Modal.Header closeButton className="border-bottom-0 pb-2 bg-light">
        <Modal.Title className="w-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {loading
                ? "Loading Student Report..."
                : student
                ? `${student.name} – ${exam?.title}`
                : "Student Report"}
              {student && (
                <Badge 
                  className="ms-3" 
                  bg={
                    student.status === "absent" 
                      ? "secondary" 
                      : student.pass 
                        ? "success" 
                        : "danger"
                  }
                >
                  {student.status === "absent"
                    ? "Absent"
                    : student.pass
                    ? "Passed"
                    : "Failed"}
                </Badge>
              )}
            </div>
            {!loading && student && (
              <div className="d-flex align-items-center">
                <span className="text-muted me-3 small">ID: {student.id || 'N/A'}</span>
              </div>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0 modal-scrollable-content">
        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Fetching student details...</p>
          </div>
        )}

        {/* Render content only if we have student data */}
        {!loading && student && (
          <>
            {/* Summary Cards */}
            <Row className="mb-4 mt-2 g-3">
              <Col md={2}>
                <Card className="text-center summary-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="text-muted small mb-1">SCORE</div>
                    <h4 className="mb-0 text-primary">{student.score}/{student.totalMarks}</h4>
                    <div className="text-muted small mt-1">{student.percentage}%</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center summary-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="text-muted small mb-1">TIME SPENT</div>
                    <h4 className="mb-0 text-info">{student.timeSpentMinutes} min</h4>
                    <div className="text-muted small mt-1">of {exam?.duration} min</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center summary-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="text-muted small mb-1">GRADE</div>
                    <h4 className="mb-0 text-dark">{student.grade}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center summary-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="text-muted small mb-1">TAB SWITCHES</div>
                    <h4 className={`mb-0 ${(student.tabSwitchCount || 0) > (exam?.tabSwitchLimit || 0) ? 'text-danger' : 'text-success'}`}>
                      {student.tabSwitchCount || 0}
                    </h4>
                    <div className="text-muted small mt-1">limit {exam?.tabSwitchLimit}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="summary-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="text-muted small mb-1">DEVICE INFORMATION</div>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-medium">{student.deviceInfo?.browser}</div>
                        <div className="text-muted small">{student.deviceInfo?.os}</div>
                      </div>
                      <div className="text-end">
                        <div className="text-capitalize">{student.deviceInfo?.deviceType}</div>
                        <div className="text-muted small">{student.ipAddress}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex flex-row align-items-center justify-content-center mb-4 gap-3" style={{height:"150px"}}>
              {/* Attempt window */}
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <h6 className="card-title mb-3 text-uppercase small">Attempt Window</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Started At</div>
                      <div className="fw-medium">
                        {student.startedAt
                          ? new Date(student.startedAt).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                    <div className="px-3 text-muted">→</div>
                    <div className="text-end">
                      <div className="text-muted small">Submitted At</div>
                      <div className="fw-medium">
                        {student.submittedAt
                          ? new Date(student.submittedAt).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Behavioral Insights - Moved up as requested */}
              <Card className="border-0 shadow-sm flex-grow-1">
                <Card.Body>
                  <h5 className="card-title mb-3 text-uppercase small">Behavioral Insights</h5>
                  <Row>
                    <Col md={4}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-light rounded p-2 me-3">
                          <i class="fa fa-window-restore" aria-hidden="true"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Tab Switches</div>
                          <div className="fw-medium">
                            {student.tabSwitchCount || 0} / {exam?.tabSwitchLimit}
                            {(student.tabSwitchCount || 0) > (exam?.tabSwitchLimit || 0) && (
                              <Badge bg="danger" className="ms-2">Exceeded</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-light rounded p-2 me-3">
                          <i class="fa fa-clock" aria-hidden="true"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Time Usage</div>
                          <div className="fw-medium">
                            {student.timeSpentMinutes} min / {exam?.duration} min
                          </div>
                          <div className="text-muted small">
                            {Math.round((student.timeSpentMinutes / exam?.duration) * 100)}% of time used
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-light rounded p-2 me-3">
                          <i className={`fa ${student.status === "cheated" ? "fa-exclamation-circle text-danger" : "fa-check text-success"}`}></i>
                        </div>
                        <div>
                          <div className="text-muted small">Status</div>
                          <div className="fw-medium">
                            {student.status === "cheated"
                              ? "Possible cheating detected"
                              : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>

            

            {/* Charts */}
            <Row className="mb-4 g-3">
              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="card-title mb-3 text-uppercase small">Answer Distribution</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Correct",
                              value: student.answers.filter((a) => a.isCorrect).length,
                            },
                            {
                              name: "Incorrect",
                              value: student.answers.filter((a) => a.isCorrect === false).length,
                            },
                            {
                              name: "Unanswered",
                              value: student.answers.filter((a) => !a.selectedOption).length,
                            },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {COLORS.map((color, i) => (
                            <Cell key={i} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} questions`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="card-title mb-3 text-uppercase small">Student vs Class Average</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          {
                            label: "Student",
                            score: student.score,
                            fill: "#007bff"
                          },
                          {
                            label: "Class Avg",
                            score: classAverage || 0,
                            fill: "#6c757d"
                          },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, student.totalMarks]} />
                        <Tooltip formatter={(value) => [`${value} points`, '']} />
                        <Bar dataKey="score" fill="#007bff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Question Breakdown - Last section as requested */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="p-3 border-bottom">
                  <h5 className="card-title mb-0 text-uppercase small">Question Breakdown</h5>
                  <p className="text-muted small mb-0 mt-1">Showing {student.answers.length} questions</p>
                </div>
                <div className="question-table-container">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th width="5%">#</th>
                        <th width="45%">Question</th>
                        <th width="20%">Selected</th>
                        <th width="15%">Correct</th>
                        <th width="15%">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.answers.map((ans, idx) => (
                        <tr
                          key={idx}
                          className={
                            !ans.selectedOption
                              ? "table-warning"
                              : ans.isCorrect
                              ? "table-success"
                              : "table-danger"
                          }
                        >
                          <td className="fw-medium">{idx + 1}</td>
                          <td className="text-truncate" style={{ maxWidth: '300px' }} title={ans.questionText || ans.questionId}>
                            {ans.questionText || ans.questionId}
                          </td>
                          <td>{ans.selectedOption || "—"}</td>
                          <td>
                            <span className={`badge ${ans.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                              {ans.isCorrect ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="fw-medium">{ans.marksObtained}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="border-top-0 bg-light">
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
        {!loading && student && (
          <>
            <Button variant="outline-primary">
              <i className="bi bi-chat me-2"></i>
              Give Feedback
            </Button>
            <Button variant="primary">
              <i className="bi bi-download me-2"></i>
              Download Report
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StudentAnalysisModal;