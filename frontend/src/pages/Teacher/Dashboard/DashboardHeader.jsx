import { Alert, Button } from "react-bootstrap";

const DashboardHeader = ({ username, isSubscribed = true, setActiveView }) => {
  return (
    <div className="d-flex justify-content-start align-items-center mb-4 gap-4">
      {/* Welcome Message */}
      <h1 className="h3 fw-bold m-0" data-cy="welcome-message">
        Welcome back {username} 👋
      </h1>

      {/* Notifications / Actions */}
      <div style={{flexGrow:"1"}}>
        {!isSubscribed && (
          <Alert
            variant="warning"
            dismissible
            className="d-flex align-items-center justify-content-between gap-3 shadow-sm mb-0"
            style={{
              borderRadius: "12px",
              padding: "0.5rem 1rem",
            }}
          >
            {/* Inline message */}
            <span className="mb-0">
              <strong>No Active Subscription!</strong>{" "}
              <span className="text-muted">Subscribe now to unlock premium features.</span>
            </span>

            {/* Inline button */}
            <Button size="sm" variant="primary" className="me-5" onClick={()=>{setActiveView('subscription')}}>
              Subscribe
            </Button>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
