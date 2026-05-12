// ExamView.jsx
import { useState } from "react";
import ManageExam from "./ManageExam";
import ExamForm from "./ExamForm";

const ExamView = () => {
  const [activeView, setActiveView] = useState("manage"); // default view
  const [selectedExam, setSelectedExam] = useState(null);

  const handleEdit = (exam) =>{
    setSelectedExam(exam)
    setActiveView("edit")
  }

  return (
    <>
      {activeView === "manage" && <ManageExam onCreate={() => setActiveView("create")} onEdit={handleEdit}/>}
      {activeView === "create" && <ExamForm onBack={() => setActiveView("manage")} />}
      {activeView === "edit" && <ExamForm onBack={() => setActiveView("manage")} examToEdit={selectedExam} />}
    </>
  );
};

export default ExamView;
