import React, { useState } from 'react';
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

//project dashboard
const ProjectDashboard = () => {
  let selectedSidebar=useRecoilValue(sidebarSelection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Render the appropriate component based on sidebar selection
  const renderContent = () => {
    switch(selectedSidebar) {
      case 'project-view':
        return <ProjectView />;
      case 'access-manager':
        return <AccessManager />;
      case 'mail':
        return <MailSystem />;
      case 'calendar':
        return <CalendarPage />;
      case 'figma':
        return <FigmaDashboard />;
      default:
        return <Hero sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
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