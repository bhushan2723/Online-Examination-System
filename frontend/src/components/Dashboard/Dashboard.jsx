import './Dashboard.css';

const Dashboard = ({ children }) => {
  return (
    <div className="dashboard-container d-flex flex-column flex-md-row overflow-hidden mx-auto" 
         style={{ minHeight: 'calc(100vh - 55px)' }}>
      {children}
    </div>
  );
};

export default Dashboard;