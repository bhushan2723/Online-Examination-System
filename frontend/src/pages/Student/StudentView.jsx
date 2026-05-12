import { useState, useEffect } from 'react';
import Dashboard from '../../components/Dashboard/Dashboard';
import Sidebar from '../../components/Dashboard/Sidebar/Sidebar';
import MainContent from '../../components/Dashboard/MainContent';
import Header from '../../components/Header/Header';
import DashboardView from './Dashboard/DashboardView';
import StudentExamView from './StudentExamView';
import ResultsView from '../Teacher/Results/ResultView';
import { useNavigate } from 'react-router-dom';

const StudentView = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || user?.role !== 'Student') {
      navigate('/login');
    }
    setUser(user);
  }, [navigate]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView username={user?.name} />;
      case 'exams':
        return <StudentExamView />;
      case 'results':
        return <ResultsView />;
      // Add more cases as needed
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

export default StudentView;