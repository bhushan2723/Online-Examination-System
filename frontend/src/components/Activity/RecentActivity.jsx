
const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div
        className="no-activities text-center p-3"
        style={{
          color: "#6b7280",
          fontStyle: "italic",
          border: "1px dashed #d1d5db",
          borderRadius: "8px",
        }}
      >
        No recent activities recorded.
      </div>
    );
  }

  return (
    <div
      className="activity-feed"
      style={{ maxHeight: "210px", overflowY: "auto" }}
    >
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="activity-item border-bottom pb-3 mb-3"
        >
          <div className="d-flex justify-content-between">
            <span className="fw-semibold">
              You {activity.action} the {activity.entityType}: "
              {activity.entityName}"
            </span>
            <span className="text-muted small">
              {new Date(activity.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              ,{" "}
              {new Date(activity.timestamp).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
