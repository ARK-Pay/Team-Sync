import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authenticationState } from '../../../store/atoms/authVerifierSelector';
import { sidebarSelection } from '../../../store/atoms/adminDashboardAtoms';
import ChatModal from './components/ChatModal';
import ReportModal from './components/ReportModal';
import { MessageSquare, Video, DownloadCloud, ChevronLeft, Loader2, AlertCircle, Users, Clock, Calendar, Tag } from 'lucide-react';
import axios from 'axios';

// Enhanced video call button with Lucide icon
const VideoCallButton = () => {
  const currentTheme = localStorage.getItem('dashboard_theme') || 'blue';
  const navigate = useNavigate();
  
  // Define theme colors
  const themes = {
    blue: {
      button: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white',
    },
    green: {
      button: 'bg-emerald-600 hover:bg-emerald-700',
      buttonText: 'text-white',
    },
    purple: {
      button: 'bg-purple-600 hover:bg-purple-700',
      buttonText: 'text-white',
    },
    amber: {
      button: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'text-white',
    },
  };
  
  const theme = themes[currentTheme];
  
  return (
    <button 
      onClick={() => navigate("/video-call")} 
      className={`${theme.button} ${theme.buttonText} px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2`}
      title="Join video call for this project"
    >
      <Video size={18} />
      <span>Video Call</span>
    </button>
  );
};

const ProjectView = () => {
  const navigate = useNavigate();
  const setSidebarSelection = useSetRecoilState(sidebarSelection);
  const selectedSidebar = useRecoilValue(sidebarSelection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = useRecoilValue(authenticationState);
  const token = localStorage.getItem("token");
  const projectId = localStorage.getItem("project_id");
  
  // State variables
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectPriority, setProjectPriority] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectTags, setProjectTags] = useState([]);
  const [projectUsers, setProjectUsers] = useState(0);
  const [projectFiles, setProjectFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('dashboard_theme') || 'blue';
  
  // Define theme colors
  const themes = {
    blue: {
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600',
      actionsBg: 'bg-white/70',
      border: 'border-blue-100',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white',
      badgeBg: 'bg-blue-50',
    },
    green: {
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600',
      actionsBg: 'bg-white/70',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      buttonText: 'text-white',
      badgeBg: 'bg-emerald-50',
    },
    purple: {
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-violet-600',
      actionsBg: 'bg-white/70',
      border: 'border-purple-100',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-800',
      button: 'bg-purple-600 hover:bg-purple-700',
      buttonText: 'text-white',
      badgeBg: 'bg-purple-50',
    },
    amber: {
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
      actionsBg: 'bg-white/70',
      border: 'border-amber-100',
      text: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-800',
      button: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'text-white',
      badgeBg: 'bg-amber-50',
    },
  };
  
  const theme = themes[currentTheme];

  // Function to navigate back to projects page
  const handleBackToProjects = () => {
    setSidebarSelection("your-projects");
    navigate("/dashboard");
  };
  
  // Fetch project details on component mount
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId || !token) {
        setError("Missing project ID or authentication token");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/project/${projectId}`, {
          headers: {
            'authorization': token
          }
        });

        const project = response.data;
        
        // Update state with project details
        setProjectName(project.name);
        setProjectDescription(project.description);
        setProjectStatus(project.status);
        setProjectPriority(project.priority);
        setProjectDeadline(project.deadline);
        setProjectTags(project.tags || []);
        
        // Get members and files count
        setProjectUsers(project.noUsers || 0);
        setProjectFiles(project.noFiles || 0);
        
        // Store project data in localStorage
        localStorage.setItem('project_name', project.name);
        localStorage.setItem('project_description', project.description);
        localStorage.setItem('project_status', project.status);
        localStorage.setItem('project_priority', project.priority);
        localStorage.setItem('project_deadline', project.deadline);
        localStorage.setItem('project_tags', project.tags);
        localStorage.setItem('project_users', project.noUsers || 0);
        localStorage.setItem('project_files', project.noFiles || 0);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.response?.data?.message || "Failed to load project details");
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]);

  if (!token) {
    return <Navigate to="/" />;
  }

  // Auth check with timeout
  setTimeout(() => {
    if (!auth.isValid || auth.isAdmin) {
      return <Navigate to="/" />;
    }
  }, 100);

  // Function to get priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Function to get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline set';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg animate-fadeIn">
          <Loader2 className={`${theme.text} animate-spin h-12 w-12 mb-4`} />
          <h3 className="text-xl font-semibold text-gray-800">Loading Project</h3>
          <p className="text-gray-500 mt-2">Please wait while we fetch the project details...</p>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg max-w-md animate-fadeIn">
          <AlertCircle className="text-red-500 h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Error Loading Project</h3>
          <p className="text-gray-500 mt-2 text-center">{error}</p>
          <button 
            onClick={handleBackToProjects}
            className={`mt-6 ${theme.button} ${theme.buttonText} px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <ChevronLeft size={16} />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative animate-fadeIn">
      {/* Project header with actions - Fixed below the navbar */}
      <div className={`fixed top-16 left-0 right-0 z-20 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} text-white shadow-md`}>
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <button 
                onClick={handleBackToProjects}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm 
                  hover:bg-white/30 transition-colors duration-200 mr-1" 
                aria-label="Back to projects"
                title="Back to projects"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(projectStatus)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {projectStatus ? projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1) : 'Status unavailable'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityBadge(projectPriority)}`}>
                <span className={`w-2 h-2 rounded-full ${getPriorityIcon(projectPriority)}`}></span>
                {projectPriority ? `${projectPriority.charAt(0).toUpperCase() + projectPriority.slice(1)} Priority` : 'Priority unavailable'}
              </span>
              {projectDeadline && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDeadline(projectDeadline)}
                </span>
              )}
            </div>
            
            <h1 className="text-xl md:text-2xl font-semibold truncate max-w-full">{projectName || 'Unnamed Project'}</h1>
            
            {projectDescription && (
              <p className="text-white/80 text-sm mt-1 line-clamp-1">
                {projectDescription}
              </p>
            )}
            
            {projectTags && projectTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.isArray(projectTags) ? projectTags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-md text-xs flex items-center gap-1">
                    <Tag size={10} />
                    {tag}
                  </span>
                )) : typeof projectTags === 'string' ? projectTags.split(',').map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-md text-xs flex items-center gap-1">
                    <Tag size={10} />
                    {tag.trim()}
                  </span>
                )) : null}
              </div>
            )}

            <div className="flex mt-2 gap-4">
              <div className="flex items-center gap-1 text-white/90 text-xs">
                <Users size={12} />
                <span>{projectUsers} Members</span>
              </div>
              <div className="flex items-center gap-1 text-white/90 text-xs">
                <DownloadCloud size={12} />
                <span>{projectFiles} Files</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons container */}
          <div className={`flex flex-wrap gap-2 ${theme.actionsBg} backdrop-blur-sm p-2 rounded-lg ${theme.border} shadow-sm`}>
            <VideoCallButton />
            <ChatModal />
            <ReportModal />
          </div>
        </div>
      </div>
      
      {/* Main content - Pushed down to avoid overlap with header */}
      <div className="pt-[140px] bg-gray-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <Hero />
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
