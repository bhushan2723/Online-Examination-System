import "./ExamStatusCard.css";

const ExamStatusCard = ({
  examId = "A",
  title = "Physics - CE 1",
  status = "Upcoming", // "Upcoming" | "Active" | "Completed"
  statusVariant,
  dateRange,
  timeRange,
  totalQuestions = 25,
  totalMarks = 50,

  modulesCovered = ["Maths", "Physics"],
  attemptedCount = 0,
  submittedCount = 0,

  // UI helpers
  maxWidth = "350px",
  onCardClick = null,
  showChevron = true,
  showFooter = true,
}) => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div
        className="card shadow-sm status-card"
        style={{ maxWidth, width: "100%" }}
        onClick={onCardClick || undefined}
        role={onCardClick ? "button" : undefined}
      >
        <div className={`top-bar bg-${statusVariant}`}></div>
        <div className="card-body p-3">
          <h3 className="card-title fs-6 fw-semibold mb-1 text-dark title-ellipsis">
            {title}
          </h3>
          <div className="card-timings d-flex justify-content-between">
            <div className="card-date-range">
              <p className="mb-1 text-secondary small">Test Date :</p>
              <p className="mb-3 text-dark small">{dateRange}</p>
            </div>
            <div className="card-time-range">
              <p className="mb-1 text-secondary small">Test Time :</p>
              <p className="mb-3 text-dark small">{timeRange}</p>
            </div>
          </div>

          <div className="d-inline-flex align-items-center justify-content-between w-100">
            {showFooter ? (
              <>
                <div>
                  <span
                    className={`badge bg-${statusVariant}-subtle text-${statusVariant} status-badge`}
                  >
                    {status}
                  </span>
                  {showChevron && (
                    <i className="fas fa-chevron-right ms-2 text-secondary"></i>
                  )}
                </div>
                <span className="badge rounded-pill bg-info">
                  {totalMarks} Marks
                </span>
              </>
            ) :<div>
                  <span
                    className={`badge bg-${statusVariant}-subtle text-${statusVariant} status-badge`}
                  >
                    {status}
                  </span>
                  {showChevron && (
                    <i className="fas fa-chevron-right ms-2 text-secondary"></i>
                  )}
                </div> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamStatusCard;
