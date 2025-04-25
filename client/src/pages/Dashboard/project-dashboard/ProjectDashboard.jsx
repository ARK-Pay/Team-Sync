import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authenticationState } from '../../../store/atoms/authVerifierSelector';
import { sidebarSelection } from '../../../store/atoms/adminDashboardAtoms';
import ProjectView from '../project-view/ProjectView';
import AccessManager from '../access-manager/AccessManager';
import MailSystem from '../mail-system/MailSystem';
import CalendarPage from '../calendar-system/CalendarPage';
import { FigmaDashboard } from '../../../components/Figma';
import UnifiedProjectTable from './components/UnifiedProjectTable';
import UsersProject from './components/UsersProject';
import MyTasksTable from '../my-tasks/MyTasksTable';
import Notifications from '../notifications/Notifications';

//project dashboard
const ProjectDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedSidebar = useRecoilValue(sidebarSelection);
  const auth = useRecoilValue(authenticationState);
  const token=localStorage.getItem("token");
  if(!token){
    return <Navigate to="/" />;
  }
  setTimeout(() => {
    if (!auth.isValid) {
      return <Navigate to="/" />;
    }
  
    if (auth.isAdmin) {
      return <Navigate to="/" />;
    }
  }, 100);

  // Clear session storage flags on component mount to refresh data on page reload
  useEffect(() => {
    // Clear the flags that control initial data loading
    sessionStorage.removeItem('dashboard_initial_load');
    sessionStorage.removeItem('projects_initial_load');
    
    // Listen for page reload/refresh to clear sessionStorage
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('dashboard_initial_load');
      sessionStorage.removeItem('projects_initial_load');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Render the appropriate component based on sidebar selection
  const renderContent = () => {
    switch (selectedSidebar) {
      case 'dashboard':
        return <Hero setSidebarOpen={setSidebarOpen} />;
      case 'projects':
        return <UnifiedProjectTable endpoint="get-my-assigned-projects" title="All Projects" />;
      case 'approved-projects':
        return <UnifiedProjectTable endpoint="get-my-assigned-projects" title="Approved Projects" filterApproved={true} />;
      case 'assigned-projects':
        return <UnifiedProjectTable endpoint="get-my-assigned-projects" title="My Assigned Projects" />;
      case 'created-projects':
        return <UnifiedProjectTable endpoint="my-created-projects" title="Projects I Created" />;
      case 'create-task':
        return <MyTasksTable type="assigned" />;
      case 'project-view':
        return <ProjectView />;
      case 'users-project':
        return <UsersProject />;
      case 'tasks':
        return <MyTasksTable type="assigned" />;
      case 'created-tasks':
        return <MyTasksTable type="created" />;
      case 'notifications':
        return <Notifications />;
      case 'access-manager':
        return <AccessManager />;
      case 'mail':
        return <MailSystem />;
      case 'calendar':
        return <CalendarPage />;
      case 'figma':
        return <FigmaDashboard />;
      default:
        return <Hero setSidebarOpen={setSidebarOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content - adjusted to be below navbar with proper spacing */}
      <div className="pt-16 lg:ml-56 min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectDashboard;