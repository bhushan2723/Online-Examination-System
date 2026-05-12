import { useMemo, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardCard from "../../../components/DashboardCard/DashboardCard";
import DashboardInfoPane from "../../../components/DashboardInfoPane/DashboardInfoPane";
import DashboardCalendar from "../../../components/DashboardCalendar/DashboardCalendar";
import DashboardHeader from "./DashboardHeader";
import RecentActivity from "../../../components/Activity/RecentActivity";
import "./DashboardView.css";

// Register ChartJS components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardView = ({ username, setActiveView }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const metricCards = useMemo(() => {
    if (!dashboardData) return [];

    const stats = dashboardData.stats;

    return [
      {
        title: "Upcoming Exams",
        value: stats.upcomingExams,
        subtitle: `Total Exams: ${stats.totalExams}`,
        icon: "fa-file-alt",
        tooltip: "Total exams scheduled ahead.",
      },
      {
        title: "Students Registered",
        value: stats.closestUpcomingExam
          ? stats.closestUpcomingExam.studentsRegistered
          : 0,
        subtitle: "In upcoming exams",
        icon: "fa-users",
        tooltip: "Students enrolled in upcoming exams.",
      },
      {
        title: "Pending Evaluations",
        value: `${stats.pendingEvaluations || 0}`,
        subtitle:
          stats.pendingEvaluationsPercentage != null
            ? `${stats.pendingEvaluationsPercentage > 0 ? "" : ""}${
                stats.pendingEvaluationsPercentage
              }% of all exams`
            : "No previous data",
        icon: "fa-clipboard-list",
        tooltip: "Exams awaiting grading.",
      },
      {
        title: "Modules",
        value: stats.totalModules,
        subtitle: `Total Questions: ${stats.totalQuestions}`,
        icon: "fa-layer-group",
        tooltip: "Total subjects and question banks.",
      },
    ];
  }, [dashboardData]);

  const upcomingEvents = useMemo(() => {
    if (!dashboardData) return [];

    // Map closest upcoming exam (or all exams if you extend API)
    const events = [];
    if (dashboardData.stats.closestUpcomingExam) {
      events.push({
        title: dashboardData.stats.closestUpcomingExam.title,
        start: new Date(dashboardData.stats.closestUpcomingExam.date),
        end: new Date(dashboardData.stats.closestUpcomingExam.date),
        totalMarks: dashboardData.stats.closestUpcomingExam.totalMarks,
        examCode: dashboardData.stats.closestUpcomingExam.examCode,
        studentsRegistered:
          dashboardData.stats.closestUpcomingExam.studentsRegistered,
      });
    }

    // If API provides multiple upcoming exams, map them here
    // dashboardData.stats.upcomingExamsList?.forEach(exam => { ... });

    return events;
  }, [dashboardData]);

  const topExams = useMemo(() => {
    if (!dashboardData || !dashboardData.stats?.topExamsByAverageScore) {
      return {
        labels: [],
        datasets: [
          {
            label: "Average Scores",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = dashboardData.stats.topExamsByAverageScore.map(
      (exam) => exam.title
    );
    const data = dashboardData.stats.topExamsByAverageScore.map(
      (exam) => Number(exam.averagePercentage.toFixed(2)) // format to 2 decimals
    );

    return {
      labels,
      datasets: [
        {
          label: "Average Scores",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData]);

  // Fetch teacher dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true); // make sure we set loading at start

        const response = await fetch(
          "http://localhost:5000/api/teachers/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to fetch dashboard data"
          );
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setDashboardData(null); // reset if error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } },
    }),
    []
  );

  return (
    <div className="teacher-dashboard container-fluid">
       <DashboardHeader
        username={username}
        isSubscribed={dashboardData?.stats?.hasActiveSubscription}
        setActiveView={setActiveView}
      />
     
      <div className="dashboard-main-body">
        <div className="main-left-side">
          <div className="metrics-cards">
            {metricCards.map((card, index) => (
              <div key={index}>
                <DashboardCard {...card} className="w-100" />
              </div>
            ))}
          </div>
          <div className="main-columns">
            <div>
              <DashboardInfoPane
                title="Average Exam Scores"
                subtitle="June - December 2025"
              >
                <div style={{ height: "300px" }}>
                  <Bar data={topExams} options={chartOptions} />
                </div>
              </DashboardInfoPane>
            </div>
            <div className="flex-grow-1 d-flex flex-column" style={{gap:"1.2rem"}}>
              <div className="flex-grow-1 d-flex flex-column">
                <DashboardInfoPane
                  title="Recent Activities"
                  subtitle="Latest changes in your account"
                >
                  <RecentActivity activities={dashboardData?.recentActivities} />
                </DashboardInfoPane>
              </div>
              <div className="flex-grow-1 d-flex flex-column">
                <DashboardInfoPane
                title="Quick Actions"
                containerClassName="flex-grow-1"
                subtitle=""
              >
                <div
                  className="quick-action-buttons"
                >
                    
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      Generate Reports
                      <i class="fa-solid fa-chart-area ms-2"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      View Modules<i class="fa-solid fa-book ms-2"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      Create Exams<i class="fa-solid fa-user-graduate ms-2"></i>
                    </button>
                </div>
              </DashboardInfoPane>
              </div>
            </div>
            {/* <div>
              <DashboardInfoPane
                title="Average Exam Scores"
                subtitle="June - December 2025"
              >
                <div style={{ height: "350px" }}>
                  <Bar data={topExams} options={chartOptions} />
                </div>
              </DashboardInfoPane>
            </div> */}
            {/* <div className="main-right" style={{height: "100%"}}>
              <div className="flex-grow-1 d-flex flex-column">
                <DashboardInfoPane
                  title="Recent Activities"
                  subtitle="Latest changes in your account"
                >
                  <RecentActivity activities={dashboardData?.recentActivities} />
                </DashboardInfoPane>
              </div>
              <div className="flex-grow-1 d-flex flex-column">
                <DashboardInfoPane
                title="Quick Actions"
                containerClassName="flex-grow-1"
                subtitle=""
              >
                <div
                  className="quick-action-buttons"
                >
                  <div className="action-buttons">
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      Generate Exam With AI<i class="fa fa-star ms-2"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      Generate Reports
                      <i class="fa-solid fa-chart-area ms-2"></i>
                    </button>
                  </div>
                  <div className="action-buttons">
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      View Modules<i class="fa-solid fa-book ms-2"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm">
                      Create Exams<i class="fa-solid fa-user-graduate ms-2"></i>
                    </button>
                  </div>
                </div>
              </DashboardInfoPane>
              </div>
            </div> */}
          </div>
        </div>
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
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
                    {upcomingEvents[0].title}
                  </h3>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    <strong>Date:</strong>{" "}
                    {new Date(upcomingEvents[0].start).toDateString()}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    <strong>Total Marks:</strong> {upcomingEvents[0].totalMarks}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    <strong>Exam Code:</strong> {upcomingEvents[0].examCode}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    <strong>Students Registered:</strong>{" "}
                    {upcomingEvents[0].studentsRegistered}
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
