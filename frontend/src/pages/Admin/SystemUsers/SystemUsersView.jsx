import { useState, useEffect } from "react";
import { Dropdown, DropdownButton, Table, Button, Nav } from "react-bootstrap";
import SuccessNotification from "../../Teacher/Modules/QuestionBank/SuccessNotification";
import RejectModal from "./RejectModal";
import DocumentViewer from "./DocumentViewer";
import "./SystemUsersView.css";

const SystemUsersView = () => {
  const [roleFilter, setRoleFilter] = useState("Teachers");
  const [statusTab, setStatusTab] = useState("Active");
  const [users, setUsers] = useState([]); // <-- fetched data
  const [loading, setLoading] = useState(true);
  const [successInfo, setSuccessInfo] = useState({ show: false, message: "" });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on role + status
  const filteredUsers = users.filter((u) => {
    if (roleFilter === "Teachers") {
      return u.role === "Teacher" && u.status === statusTab;
    }
    if (roleFilter === "Students") {
      return u.role === "Student" && u.status === "Active";
    }
    return false;
  });

  const counts = {
    activeTeachers: users.filter(
      (u) => u.role === "Teacher" && u.status === "Active"
    ).length,
    underReviewTeachers: users.filter(
      (u) => u.role === "Teacher" && u.status === "Under Review"
    ).length,
    rejectedTeachers: users.filter(
      (u) => u.role === "Teacher" && u.status === "Rejected"
    ).length,
    activeStudents: users.filter(
      (u) => u.role === "Student" && u.status === "Active"
    ).length,
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      // Show notification
      setSuccessInfo({ show: true, message: "Teacher approved successfully!" });

      // Refresh users after short delay (optional)
      setTimeout(async () => {
        const res = await fetch("http://localhost:5000/api/users");
        setUsers(await res.json());
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "Active":
        return "success"; // green
      case "Under Review":
        return "warning text-dark"; // yellow
      case "Rejected":
        return "danger"; // red
      default:
        return "secondary"; // gray for unknown
    }
  };

  const handleSuspend = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Under Review" }),
      });

      setSuccessInfo({
        show: true,
        message: "Teacher suspended successfully!",
      });

      // Refresh users
      const res = await fetch("http://localhost:5000/api/users");
      setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToReview = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}/reconsider`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      // Show success notification
      setSuccessInfo({
        show: true,
        message: "Teacher moved back to Under Review!",
      });

      // Refresh user list
      const res = await fetch("http://localhost:5000/api/users");
      setUsers(await res.json());
    } catch (err) {
      console.error("Error moving teacher to Under Review:", err);
    }
  };

  return (
    <div className="teacher-dashboard container-fluid flex-grow-1" style={{backgroundColor:"aliceblue"}}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold m-0">System Users</h1>
        <DropdownButton
          id="role-filter"
          variant="outline-secondary"
          title={roleFilter}
          onSelect={(val) => {
            if (val) {
              setRoleFilter(val);
              setStatusTab("Active");
            }
          }}
        >
          <Dropdown.Item eventKey="Teachers">Teachers</Dropdown.Item>
          <Dropdown.Item eventKey="Students">Students</Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Status Tabs */}
      <div className="mb-3">
        {roleFilter === "Teachers" ? (
          <Nav
            variant="tabs"
            activeKey={statusTab}
            onSelect={(k) => setStatusTab(k)}
          >
            <Nav.Item>
              <Nav.Link eventKey="Active">
                Active ({counts.activeTeachers})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Under Review">
                Under Review ({counts.underReviewTeachers})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Rejected">
                Rejected ({counts.rejectedTeachers})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        ) : (
          <Nav variant="tabs" activeKey="Active">
            <Nav.Item>
              <Nav.Link eventKey="Active">
                Active ({counts.activeStudents})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-container">
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                    textAlign: "center",
                  }}
                >
                  Role
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                    textAlign: "center",
                  }}
                >
                  Status
                </th>
                {statusTab == "Rejected" && (
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#f8f9fa",
                      zIndex: 1,
                      textAlign: "center",
                    }}
                  >
                    Reason
                  </th>
                )}

                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                    textAlign: "center",
                  }}
                >
                  Registered On
                </th>
                {roleFilter == "Teachers" && (
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#f8f9fa",
                      zIndex: 1,
                      textAlign: "center",
                    }}
                  >
                    Documents Uploaded
                  </th>
                )}
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                    textAlign: "center",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td style={{ textAlign: "center" }}>{user.role}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge bg-${statusBadge(user.status)}`}>
                        {user.status || "Under Review"}
                      </span>
                    </td>
                    {statusTab == "Rejected" && (
                      <td style={{ textAlign: "center" }}>
                        {user.rejectionReason}
                      </td>
                    )}
                    <td style={{ textAlign: "center" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    {roleFilter == "Teachers" && (
                      <td style={{ textAlign: "center" }}>
                        <DocumentViewer
                          path={`http://localhost:5000/uploads/teacherIds/${user.teacherIdFile}`}
                        />
                      </td>
                    )}
                    <td style={{ textAlign: "center" }}>
                      {roleFilter === "Teachers" ? (
                        <>
                          {user.status === "Under Review" || !user.status ? (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                className="me-2"
                                onClick={() => handleApprove(user._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          ) : user.status === "Active" ? (
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleSuspend(user._id)}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleMoveToReview(user._id)}
                            >
                              Move to Review
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button size="sm" variant="outline-primary">
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <SuccessNotification
        successInfo={successInfo}
        onClose={() => setSuccessInfo({ show: false, message: "" })}
      />

      <RejectModal
        show={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        userName={selectedUser?.name}
        onSubmit={async (reason) => {
          try {
            await fetch(
              `http://localhost:5000/api/users/${selectedUser._id}/reject`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              }
            );

            setSuccessInfo({
              show: true,
              message: "Teacher rejected successfully!",
            });
            setShowRejectModal(false);

            // Refresh users
            const res = await fetch("http://localhost:5000/api/users");
            setUsers(await res.json());
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
};

export default SystemUsersView;
