import { useState, useEffect } from 'react';
import Dashboard from '../../components/Dashboard/Dashboard';
import Sidebar from '../../components/Dashboard/Sidebar/Sidebar';
import MainContent from '../../components/Dashboard/MainContent';
import Header from '../../components/Header/Header';
import DashboardView from './Dashboard/DashboardView';
import ExamView from './Exam/ExamView';
import ResultsView from './Result/ResultsView';
import SystemUsersView from './SystemUsers/SystemUsersView';
import { useNavigate } from 'react-router-dom';

const TeacherView = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || user?.role !== 'Admin') {
      navigate('/login');
    }
    setUser(user);
  }, [navigate]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView username={user?.name} />;
      case 'exams':
        return <ExamView />;
      case 'results':
        return <ResultsView />;
      case 'users':
        return <SystemUsersView />;
    //   // Add more cases as needed
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Header />
      <Dashboard>
        <Sidebar setActiveView={setActiveView} userRole={user?.role} />
        <MainContent>
          {renderView()}
        </MainContent>
      </Dashboard>
    </>
  );
};

export default TeacherView;