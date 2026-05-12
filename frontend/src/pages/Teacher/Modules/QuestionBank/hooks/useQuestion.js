// useQuestion.js
import { useState, useEffect } from "react";

const useQuestion = (moduleId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState({
    show: false,
    existing: null,
    attempted: null,
    questionNumber: null,
    message: null,
  });
  const [successInfo, setSuccessInfo] = useState({
    show: false,
    message: "",
    questionNumber: null,
  });

  // Fetch questions
  // Get authentication token
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Extract the fetch logic into a reusable function
  const fetchQuestionsData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(
        `http://localhost:5000/api/questions?moduleId=${moduleId}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch questions");
      }

      const data = await res.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions on mount and when moduleId changes
  useEffect(() => {
    if (moduleId) fetchQuestionsData();
  }, [moduleId]);

  const addQuestion = async (newQuestionData) => {
    // 1️⃣ Basic validation
    if (!newQuestionData.questionText?.trim() || !newQuestionData.answer) {
      setDuplicateInfo({
        show: true,
        message: "Please provide a valid question and answer.",
      });
      return false;
    }

    // 2️⃣ Normalize question text for duplicate check
    const normalizeText = (text) =>
      text
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[?!.]+$/, "") || "";

    const newNormalized = normalizeText(newQuestionData.questionText);

    // 3️⃣ Duplicate check (ignore self if updating)
    const duplicateIndex = questions.findIndex(
      (q) =>
        normalizeText(q.questionText) === newNormalized &&
        q._id !== newQuestionData.questionId
    );

    if (duplicateIndex !== -1) {
      setDuplicateInfo({
        show: true,
        questionNumber: duplicateIndex + 1,
        existing: questions[duplicateIndex].questionText,
        attempted: newQuestionData.questionText,
      });
      return false;
    }

    // 4️⃣ Check if answer matches one of the options
    const correctOptionIndex = newQuestionData.options.findIndex(
      (opt) => opt === newQuestionData.answer
    );

    if (correctOptionIndex === -1) {
      setDuplicateInfo({
        show: true,
        message: "Correct answer must match one of the options.",
      });
      return false;
    }

    // 5️⃣ Prepare FormData for POST or PUT
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("questionText", newQuestionData.questionText || "");
      formData.append("marks", (newQuestionData.marks || 1).toString());
      formData.append("correctOptionIndex", correctOptionIndex.toString());
      formData.append("options", JSON.stringify(newQuestionData.options || []));
      formData.append("moduleId", moduleId || newQuestionData.moduleId || "");
      if (newQuestionData.paperId)
        formData.append("paperId", newQuestionData.paperId);
      if (newQuestionData.imageFile)
        formData.append("image", newQuestionData.imageFile);
      if (newQuestionData.imageUrl)
        formData.append("imageUrl", newQuestionData.imageUrl);

      let res;

      if (newQuestionData.questionId) {
        // UPDATE existing question
        res = await fetch(
          `http://localhost:5000/api/questions/${newQuestionData.questionId}`,
          {
            method: "PUT",
            headers: {
             "x-auth-token": localStorage.getItem('token'), // replace with your actual token
            },
            body: formData,
          }
        );
      } else {
        // ADD new question
        res = await fetch("http://localhost:5000/api/questions", {
          method: "POST",
          headers: {
            "x-auth-token": localStorage.getItem('token'), // replace with your actual token
          },
          body: formData,
        });
      }


      const savedQuestion = await res.json();

      if (!res.ok) throw new Error("Failed to save question");


      // 6️⃣ Update state
      setQuestions((prev) => {
        if (newQuestionData.questionId) {
          // Replace updated question
          return prev.map((q) =>
            q._id === savedQuestion._id ? savedQuestion : q
          );
        } else {
          return [...prev, savedQuestion];
        }
      });

      // 7️⃣ Show success notification
      setSuccessInfo({
        show: true,
        message: newQuestionData.questionId
          ? "Question updated successfully!"
          : "Question added successfully!",
        questionNumber: newQuestionData.questionId
          ? questions.findIndex((q) => q._id === newQuestionData.questionId) + 1
          : questions.length + 1,
      });

      setTimeout(() => {
        setSuccessInfo({ show: false, message: "", questionNumber: null });
      }, 3000);

      return savedQuestion;
    } catch (err) {
      console.error("Failed to save question:", err);
      setDuplicateInfo({
        show: true,
        message: "Failed to save question. Please try again.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete questions in bulk
  const deleteQuestions = async (questionIds) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/questions/bulk-delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "x-auth-token": localStorage.getItem('token') },
          body: JSON.stringify({ ids: questionIds }),
        }
      );

      if (res.ok) {
        setQuestions((prev) =>
          prev.filter((q) => !questionIds.includes(q._id))
        );
        return true;
      } else {
        const error = await res.json();
        throw new Error(error.message || "Error deleting questions");
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  //Toggle Archieved Questions

  const toggleArchiveQuestions = async (questionIds, archive) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/questions/archive-toggle",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-auth-token": localStorage.getItem('token') },
          body: JSON.stringify({ questionIds, archive }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error toggling archive status");
      }

      // Refresh questions after archive operation
      await fetchQuestionsData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Reset duplicate info
  const resetDuplicateInfo = () => {
    setDuplicateInfo({
      show: false,
      existing: null,
      attempted: null,
      questionNumber: null,
      message: null,
    });
  };

  // Reset success info
  const resetSuccessInfo = () => {
    setSuccessInfo({
      show: false,
      message: "",
      questionNumber: null,
    });
  };

  return {
    questions,
    loading,
    error,
    isSaving,
    duplicateInfo,
    successInfo,
    toggleArchiveQuestions,
    setQuestions,
    addQuestion,
    deleteQuestions,
    resetDuplicateInfo,
    resetSuccessInfo,
  };
};

export default useQuestion;
