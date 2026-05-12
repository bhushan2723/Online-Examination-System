import { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import './FilterParamters.css'

const FilterParameters = ({setShowResults, setStudents}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    examId: "",
    studentName: "",
    minScore: "",
  });

  const [exams, setExams] = useState([]); // ✅ store fetched exams
  const [loadingExams, setLoadingExams] = useState(false);

  // ✅ Fetch exams created by teacher on mount
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/exams", {
          headers: { "x-auth-token": token },
        });

        if (!res.ok) throw new Error("Failed to fetch exams");

        const data = await res.json();
        setExams(data || []); // expecting { exams: [...] }
      } catch (err) {
        console.error("❌ Exam fetch error:", err);
        setError("Could not load exams");
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      examId: "",
      studentName: "",
      minScore: "",
    });
    setStudents([]);
    setShowResults(false);
    setError(null);
  };

  const applyFilter = async () => {
    if (!filters.examId && !filters.studentName && !filters.minScore) {
      setError("Please select at least one filter before applying.");
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams(filters).toString();

      const res = await fetch(`http://localhost:5000/api/progress?${query}`, {
        headers: { "x-auth-token": token },
      });

      if (!res.ok) throw new Error("Failed to fetch student progress");

      const data = await res.json();
      setStudents(data.students || []);
      setShowResults(true);
    } catch (err) {
      console.error("❌ Progress fetch error:", err);
      setError("Could not load progress data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Filter Parameters</h5>
          <Row className="g-3">
            {/* ✅ Dynamic Exam Dropdown */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Exam</Form.Label>
                {loadingExams ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Form.Select
                    name="examId"
                    className="scrollable-select"
                    value={filters.examId}
                    onChange={handleFilterChange}
                    size={5}
                  >
                    <option value="">-- All Exams --</option>
                    {exams.map((exam) => (
                      <option key={exam._id} value={exam._id}>
                        {exam.title}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Student</Form.Label>
                <Form.Control
                  type="text"
                  name="studentName"
                  placeholder="Search by student name"
                  value={filters.studentName}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Min Score (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="minScore"
                  placeholder="e.g. 50"
                  value={filters.minScore}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <div className="d-flex justify-content-end mt-3" style={{ gap: "10px" }}>
            <Button variant="outline-secondary" onClick={clearFilters}>
              <i className="fa fa-times me-2"></i>Clear Filters
            </Button>
            <Button variant="primary" onClick={applyFilter} disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading...
                </>
              ) : (
                <>
                  <i className="fa fa-filter me-2"></i>Apply Filter
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default FilterParameters;
