import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ExamSubmissionModal from "./ExamSubmissionModal";
import ExamGuard from "./ExamGuard";
import CustomAlert from "./CustomAlert";
import "./ExamWindow.css";

// Utility to parse query params
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ExamWindow = () => {
  const query = useQuery();
  const examId = query.get("examId");
  const token = query.get("token");
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const hasStartedAttempt = useRef(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  // state for generic alert
  const [alertConfig, setAlertConfig] = useState({ message: "" });

  // ✅ Track answers and statuses
  const [answers, setAnswers] = useState([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);

   const handleFinalSubmit = async (isAuto = false, cheated = false) => {
    try {
      const attemptId = localStorage.getItem("attemptId");
      if (!attemptId) {
        alert("No active attempt found.");
        return;
      }

      const formattedAnswers = exam.questions.map((q, idx) => ({
        questionId: q.questionRef._id,
        selectedOption: answers[idx]?.answer || null,
      }));

      const res = await fetch(
        `http://localhost:5000/api/attempt/${attemptId}/submit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            answers: formattedAnswers,
            tabSwitchCount: tabSwitchCount,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      if (isAuto) {
        cheated // ❌ Cheating limit exceeded
          ? setAlertConfig({
              message:
                "Maximum tab switch attempts reached. Submitting exam...",
              type: "error",
              autoClose: true,
              duration: 5,
              closeWindow: true,
            }) // ⏰ Auto-submit
          : setAlertConfig({
              message: "Time is up! Exam auto-submitted.",
              type: "info",
              autoClose: true,
              duration: 5,
              closeWindow: true,
            });
      } else {
        setAlertConfig({
          message: "Exam submitted successfully!",
          type: "success",
          autoClose: true,
          duration: 5,
          closeWindow: true,
        });
      }
      // close window after 5 seconds
      setTimeout(() => {
        window.close();
      }, 5000);

      setShowSubmitModal(false);
      // optional redirect
      // navigate(`/exam-result/${exam._id}`);
    } catch (err) {
      console.error("❌ Error submitting exam:", err);
      setAlertConfig({
        message: "Failed to submit exam. Try again.",
        type: "success",
        autoClose: false,
        duration: 5,
        closeWindow: false,
      });
    }
  };

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      if (hasStartedAttempt.current) return; // prevent double call
      hasStartedAttempt.current = true;
      try {
        const res = await fetch(`http://localhost:5000/api/exams/${examId}`, {
          headers: { "x-auth-token": token },
        });
        if (!res.ok) throw new Error("Failed to load exam");
        const data = await res.json();
        setExam(data);

        // ✅ Start attempt
        const attemptRes = await fetch(
          `http://localhost:5000/api/attempt/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify({ examId }),
          }
        );
        const attemptData = await attemptRes.json();
        console.log("Attempt started:", attemptData);

        // Store attemptId for later updates/submission
        localStorage.setItem("attemptId", attemptData._id);

        // ✅ Initialize states: Q1 active, rest not-attempted
        const initialAnswers = data.questions.map((q, i) => ({
          answer: "",
          state: i === 0 ? "active" : "not-attempted",
        }));
        setAnswers(initialAnswers);

        // ✅ Compute time left from server's endTime
        const now = new Date();
        const end = new Date(data.endTime);
        let diff = Math.max(0, end - now); // ms left (no negatives)

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({ hours, minutes, seconds });
      } catch (err) {
        console.error(err);
        setExam(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, token]);
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (!prev) return prev;
      let { hours, minutes, seconds } = prev;

      if (seconds > 0) {
        seconds--;
      } else if (minutes > 0) {
        minutes--;
        seconds = 59;
      } else if (hours > 0) {
        hours--;
        minutes = 59;
        seconds = 59;
      } else {
        // Time is up
        clearInterval(timer);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return { hours, minutes, seconds };
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

useEffect(() => {
  if (
    timeLeft &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    handleFinalSubmit(true, false);
  }
}, [timeLeft]);


  useEffect(() => {
    if (exam && tabSwitchCount >= exam?.tabSwitchLimit) {
      handleFinalSubmit(true, true);
    } else {
      if (tabSwitchCount > 0) {
        // ⚠️ Warning (tab switch)
        setAlertConfig({
          message: `You cannot switch away. Attempts left: ${
            exam?.tabSwitchLimit - tabSwitchCount
          }`,
          type: "warning",
          autoClose: false,
          duration: 3,
          closeWindow: false,
        });
      }
    }
  }, [tabSwitchCount]);

  if (loading)
    return (
      <div className="exam-loading-container">
        <div className="exam-loading-spinner" role="status">
          <span className="visually-hidden">Loading exam...</span>
        </div>
        <p className="exam-loading-text">Preparing your exam...</p>
      </div>
    );

  if (!exam)
    return (
      <div className="exam-error-container">
        <div className="exam-error-alert">
          <i className="exam-error-icon fas fa-exclamation-circle"></i>
          <p>
            Failed to load exam. Please check your connection and try again.
          </p>
        </div>
      </div>
    );

  const question = exam.questions[currentQ].questionRef;

  // ✅ Selecting an option (preserves review state)
  const handleAnswer = (index, option) => {
    setAnswers((prev) => {
      const updated = [...prev];
      // Toggle the answer if the same option is clicked again
      const newAnswer = updated[index].answer === option ? "" : option;

      // Preserve the review state if it exists
      const currentState = updated[index].state;
      const newState = newAnswer
        ? currentState === "review"
          ? "review"
          : "answered"
        : currentState === "review"
        ? "review"
        : "not-answered";

      updated[index] = {
        ...updated[index],
        answer: newAnswer,
        state: newState,
      };
      return updated;
    });
  };

  // ✅ Toggle Mark for Review - now toggles between review and answered states
  const handleMarkReview = (index) => {
    setAnswers((prev) => {
      const updated = [...prev];
      // Toggle between review and answered states
      if (updated[index].state === "review") {
        updated[index] = {
          ...updated[index],
          state: updated[index].answer ? "answered" : "not-answered",
        };
      } else {
        updated[index] = {
          ...updated[index],
          state: "review",
        };
      }
      return updated;
    });
  };

  // ✅ Check if mark for review should be disabled
  const isMarkReviewDisabled = () => {
    return !answers[currentQ]?.answer;
  };

  // ✅ Get button text based on current state
  const getMarkReviewButtonText = () => {
    return answers[currentQ]?.state === "review"
      ? "Unmark Review"
      : "Mark for Review";
  };

  // ✅ Navigation button colors - active state takes priority
  const getButtonColor = (idx) => {
    const state = answers[idx]?.state;

    // If this is the current question, always show as active (blue)
    if (idx === currentQ) {
      return "legend-current";
    }

    // For other questions, use their actual state
    switch (state) {
      case "answered":
        return "legend-answered";
      case "not-answered":
        return "legend-not-answered";
      case "review":
        return "legend-review";
      case "not-attempted":
        return "legend-not-attempted";
      default:
        return "legend-not-attempted";
    }
  };

  const formatTime = (value) => (value < 10 ? `0${value}` : value);

  // ✅ Handle clicking a question box (preserves review state)
  const handleQuestionNavigation = (index) => {
    setAnswers((prev) => {
      const updated = prev.map((ans, i) => {
        if (i === currentQ) {
          // Update state based on whether an answer is selected, but preserve review state
          if (ans.state !== "review") {
            ans.state = ans.answer ? "answered" : "not-answered";
          }
        }
        if (i === index && ans.state != "review") {
          ans.state = "active";
        }
        return ans;
      });
      return [...updated];
    });
    setCurrentQ(index);
  };

  // ✅ Next / Prev buttons (preserves review state)
  const handleNextQuestion = () => {
    if (currentQ < exam.questions.length - 1) {
      // Update the current question state before moving
      setAnswers((prev) => {
        const updated = [...prev];
        if (updated[currentQ].state !== "review") {
          updated[currentQ] = {
            ...updated[currentQ],
            state: updated[currentQ].answer ? "answered" : "not-answered",
          };
        }
        return updated;
      });

      // Move to next question and set it as active
      setCurrentQ(currentQ + 1);
      setAnswers((prev) => {
        const updated = [...prev];
        if (updated[currentQ + 1].state != "review") {
          updated[currentQ + 1].state = "active";
        }
        return updated;
      });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQ > 0) {
      // Update the current question state before moving
      setAnswers((prev) => {
        const updated = [...prev];
        if (updated[currentQ].state !== "review") {
          updated[currentQ] = {
            ...updated[currentQ],
            state: updated[currentQ].answer ? "answered" : "not-answered",
          };
        }
        return updated;
      });

      // Move to previous question and set it as active
      setCurrentQ(currentQ - 1);
      setAnswers((prev) => {
        const updated = [...prev];
        if (updated[currentQ - 1].state != "review") {
          updated[currentQ - 1].state = "active";
        }
        return updated;
      });
    }
  };

  const handleSubmitTest = () => {
    setShowSubmitModal(true);
  };

 

  // Check if current question has an image
  const hasImage = question.imageUrl;

  const handleCustomAlertClose = (shouldCloseWindow) => {
    setAlertConfig({ message: "" }); // clear alert
    if (shouldCloseWindow) window.close();
  };

  return (
    <div className="exam-container">
      <CustomAlert
        config={alertConfig}
        onClose={handleCustomAlertClose}
      />
      {/* ✅ Exam Guard */}
      <ExamGuard setTabSwitchCount={setTabSwitchCount} />
      <div className="exam-content-wrapper">
        {/* Left main content */}
        <div className="exam-main-content">
          {/* Header */}
          <div className="exam-header">
            <h4>{exam.title}</h4>
          </div>

          {/* Question content */}
          <div className="exam-question-content">
            <div className="question-header">
              <h2 className="question-title">
                Question {currentQ + 1} of {exam.questions.length}
              </h2>
              <div className="question-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentQ + 1) / exam.questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="question-body">
              <p className="question-text">{question.questionText}</p>
              {/* Question image if available */}
              {hasImage && (
                <div className="question-image-container">
                  <img
                    src={question.imageUrl}
                    alt="Question illustration"
                    className="question-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              <form className="options-container">
                {/* Render binary options (True/False) if specified */}
                {question.type === "binary" ? (
                  <div className="binary-options">
                    <label className="option-label binary-option">
                      <input
                        type="radio"
                        className="option-checkbox"
                        name={question.id}
                        value="True"
                        checked={answers[currentQ]?.answer === "True"}
                        onChange={() => handleAnswer(currentQ, "True")}
                      />
                      <span className="option-text">True</span>
                    </label>
                    <label className="option-label binary-option">
                      <input
                        type="radio"
                        className="option-checkbox"
                        name={question.id}
                        value="False"
                        checked={answers[currentQ]?.answer === "False"}
                        onChange={() => handleAnswer(currentQ, "False")}
                      />
                      <span className="option-text">False</span>
                    </label>
                  </div>
                ) : (
                  // Regular multiple choice options
                  question?.options?.map((opt, idx) => (
                    <label key={idx} className="option-label">
                      <input
                        type="radio"
                        className="option-checkbox"
                        name={question.id}
                        value={opt}
                        checked={answers[currentQ]?.answer === opt}
                        onChange={() => handleAnswer(currentQ, opt)}
                      />
                      <span className="option-text">
                        {String.fromCharCode(65 + idx)}. {opt}
                      </span>
                    </label>
                  ))
                )}
              </form>
            </div>
          </div>

          {/* Footer buttons and legend */}
          <div className="exam-footer">
            <div className="footer-controls">
              <button
                type="button"
                className={`btn-mark-review ${
                  isMarkReviewDisabled() ? "disabled" : ""
                }`}
                onClick={() => handleMarkReview(currentQ)}
                disabled={isMarkReviewDisabled()}
              >
                <i
                  className={`fas ${
                    answers[currentQ]?.state === "review"
                      ? "fa-check-circle"
                      : "fa-flag"
                  }`}
                ></i>
                {getMarkReviewButtonText()}
              </button>
              <div className="navigation-buttons">
                <button
                  type="button"
                  className="btn-prev"
                  disabled={currentQ === 0}
                  onClick={handlePrevQuestion}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <button
                  type="button"
                  className="btn-next"
                  disabled={currentQ === exam.questions.length - 1}
                  onClick={handleNextQuestion}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <button
              type="button"
              className="btn-submit"
              onClick={handleSubmitTest}
            >
              <i className="fas fa-paper-plane"></i> Submit Test
            </button>
          </div>

          {/* Legend */}
          <div className="legend-container">
            <div className="legend-item">
              <span className="legend-color legend-current"></span>Current
            </div>
            <div className="legend-item">
              <span className="legend-color legend-not-attempted"></span>Not
              Attempted
            </div>
            <div className="legend-item">
              <span className="legend-color legend-answered"></span>Answered
            </div>
            <div className="legend-item">
              <span className="legend-color legend-not-answered"></span>Not
              Answered
            </div>
            <div className="legend-item">
              <span className="legend-color legend-review"></span>Review
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="exam-sidebar">
          {/* Time Left */}
          <div className="time-container">
            <div className="time-header">
              <i className="fas fa-clock"></i>
              <span>Time Remaining</span>
            </div>
            <div className="time-display">
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.hours)}</div>
                <div className="time-label">Hours</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.minutes)}</div>
                <div className="time-label">Minutes</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timeLeft.seconds)}</div>
                <div className="time-label">Seconds</div>
              </div>
            </div>
          </div>

          {/* Questions section */}
          <div className="questions-panel">
            <div className="sidebar-header">
              <h5>Question Navigator</h5>
            </div>
            <div className="questions-grid">
              {exam.questions.map((q, idx) => {
                const colorClass = getButtonColor(idx);
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`question-number ${colorClass}`}
                    onClick={() => handleQuestionNavigation(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ExamSubmissionModal
          show={showSubmitModal}
          exam={exam}
          answers={answers}
          onClose={() => setShowSubmitModal(false)}
          onConfirm={handleFinalSubmit}
        />
      </div>
    </div>
  );
};

export default ExamWindow;
