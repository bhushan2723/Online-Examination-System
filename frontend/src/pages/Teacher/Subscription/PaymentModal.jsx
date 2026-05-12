import { useState } from "react";
import { Modal, Button, Form, Alert, Tab, Nav } from "react-bootstrap";

const PaymentModal = ({ show, handleClose, plan, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentStatus, setPaymentStatus] = useState("form"); // form, processing, success, error
  const [formData, setFormData] = useState({
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentStatus("processing");

    try {
      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // After success -> call backend to save subscription
      const response = await fetch("http://localhost:5000/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ plan: plan.name }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      const data = await response.json();

      setPaymentStatus("success");

      // Auto-close after delay
      setTimeout(() => {
        handleClose();
        setPaymentStatus("form");
        setFormData({
          upiId: "",
          cardNumber: "",
          cardName: "",
          expiryDate: "",
          cvv: "",
        });
        onPaymentSuccess();
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("error");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Subscription</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {paymentStatus === "success" ? (
          <div className="text-center py-4">
            <div className="success-animation">
              <svg
                className="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  className="checkmark__circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  className="checkmark__check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <h4 className="text-success mt-3">Payment Successful!</h4>
            <p>
              Your subscription to <strong>{plan?.name}</strong> is now active.
            </p>
          </div>
        ) : paymentStatus === "processing" ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <h4>Processing Payment</h4>
            <p>Please wait while we process your payment.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
              <div>
                <h5 className="mb-1">Selected Plan</h5>
                <p className="mb-0 text-primary fw-bold">{plan?.name}</p>
              </div>
              <div className="text-end">
                <h4 className="mb-0 text-primary">{plan?.price}</h4>
                <small className="text-muted">/{plan?.period}</small>
              </div>
            </div>

            <Tab.Container
              activeKey={paymentMethod}
              onSelect={(k) => setPaymentMethod(k)}
            >
              <Nav variant="pills" className="justify-content-center mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="upi">UPI</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="card">Debit/Credit Card</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="upi">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>UPI ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="yourname@upi"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Enter your UPI ID (e.g., name@ybl, name@okicici)
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="primary" type="submit" size="lg">
                        Pay {plan?.price} via UPI
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>

                <Tab.Pane eventKey="card">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Cardholder Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="John Doe"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="MM/YY"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>CVV</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="123"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <div className="d-grid">
                      <Button variant="primary" type="submit" size="lg">
                        Pay {plan?.price}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>

            <div className="mt-3 text-center">
              <small className="text-muted">
                <i className="bi bi-shield-check me-1"></i>
                Your payment details are secure and encrypted
              </small>
            </div>
          </>
        )}
      </Modal.Body>

      <style jsx>{`
        .success-animation {
          margin: 0 auto;
        }

        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 5;
          stroke: #4bb71b;
          stroke-miterlimit: 10;
          box-shadow: 0 0 15px #4bb71b;
          animation: fill 0.4s ease-in-out 0.4s forwards,
            scale 0.3s ease-in-out 0.9s both;
          margin: 0 auto;
        }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 5;
          stroke-miterlimit: 10;
          stroke: #4bb71b;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%,
          100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: 0 0 0 30px rgba(255, 255, 255, 0) inset;
          }
        }
      `}</style>
    </Modal>
  );
};

export default PaymentModal;
