import { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";

const StudentTab = ({ selectedExam }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch registered students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/exam-registration/exam/${selectedExam?.id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token")
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Unregister a student (Teacher side)
  const handleUnregister = async (studentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/exam-registration/${selectedExam?.id}/students/${studentId}/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to unregister student");
      }

      // Refresh student list after successful unregister
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

    useEffect(() => {
    if (selectedExam && selectedExam.id) {
        fetchStudents();
    }
    }, [selectedExam]);


  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "200px" }}
      >
        <Spinner animation="border" role="status" />
        <span className="mt-2">Loading registered students...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center text-muted" style={{ minHeight: "200px" }}>
        <div style={{ fontSize: "2rem" }}>👥</div>
        <p>No students registered for this exam.</p>
      </div>
    );
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((reg) => (
          <tr key={reg._id}>
            <td>{reg.studentId?.name || "N/A"}</td>
            <td>{reg.studentId?.email || "N/A"}</td>
            <td>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleUnregister(reg.studentId?._id)}
              >
                Unregister
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default StudentTab;
