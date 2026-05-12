import "./ExamResultCard.css";

const ExamResultCard = ({ exam, counts, avgScore }) => {
  if (!exam || !counts) return null;

  // Helper function to format the icon circles
  const renderIconCircle = (bgColor, icon) => (
    <div className={`icon-circle ${bgColor} me-3`}>
      <i className={icon}></i>
    </div>
  );

  // Stats items configuration
  const statItems = [
    {
      key: "totalRegistered",
      title: "Total Registered Students",
      icon: "fas fa-user",
      bgClass: "bg-blue",
      value: counts.totalRegistered,
    },
    {
      key: "totalPresent",
      title: "Total Present Students",
      icon: "fas fa-check-circle",
      bgClass: "bg-cyan",
      value: counts.totalPresent,
    },
    {
      key: "totalAbsent",
      title: "Total Absent Students",
      icon: "fas fa-info-circle",
      bgClass: "bg-yellow",
      value: counts.totalAbsent,
    },
    {
      key: "totalPass",
      title: "Total Passed Students",
      icon: "fas fa-check-double",
      bgClass: "bg-lime",
      value: counts.totalPass,
    },
    {
      key: "totalFail",
      title: "Total Failed Students",
      icon: "fas fa-times-circle",
      bgClass: "bg-red",
      value: counts.totalFail,
    },
    {
      key: "averageScore",
      title: "Average Score",
      icon: "far fa-star",
      bgClass: "bg-gray",
      value: avgScore,
    },
  ];

  return (
    <div className="container mt-4 mb-3 ps-0 pe-0">
      <div className="card border border-1 rounded shadow-sm p-4">
        {/* Header Section */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3">
          <div className="d-flex flex-column align-items-start">
            <h1 className="h5 fw-normal mb-1 text-dark">
              {exam.title}
            </h1>
            <p className="text-secondary small mb-1">Course: General Course</p>
            <p className="text-secondary small mb-0">
              {exam.numberOfQuestions} Questions
            </p>
          </div>
          <div className="text-end text-secondary small mt-3 mt-sm-0">
            <div>
              {/* If you later include exam.startTime / endTime in response, format here */}
              Duration: {exam.duration} minutes
            </div>
            <div className="d-inline-flex gap-2 mt-2 justify-content-end flex-wrap">
              <div className="d-flex align-items-center gap-1 border border-secondary rounded px-2 py-1 text-secondary small">
                <i className="far fa-clock"></i>
                <span>{exam.duration} Min</span>
              </div>
              <div className="d-flex align-items-center gap-1 border border-secondary rounded px-2 py-1 text-secondary small">
                <i className="fas fa-file-alt"></i>
                <span>
                  {exam.totalMarks} (Pass marks: {exam.passMark})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-3">
          {statItems.map((item) => (
            <div key={item.key} className="col-12 col-md-4">
              <div className="d-flex align-items-center border border-1 rounded p-3">
                {renderIconCircle(item.bgClass, item.icon)}
                <div>
                  <p className="small text-secondary mb-1">{item.title}</p>
                  <p className="h5 mb-0 text-dark">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamResultCard;
