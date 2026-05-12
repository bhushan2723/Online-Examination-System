import { useState, useEffect } from "react";
import PaymentView from "./PaymentView";
import ActiveSubscriptionView from "./ActiveSubscriptionView";

const SubscriptionView = () => {
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  // Fetch subscription from API
  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/subscriptions/me", {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch subscription");

      const data = await res.json();

      if (data.subscription) {
        const sub = data.subscription;
        setActiveSubscription({
          plan: sub.plan,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
          transactionId: sub.transactionId,
          description:
            sub.plan === "Basic"
              ? "Essential tools for starters"
              : sub.plan === "Pro"
              ? "Best value for dedicated educators"
              : "Enterprise-level features",
          price:
            sub.plan === "Basic"
              ? "INR 999"
              : sub.plan === "Pro"
              ? "INR 1999"
              : "INR 4999",
          period: sub.plan === "Enterprise" ? "per year" : "per month",
        });
      } else {
        setActiveSubscription(null);
      }
    } catch (err) {
      console.error(err);
      setActiveSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render either the subscription view or the full-screen payment view
  return showPayment || activeSubscription == null ? (
    <PaymentView
      activeSubscription={activeSubscription}
      onPaymentSuccess={() => {
        setShowPayment(false); // Return to subscription view
        fetchSubscription();   // Refresh subscription info
      }}
      onCancel={() => {
        fetchSubscription();
        setShowPayment(false);
      }} // Optional: allow cancel to go back
    />
  ) : (
    <ActiveSubscriptionView
      subscription={activeSubscription}
      onChangePlan={() => setShowPayment(true)}
    />
  );
};

export default SubscriptionView;
