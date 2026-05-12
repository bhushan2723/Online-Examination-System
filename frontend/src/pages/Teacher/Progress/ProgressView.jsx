import { useState } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import FilterParameters from "./FilterParameters";
import StudentList from "./StudentList";

const ProgressView = () => {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="p-4" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* ✅ Header */}
      <div className="header-container mb-4">
        <h3>Student Progress</h3>
      </div>

      <FilterParameters setShowResults={setShowResults} setStudents={setStudents}/>

      {/* ✅ Results Section */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!showResults && !loading && !error && (
        <Card className="shadow-sm h-100">
          <Card.Body className="text-center text-muted d-flex flex-column justify-content-center align-items-center mb-2">
            <i className="fa fa-search fa-2x mb-3"></i>
            <h5>No filters applied</h5>
            <p>
              Use the filter options above to select an exam, student, or minimum score.  
              Then click <strong>Apply Filter</strong> to view student progress.
            </p>
          </Card.Body>
        </Card>
      )}

      {showResults && !loading && !error && (
        <Card className="shadow-sm">
          <Card.Body>
            <StudentList students={students} />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ProgressView;
