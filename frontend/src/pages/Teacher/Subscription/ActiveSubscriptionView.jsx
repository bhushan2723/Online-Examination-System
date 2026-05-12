// ActiveSubscriptionView.jsx
import { Card, Badge, Button } from "react-bootstrap";
import { format } from "date-fns"; // for nice date formatting

const ActiveSubscriptionView = ({subscription, onChangePlan}) => {
  
  return (
    <div className="p-4 d-flex flex-column">
      {/* Header */}
      <div className="header-container mb-2">
        <h2 className="h3">Active Plan</h2>
        <p className="text-muted">
          All benefits unlocked — make the most of your subscription.
        </p>
      </div>
      <Card
        className="shadow-lg border-0"
        style={{
          maxWidth: "600px",
          maxHeight: "350px",
          borderRadius: "16px",
        }}
      >
        <Card.Body className="p-4">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">{subscription.plan}</h3>
            <Badge
              bg={
                subscription.status === "Active"
                  ? "success"
                  : subscription.status === "Expired"
                  ? "secondary"
                  : "danger"
              }
              className="px-3 py-2"
              style={{ fontSize: "0.9rem" }}
            >
              {subscription.status}
            </Badge>
          </div>

          {/* Plan Details */}
          <p className="text-muted mb-4">
            Your current subscription gives you full access to{" "}
            <strong>{subscription.plan} features</strong>. Manage your
            subscription below.
          </p>

          <div className="row text-center mb-4 border rounded p-3">
            <div className="col-6">
              <h6 className="text-muted">Start Date</h6>
              <p className="fw-semibold mb-0">
                {format(new Date(subscription.startDate), "dd MMM yyyy")}
              </p>
            </div>
            <div className="col-6">
              <h6 className="text-muted">Valid Until</h6>
              <p className="fw-semibold mb-0">
                {format(new Date(subscription.endDate), "dd MMM yyyy")}
              </p>
            </div>
          </div>

          {/*Footer section*/}
          <div className="d-flex flex-row justify-content-between align-items-center">
            {/* Transaction Info */}
            <div className="mb-4">
              <h6 className="text-muted">Transaction ID</h6>
              <p className="fw-monospace mb-0">{subscription.transactionId}</p>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={onChangePlan}>Change Plan</Button>
              <Button variant="outline-danger">Cancel Subscription</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ActiveSubscriptionView;
