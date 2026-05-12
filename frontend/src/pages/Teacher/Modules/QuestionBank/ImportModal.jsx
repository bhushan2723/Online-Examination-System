// ImportModal.js
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Alert, ButtonGroup, Dropdown } from "react-bootstrap";
import QuestionTable from "./QuestionTable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./ImportModal.css";

export default function ImportModal({
  disabled,
  selectedModule,
  onImport, // callback when user confirms import
  addQuestion, // API hook
}) {
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [invalidQuestions, setInvalidQuestions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    show: false,
    message: "",
    questionCount: 0,
  });

  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger' | 'warning', message: string }

  // For file input ref
  const fileInputRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (showImportModal) {
      setSelectedQuestionIds([]);
      setExpandedRow(null);
      // Show alert with summary
      if (invalidQuestions.length > 0) {
        setAlert({
          type: "warning",
          message: (
            <div>
              <p>
                ✅ {importedQuestions.length} question(s) loaded successfully
                <br />❌ {invalidQuestions.length} question(s) failed:
              </p>
              <ul style={{ marginBottom: 0 }}>
                {invalidQuestions.map((err, i) => (
                  <li key={i}>
                    Row {err.row}: {err.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      } else {
        setAlert({
          type: "success",
          message: `✅ Successfully loaded ${importedQuestions.length} question(s) from Excel`,
        });
      }
    }
  }, [showImportModal]);

  // ✅ Select/deselect a single question
  const toggleSelectQuestion = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // ✅ Select/deselect all questions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestionIds(importedQuestions.map((q) => q._id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const handleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const selectedQuestions = importedQuestions.filter((q) =>
    selectedQuestionIds.includes(q._id)
  );

  // ✅ Validation logic before import
  const validateQuestions = (questions) => {
    const validQuestions = [];
    const invalidQuestions = [];

    questions.forEach((q, idx) => {
      const rowErrors = [];
      if (!q.questionText || q.questionText.trim() === "") {
        rowErrors.push("Missing question text");
      }
      if (q.correctOptionIndex === null) {
        rowErrors.push("Invalid or missing correct option");
      }
      if (
        !q.options ||
        !q.options || q.options.filter((opt) => (opt + "").trim() !== "").length < 2
      ) {
        rowErrors.push("At least 2 options required");
      }

      if (rowErrors.length > 0) {
        invalidQuestions.push({ row: idx + 2, errors: rowErrors }); // +2 = account for header row + 1-based index
      } else {
        validQuestions.push(q);
      }
    });

    return { validQuestions, invalidQuestions };
  };

  const handleImport = async () => {
    try {
      for (const q of selectedQuestions) {
        await addQuestion(q);
      }
      onImport?.(selectedQuestions);

      // Auto-dismiss success after 3s
      setTimeout(() => {
        setAlert(null);
        setShowImportModal(false);
      }, 3000);
    } catch (err) {
      setAlert({
        type: "danger",
        message: "An unexpected error occurred while importing questions.",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/template/download-template`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!res.ok) throw new Error("Failed to download template");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Fixed filename since it’s a template
      link.setAttribute("download", "QuestionTemplate.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("❌ Template download failed:", err);
      alert("Could not download question template");
    }
  };


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // Use the 1st sheet (index 0) since the second is instructions
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

const parsedQuestions = rows.map((row, idx) => {
  const options = [
    (row["Option A *"].toString() || "").trim(),
    (row["Option B *"].toString() || "").trim(),
    (row["Option C"].toString() || "").trim(),
    (row["Option D"].toString() || "").trim(),
  ];

  const correctOptionLetter = (row["Correct Option *"] || "").toString().trim().toUpperCase();
  const correctOptionIndex = { A:0, B:1, C:2, D:3 }[correctOptionLetter] ?? 0;
  const correctAnswer = options[correctOptionIndex] || "";

  return {
    _id: idx,
    questionText: (row["Question Text *"] || "").toString().trim(),
    options,
    answer: correctAnswer,
    correctOptionIndex: correctOptionIndex,
    marks: Number(row["Marks"]) || 1,
    imageUrl: row["ImageUrl"] || "",
    moduleId: selectedModule._id,
  };
});

    const validatedQuestions = validateQuestions(parsedQuestions);

    setImportedQuestions(validatedQuestions.validQuestions);
    setInvalidQuestions(validatedQuestions.invalidQuestions);
    setShowImportModal(true);
  };

  return (
    <>
      <Dropdown as={ButtonGroup}>
        {/* Upload button */}
        <Button
          variant="outline-secondary"
          onClick={() => fileInputRef.current.click()}
          disabled={disabled}
        >
          <i className="fa fa-upload me-2"></i>Upload
        </Button>

        {/* Dropdown arrow */}
        <Dropdown.Toggle
          split
          variant="outline-secondary"
          id="upload-dropdown"
        />

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleDownloadTemplate}>
            <i className="fa fa-download me-2"></i>Download Template
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* Hidden file input */}
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          handleFileChange(e);
          // Reset input so onChange will trigger even if same file is picked again
          e.target.value = "";
        }}
      />
      <Modal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Questions from Excel</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {alert && (
            <Alert
              variant={alert.type}
              onClose={() => setAlert(null)}
              dismissible
              className="mb-3"
            >
              {alert.message}
            </Alert>
          )}

          <QuestionTable
            questions={importedQuestions}
            selectedQuestionIds={selectedQuestionIds}
            onSelect={toggleSelectQuestion}
            onSelectAll={handleSelectAll}
            onExpand={handleExpand}
            expandedRow={expandedRow}
            showEdit={false}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={selectedQuestionIds.length === 0}
            onClick={handleImport}
          >
            Import Selected ({selectedQuestionIds.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
