import { useState, useEffect } from 'react';
import Dashboard from '../../components/Dashboard/Dashboard';
import Sidebar from '../../components/Dashboard/Sidebar/Sidebar';
import MainContent from '../../components/Dashboard/MainContent';
import Header from '../../components/Header/Header';
import DashboardView from './Dashboard/DashboardView';
import ExamView from './Exams/ExamView';
import TeacherScheduleView from './TeacherScheduleView';
import ResultsView from "./Results/ResultView";
import ModulesView from './Modules/ModulesView';
import ProgressView from './Progress/ProgressView';
import Subscription from './Subscription/SubscriptionView';
import { useNavigate } from 'react-router-dom';

const TeacherView = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || user?.role !== 'Teacher') {
      navigate('/login');
    }
    setUser(user);
  }, [navigate]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView username={user?.name} setActiveView={setActiveView}/>;
      case 'exams':
        return <ExamView />;
      case 'modules':
        return <ModulesView teacherId={user.id} />;
      case 'schedules':
        return <TeacherScheduleView />;
      case 'results':
        return <ResultsView />;
      case 'progress':
        return <ProgressView />;
      case 'subscription':
        return <Subscription />;
      // Add more cases as needed
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Header />
      <Dashboard>
        <Sidebar setActiveView={setActiveView} userRole={user?.role} loadView={activeView}/>
        <MainContent>
          {renderView()}
        </MainContent>
      </Dashboard>
    </>
  );
};

export default TeacherView;