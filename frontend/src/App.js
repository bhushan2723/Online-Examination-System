import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from './pages/AuthPage';
import TeacherView from './pages/Teacher/TeacherView';
import StudentView from './pages/Student/StudentView';
import AdminView from './pages/Admin/AdminView';
import ExamWindow from './pages/Student/ExamWindow';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]}>
              <TeacherView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-window"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <ExamWindow />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;