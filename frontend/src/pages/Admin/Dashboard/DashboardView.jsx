import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { 
  Users, 
  BookOpen, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Download,
  Eye
} from 'lucide-react';

const DashboardView = ({ username }) => {
  // Static data for demonstration
  const dashboardData = {
    revenue: {
      total: 45236.89,
      monthly: 3240.50,
      growth: 12.5,
      subscriptions: 53
    },
    users: {
      teachers: 56,
      students: 147,
      activeExams: 19,
      questionBanks: 82
    },
    platformStats: {
      examCompletions: 47,
      successRate: 78.3,
      avgScore: 72.5,
      totalQuestions: 889
    },
    recentActivity: [
      { action: 'New teacher subscription', user: 'Dr. Ved', time: '2 hours ago', amount: 49.99 },
      { action: 'Exam Paper created (25 marks)', user: 'Mr Patil', time: '1 day ago', questions: 25 },
      { action: 'Question bank created', user: 'Prof. Ananya', time: '1 day ago', questions: 50 }
    ]
  };

  const StatCard = ({ title, value, icon: Icon, subtitle, trend, color = 'primary' }) => (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <h3 className="fw-bold mb-1">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
            {trend && (
              <div className={`d-flex align-items-center mt-2 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                <TrendingUp size={14} className="me-1" />
                <small>{trend}% from last month</small>
              </div>
            )}
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const ProgressStat = ({ label, value, max = 100, color = 'primary' }) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">{label}</span>
        <span className="fw-bold">{value}%</span>
      </div>
      <ProgressBar 
        now={value} 
        variant={color}
        className="rounded"
        style={{ height: '6px' }}
      />
    </div>
  );

  return (
    <div className="admin-dashboard container-fluid flex-grow-1" style={{padding: "1.5rem", backgroundColor:"aliceblue"}}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1" data-cy="welcome-message">
            Welcome back, {username} 👋
          </h1>
          <p className="text-muted mb-0">Here's what's happening with your platform today</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center">
            <Download size={16} className="me-2" />
            Export Report
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center">
            <Eye size={16} className="me-2" />
            View Analytics
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard
            title="Total Revenue"
            value={`Rs ${dashboardData.revenue.total.toLocaleString()}`}
            icon={CreditCard}
            subtitle="All-time earnings"
            trend={8.2}
            color="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`Rs ${dashboardData.revenue.monthly.toLocaleString()}`}
            icon={TrendingUp}
            subtitle="Current month"
            trend={12.5}
            color="primary"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Active Subscriptions"
            value={dashboardData.revenue.subscriptions}
            icon={Users}
            subtitle="Paid teachers"
            trend={5.7}
            color="info"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Platform Growth"
            value={`${dashboardData.revenue.growth}%`}
            icon={Activity}
            subtitle="This quarter"
            trend={dashboardData.revenue.growth}
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* User Statistics */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <Users className="me-2" size={20} />
                User Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-1">Teachers</h6>
                  <h4 className="fw-bold text-primary mb-0">{dashboardData.users.teachers}</h4>
                </div>
                <BookOpen size={24} className="text-primary" />
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-1">Students</h6>
                  <h4 className="fw-bold text-success mb-0">{dashboardData.users.students}</h4>
                </div>
                <Users size={24} className="text-success" />
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <h6 className="mb-1">Active Exams</h6>
                  <h4 className="fw-bold text-warning mb-0">{dashboardData.users.activeExams}</h4>
                </div>
                <FileText size={24} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Platform Performance */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <Activity className="me-2" size={20} />
                Platform Performance
              </h5>
            </Card.Header>
            <Card.Body>
              <ProgressStat 
                label="Exam Success Rate" 
                value={dashboardData.platformStats.successRate} 
                color="success"
              />
              <ProgressStat 
                label="Average Score" 
                value={dashboardData.platformStats.avgScore} 
                color="primary"
              />
              <ProgressStat 
                label="Question Bank Usage" 
                value={85} 
                color="info"
              />
              <ProgressStat 
                label="Teacher Satisfaction" 
                value={92} 
                color="warning"
              />
              
              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Questions:</span>
                  <strong>{dashboardData.platformStats.totalQuestions.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="text-muted">Exams Completed:</span>
                  <strong>{dashboardData.platformStats.examCompletions.toLocaleString()}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="p-3 border-bottom"
                  style={{ borderBottom: '1px solid #dee2e6' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{activity.action}</h6>
                      <small className="text-muted">{activity.user}</small>
                    </div>
                    <small className="text-muted text-nowrap">{activity.time}</small>
                  </div>
                  {activity.amount && (
                    <small className="text-success fw-bold">+Rs {activity.amount}</small>
                  )}
                  {activity.score && (
                    <small className="text-primary fw-bold">Score: {activity.score}%</small>
                  )}
                  {activity.questions && (
                    <small className="text-info fw-bold">{activity.questions} questions</small>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Footer */}
      <Row className="g-3 mt-4">
        <Col md={3}>
          <div className="bg-light p-3 rounded text-center">
            <BookOpen size={20} className="text-primary mb-2" />
            <h6 className="mb-1">Question Banks</h6>
            <h4 className="fw-bold mb-0">{dashboardData.users.questionBanks}</h4>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-light p-3 rounded text-center">
            <FileText size={20} className="text-success mb-2" />
            <h6 className="mb-1">Exams Created</h6>
            <h4 className="fw-bold mb-0">1,247</h4>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-light p-3 rounded text-center">
            <Users size={20} className="text-warning mb-2" />
            <h6 className="mb-1">New Registrations</h6>
            <h4 className="fw-bold mb-0">48</h4>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-light p-3 rounded text-center">
            <CreditCard size={20} className="text-info mb-2" />
            <h6 className="mb-1">Renewals Due</h6>
            <h4 className="fw-bold mb-0">12</h4>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;