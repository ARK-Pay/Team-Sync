import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, Plus, Loader2, AlertCircle, CheckCircle, Users, FileText, List } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { sidebarSelection } from '../../../../store/atoms/adminDashboardAtoms';
import AddTaskModal from '../task/AddTaskModal';
import TaskTable from '../table/TaskTable';
import CompletedTaskTable from '../table/CompletedTaskTable';
import UserTable from '../table/UserTable';
import FileTable from '../table/FileTable';

const Hero = ({ sidebarOpen, setSidebarOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedSidebar = useRecoilValue(sidebarSelection);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('tasks');

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectPriority, setProjectPriority] = useState('');
  const [projectTags, setProjectTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('dashboard_theme') || 'blue';
  
  // Define theme colors
  const themes = {
    blue: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'text-blue-600',
      light: 'bg-blue-50',
      lightText: 'text-blue-800',
      ring: 'ring-blue-500/30',
      activeTab: 'bg-blue-50 text-blue-700 border-blue-600',
      fabShadow: 'shadow-blue-500/20'
    },
    green: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      accent: 'text-emerald-600',
      light: 'bg-emerald-50',
      lightText: 'text-emerald-800',
      ring: 'ring-emerald-500/30',
      activeTab: 'bg-emerald-50 text-emerald-700 border-emerald-600',
      fabShadow: 'shadow-emerald-500/20'
    },
    purple: {
      primary: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      text: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'text-purple-600',
      light: 'bg-purple-50',
      lightText: 'text-purple-800',
      ring: 'ring-purple-500/30',
      activeTab: 'bg-purple-50 text-purple-700 border-purple-600',
      fabShadow: 'shadow-purple-500/20'
    },
    amber: {
      primary: 'bg-amber-600',
      hover: 'hover:bg-amber-700',
      text: 'text-amber-600',
      border: 'border-amber-200',
      accent: 'text-amber-600',
      light: 'bg-amber-50',
      lightText: 'text-amber-800',
      ring: 'ring-amber-500/30',
      activeTab: 'bg-amber-50 text-amber-700 border-amber-600',
      fabShadow: 'shadow-amber-500/20'
    },
  };
  
  const theme = themes[currentTheme];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const projectId = localStorage.getItem('project_id');
      const token = localStorage.getItem('token');

      if (!projectId || !token) {
        console.error('Missing project ID or token');
        setError('Missing project ID or authentication token');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/project/${projectId}`, {
          headers: {
            'authorization': token
          }
        });

        const project = response.data;

        // Update state
        setProjectName(project.name);
        setProjectDescription(project.description);
        setProjectPriority(project.priority);
        setProjectTags(project.tags || []);

        // Update localStorage
        localStorage.setItem('project_name', project.name);
        localStorage.setItem('project_description', project.description);
        localStorage.setItem('project_priority', project.priority);
        localStorage.setItem('project_tags', project.tags);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError(error.response?.data?.message || 'Failed to load project details');
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center animate-pulse">
          <Loader2 className={`${theme.text} animate-spin h-10 w-10 mx-auto mb-4`} />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-12 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 h-6 w-6 mt-0.5 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium text-lg">Error loading project</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-6">
        <button 
          onClick={() => setActiveTab('tasks')} 
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
            activeTab === 'tasks' ? `${theme.activeTab} border-b-2` : 'text-gray-500 border-transparent'
          }`}
        >
          <List size={16} />
          Active Tasks
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
            activeTab === 'completed' ? `${theme.activeTab} border-b-2` : 'text-gray-500 border-transparent'
          }`}
        >
          <CheckCircle size={16} />
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('team')} 
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
            activeTab === 'team' ? `${theme.activeTab} border-b-2` : 'text-gray-500 border-transparent'
          }`}
        >
          <Users size={16} />
          Team
        </button>
        <button 
          onClick={() => setActiveTab('files')} 
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
            activeTab === 'files' ? `${theme.activeTab} border-b-2` : 'text-gray-500 border-transparent'
          }`}
        >
          <FileText size={16} />
          Files
        </button>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          className={`${theme.primary} text-white flex items-center justify-center w-14 h-14 rounded-full ${theme.hover} transition-all duration-300 shadow-lg ${theme.fabShadow} hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 ${theme.ring}`}
          onClick={openModal}
          aria-label="Add Task"
          title="Add New Task"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Desktop View - All Sections */}
      <div className="hidden lg:block space-y-8">
        {/* Task Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <List className={`${theme.text} h-5 w-5`} />
                Active Tasks
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage and track your current project tasks</p>
            </div>
          </div>
          <div className="p-6">
            <TaskTable refreshTrigger={refreshTrigger} />
          </div>
        </div>
        
        {/* Completed Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className={`${theme.text} h-5 w-5`} />
              Completed Tasks
            </h2>
            <p className="text-gray-500 text-sm mt-1">Review tasks that have been completed</p>
          </div>
          <div className="p-6">
            <CompletedTaskTable />
          </div>
        </div>
        
        {/* Project Team */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className={`${theme.text} h-5 w-5`} />
              Project Team
            </h2>
            <p className="text-gray-500 text-sm mt-1">Members assigned to this project</p>
          </div>
          <div className="p-6">
            <UserTable />
          </div>
        </div>
        
        {/* Project Files */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className={`${theme.text} h-5 w-5`} />
              Project Files
            </h2>
            <p className="text-gray-500 text-sm mt-1">Access and manage all project-related files</p>
          </div>
          <div className="p-6">
            <FileTable />
          </div>
        </div>
      </div>

      {/* Mobile View - Conditional Rendering Based on Active Tab */}
      <div className="lg:hidden">
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <List className={`${theme.text} h-5 w-5`} />
                Active Tasks
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage and track your current project tasks</p>
            </div>
            <div className="p-4 sm:p-6">
              <TaskTable refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
        
        {activeTab === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className={`${theme.text} h-5 w-5`} />
                Completed Tasks
              </h2>
              <p className="text-gray-500 text-sm mt-1">Review tasks that have been completed</p>
            </div>
            <div className="p-4 sm:p-6">
              <CompletedTaskTable />
            </div>
          </div>
        )}
        
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className={`${theme.text} h-5 w-5`} />
                Project Team
              </h2>
              <p className="text-gray-500 text-sm mt-1">Members assigned to this project</p>
            </div>
            <div className="p-4 sm:p-6">
              <UserTable />
            </div>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className={`${theme.text} h-5 w-5`} />
                Project Files
              </h2>
              <p className="text-gray-500 text-sm mt-1">Access and manage all project-related files</p>
            </div>
            <div className="p-4 sm:p-6">
              <FileTable />
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <AddTaskModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Hero;