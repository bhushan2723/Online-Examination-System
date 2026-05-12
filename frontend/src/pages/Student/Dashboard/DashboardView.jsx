import { useMemo, useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardCard from "../../../components/DashboardCard/DashboardCard";
import DashboardInfoPane from "../../../components/DashboardInfoPane/DashboardInfoPane";
import DashboardCalendar from "../../../components/DashboardCalendar/DashboardCalendar";
import DashboardHeader from "../../Teacher/Dashboard/DashboardHeader";
import RecentActivity from "../../../components/Activity/RecentActivity";
import "./DashboardView.css";

// Register ChartJS for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardView = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Metric cards stay same (from API stats)
  const metricCards = useMemo(() => {
    if (!dashboardData) return [];

    const stats = dashboardData.stats;
    return [
      {
        title: "Total Exams Attempted",
        value: stats.totalExamsAttempted,
        subtitle: "All-time attempts",
        icon: "fa-file-alt",
        tooltip: "Number of exams you have attempted.",
      },
      {
        title: "Average Score (%)",
        value: `${stats.averageScore}%`,
        subtitle: "Across all exams",
        icon: "fa-chart-line",
        tooltip: "Your average exam percentage.",
      },
      {
        title: "Pass Rate (%)",
        value: `${stats.passRate}%`,
        subtitle: "Exams passed vs attempted",
        icon: "fa-check-circle",
        tooltip: "Percentage of exams where you passed.",
      },
      {
        title: "Best Subject",
        value: stats.highestExam?.title || "N/A",
        subtitle: stats.highestExam?.percentage
          ? `Highest avg: ${Number(stats.highestExam.percentage).toFixed(2)}%`
          : "No data yet",
        icon: "fa-star",
        tooltip: "Subject in which you perform best.",
      },
    ];
  }, [dashboardData]);

  // Upcoming events from API
  const upcomingEvents = useMemo(() => {
    if (!dashboardData) return [];
    const events = [];

    const exam = dashboardData.stats.closestUpcomingExam;
    if (exam) {
      events.push({
        title: exam?.title,
        start: new Date(exam.startTime), // ✅ start date
        end: new Date(exam.endTime), // ✅ end date
        registrationId: exam.registrationId, // ✅ from backend
        registeredAt: new Date(exam.registeredAt), // ✅ convert to Date
        duration: exam.duration, // ✅ in minutes
        totalMarks: exam.totalMarks,
        examCode: exam.examCode,
      });
    }

    return events;
  }, [dashboardData]);

  // Line chart: Last Completed Exams
  const performanceHistory = useMemo(() => {
    if (!dashboardData || !dashboardData.stats?.lastCompletedExams) {
      return {
        labels: [],
        datasets: [
          {
            label: "Percentage (%)",
            data: [],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.3)",
            tension: 0.3,
          },
        ],
      };
    }

    const labels = dashboardData.stats.lastCompletedExams.map(
      (exam) => exam?.title
    );
    const data = dashboardData.stats.lastCompletedExams.map(
      (exam) => exam.percentage
    );

    return {
      labels,
      datasets: [
        {
          label: "Percentage (%)",
          data,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.3)",
          tension: 0.3,
        },
      ],
    };
  }, [dashboardData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } },
    }),
    []
  );

  // Fetch student dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/student/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="student-dashboard container-fluid flex-grow-1">
      {/* Header */}
      <DashboardHeader username={username} />

      <div className="dashboard-main-body">
        <div className="main-left-side">
          {/* Metric Cards */}
          <div className="metrics-cards">
            {metricCards.map((card, index) => (
              <div key={index}>
                <DashboardCard {...card} className="w-100" />
              </div>
            ))}
          </div>

          <div className="main-columns">
            {/* Performance History */}
            <DashboardInfoPane
              title="Performance History"
              subtitle="Your past exams and marks"
            >
              <div style={{ height: "350px" }}>
                <Line data={performanceHistory} options={chartOptions} />
              </div>
            </DashboardInfoPane>

            <div className="main-right">
              {/* Recent Activity */}
              <DashboardInfoPane
                title="Recent Activities"
                subtitle="Your latest exam updates"
              >
                <RecentActivity activities={dashboardData?.recentActivities} />
              </DashboardInfoPane>

              {/* Quick Actions */}
              <DashboardInfoPane
                title="Quick Actions"
                containerClassName="flex-grow-1"
              >
                <div
                  className="quick-action-buttons"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <div className="action-buttons">
                    <button type="button" className="btn btn-outline-secondary">
                      View Results <i className="fa fa-poll ms-2"></i>
                    </button>
                    <button type="button" className="btn btn-outline-secondary">
                      Upcoming Exams <i className="fa fa-calendar ms-2"></i>
                    </button>
                  </div>
                  <div className="action-buttons">
                    <button type="button" className="btn btn-outline-secondary">
                      Register Now <i className="fa fa-sign-in ms-2"></i>
                    </button>
                    <button type="button" className="btn btn-outline-secondary">
                      Generate Report <i className="fa fa-lightbulb ms-2"></i>
                    </button>
                  </div>
                </div>
              </DashboardInfoPane>
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="main-right-side">
          <DashboardInfoPane
            title="Upcoming Exams"
            subtitle="Interactive Calendar"
          >
            <div>
              <DashboardCalendar upcomingEvents={upcomingEvents} />
            </div>

            <div style={{ marginTop: "1.75rem" }}>
              {upcomingEvents.length > 0 ? (
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e7eb",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {upcomingEvents[0]?.title}
                  </h3>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                    <strong>Date:</strong>{" "}
                    {new Date(upcomingEvents[0].start).toLocaleString()}
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                    <strong>Duration:</strong> {upcomingEvents[0].duration} mins
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                    <strong>Total Marks:</strong> {upcomingEvents[0].totalMarks}
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                    <strong>Exam Code:</strong> {upcomingEvents[0].examCode}
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                    <strong>Registered At:</strong>{" "}
                    {new Date(upcomingEvents[0].registeredAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#f3f4f6",
                    textAlign: "center",
                    color: "#6b7280",
                    fontStyle: "italic",
                    border: "1px dashed #d1d5db",
                  }}
                >
                  No upcoming exams scheduled. Stay tuned — new exams will
                  appear here when published.
                </div>
              )}
            </div>
          </DashboardInfoPane>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
