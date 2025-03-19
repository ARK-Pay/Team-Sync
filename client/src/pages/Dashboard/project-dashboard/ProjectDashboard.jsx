import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authenticationState } from '../../../store/atoms/authVerifierSelector';
import { sidebarSelection } from '../../../store/atoms/adminDashboardAtoms';
import ProjectView from '../project-view/ProjectView';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content - adjusted to be below navbar with proper spacing */}
      <div className="pt-16 lg:ml-56 min-h-screen">
        {selectedSidebar==="project-view"?<ProjectView />:<Hero sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      </div>
    </div>
  );
};

export default ProjectDashboard;