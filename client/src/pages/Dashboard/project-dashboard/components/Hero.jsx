import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Moon, Sun, Palette, CloudLightning, Waves, Grid, Stars, X, Plus, Lightbulb } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTable, faChartLine, faDatabase, faUsers, faFile, faClipboard, faSync, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import UnifiedProjectTable from './UnifiedProjectTable';
import AddProjectModal from './project/AddProjectModal';
import { sidebarSelection } from '../../../../store/atoms/adminDashboardAtoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import UsersProject from './UsersProject';
import MyTasksTable from '../../my-tasks/MyTasksTable';
import Notifications from '../../notifications/Notifications';
import axios from 'axios';
import { toast } from 'react-toastify';

// Smart Task Suggestion Component
const TaskSuggestion = ({ suggestion, onAccept, onDismiss, theme, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay the appearance for a staggered effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!isVisible) return null;
  
  return (
    <div className="task-suggestion-bubble animate-pop-in" style={{ animationDelay: `${delay}ms` }}>
      <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${theme.primary.replace('bg-', 'border-')}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Lightbulb className={`h-5 w-5 mr-2 ${theme.text}`} />
            <span className="font-medium">Suggested Task</span>
          </div>
          <button 
            onClick={() => onDismiss(suggestion.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">{suggestion.title}</p>
        <div className="mt-3 flex justify-end space-x-2">
          <button 
            onClick={() => onDismiss(suggestion.id)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </button>
          <button 
            onClick={() => onAccept(suggestion)}
            className={`px-2 py-1 text-xs ${theme.secondary} ${theme.text} rounded hover:opacity-90`}
          >
            <div className="flex items-center">
              <Plus className="h-3 w-3 mr-1" />
              <span>Add Task</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

  // Define the Hero component which takes sidebarOpen and setSidebarOpen as props
  const Hero = ({setSidebarOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedSidebar = useRecoilValue(sidebarSelection);
  const setSidebarSelection = useSetRecoilState(sidebarSelection);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Refresh dashboard data after adding a new project
    if (selectedSidebar === 'dashboard') {
      console.log("Refreshing dashboard data after adding project");
      fetchDashboardStats();
    }
  };
  
  // Theme state management
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [animationMenuOpen, setAnimationMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from localStorage or default to 'blue'
    return localStorage.getItem('dashboard_theme') || 'blue';
  });
  const [currentAnimation, setCurrentAnimation] = useState(() => {
    // Get animation from localStorage or default to 'none'
    return localStorage.getItem('dashboard_animation') || 'none';
  });
  
  // Define theme options and their color schemes
  const themes = {
    blue: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-50',
      text: 'text-blue-500',
      hover: 'hover:bg-blue-100',
      button: 'bg-blue-950 hover:bg-blue-900',
      statsCard1: 'text-blue-500 bg-blue-50',
      statsCard2: 'text-green-500 bg-green-50',
      statsCard3: 'text-purple-500 bg-purple-50',
      statsCard4: 'text-orange-500 bg-orange-50',
      accent: 'text-blue-600',
    },
    green: {
      primary: 'bg-green-500',
      secondary: 'bg-green-50',
      text: 'text-green-500',
      hover: 'hover:bg-green-100',
      button: 'bg-green-800 hover:bg-green-700',
      statsCard1: 'text-green-500 bg-green-50',
      statsCard2: 'text-teal-500 bg-teal-50',
      statsCard3: 'text-lime-500 bg-lime-50',
      statsCard4: 'text-emerald-500 bg-emerald-50',
      accent: 'text-green-600',
    },
    purple: {
      primary: 'bg-purple-500',
      secondary: 'bg-purple-50',
      text: 'text-purple-500',
      hover: 'hover:bg-purple-100',
      button: 'bg-purple-800 hover:bg-purple-700',
      statsCard1: 'text-purple-500 bg-purple-50',
      statsCard2: 'text-indigo-500 bg-indigo-50',
      statsCard3: 'text-fuchsia-500 bg-fuchsia-50',
      statsCard4: 'text-violet-500 bg-violet-50',
      accent: 'text-purple-600',
    },
    amber: {
      primary: 'bg-amber-500',
      secondary: 'bg-amber-50',
      text: 'text-amber-500',
      hover: 'hover:bg-amber-100',
      button: 'bg-amber-800 hover:bg-amber-700',
      statsCard1: 'text-amber-500 bg-amber-50',
      statsCard2: 'text-orange-500 bg-orange-50',
      statsCard3: 'text-yellow-500 bg-yellow-50',
      statsCard4: 'text-red-500 bg-red-50',
      accent: 'text-amber-600',
    },
  };
  
  // Define animation options
  const animations = {
    none: {
      className: '',
      label: 'No Animation',
      icon: <Grid className="h-4 w-4" />
    },
    particles: {
      className: 'bg-particles',
      label: 'Particles',
      icon: <Stars className="h-4 w-4" />
    },
    gradient: {
      className: 'bg-animated-gradient',
      label: 'Gradient Wave',
      icon: <Waves className="h-4 w-4" />
    },
    pulse: {
      className: 'bg-pulse',
      label: 'Pulse',
      icon: <CloudLightning className="h-4 w-4" />
    }
  };
  
  // Set theme and animation in localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_theme', currentTheme);
  }, [currentTheme]);
  
  useEffect(() => {
    localStorage.setItem('dashboard_animation', currentAnimation);
  }, [currentAnimation]);
  
  // Function to change the theme
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    setThemeMenuOpen(false);
  };
  
  // Function to change the animation
  const changeAnimation = (animationName) => {
    setCurrentAnimation(animationName);
    setAnimationMenuOpen(false);
  };
  
  // Get the current theme colors
  const theme = themes[currentTheme];
  const animation = animations[currentAnimation];
  
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    recentProjects: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Task suggestions state
  const [taskSuggestions, setTaskSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [apiResponses, setApiResponses] = useState({});
  
  // Generate task suggestions based on existing tasks
  const generateTaskSuggestions = useCallback(() => {
    if (!showSuggestions) return;
    
    // Check if we have tasks in localStorage or from the API response
    const allTasks = apiResponses?.allTasks || [];
    
    // Get dismissed suggestions from localStorage
    const dismissedSuggestions = JSON.parse(localStorage.getItem('dismissed_suggestions') || '[]');
    
    let suggestions = [];
    
    if (allTasks.length === 0) {
      // No tasks yet, provide starter suggestions
      suggestions = [
        { 
          id: 'sugg-1', 
          title: 'Create your first task for your project',
          project_id: dashboardStats.recentProjects[0]?.id,
          project_name: dashboardStats.recentProjects[0]?.name || 'Your Project',
        },
        { 
          id: 'sugg-2', 
          title: 'Schedule a team kickoff meeting',
          project_id: dashboardStats.recentProjects[0]?.id,
          project_name: dashboardStats.recentProjects[0]?.name || 'Your Project',
        }
      ];
    } else {
      // Analyze existing tasks to generate smart suggestions
      const completedTasks = allTasks.filter(task => 
        task.status === '2' || task.status === 'completed' || task.status === 'Completed'
      );
      
      const inProgressTasks = allTasks.filter(task => 
        task.status === '1' || task.status === 'in progress' || task.status === 'In Progress'
      );
      
      // If there are tasks in progress, suggest follow-up tasks
      if (inProgressTasks.length > 0) {
        const randomTask = inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)];
        suggestions.push({
          id: `sugg-followup-${randomTask.id}`,
          title: `Follow up on: ${randomTask.title}`,
          project_id: randomTask.project_id,
          project_name: randomTask.project_name,
          related_task: randomTask.id
        });
      }
      
      // If there are completed tasks, suggest review tasks
      if (completedTasks.length > 0) {
        const randomTask = completedTasks[Math.floor(Math.random() * completedTasks.length)];
        suggestions.push({
          id: `sugg-review-${randomTask.id}`,
          title: `Review the completed task: ${randomTask.title}`,
          project_id: randomTask.project_id,
          project_name: randomTask.project_name,
          related_task: randomTask.id
        });
      }
      
      // Suggest tasks for project that has few tasks
      const projectTaskCounts = {};
      allTasks.forEach(task => {
        projectTaskCounts[task.project_id] = (projectTaskCounts[task.project_id] || 0) + 1;
      });
      
      const projectsWithFewTasks = dashboardStats.recentProjects.filter(project => 
        (projectTaskCounts[project.id] || 0) < 3
      );
      
      if (projectsWithFewTasks.length > 0) {
        const project = projectsWithFewTasks[Math.floor(Math.random() * projectsWithFewTasks.length)];
        suggestions.push({
          id: `sugg-project-${project.id}`,
          title: `Add more tasks to project: ${project.name}`,
          project_id: project.id,
          project_name: project.name
        });
      }
    }
    
    // Filter out any suggestions that have been dismissed previously
    suggestions = suggestions.filter(sugg => !dismissedSuggestions.includes(sugg.id));
    
    // Return a maximum of 3 suggestions
    return suggestions.slice(0, 3);
  }, [apiResponses, dashboardStats.recentProjects, showSuggestions]);
  
  // Update suggestions when dashboard data changes
  useEffect(() => {
    if (selectedSidebar === 'dashboard') {
      const suggestions = generateTaskSuggestions();
      if (suggestions && suggestions.length > 0) {
        setTaskSuggestions(suggestions);
      }
    }
  }, [dashboardStats, generateTaskSuggestions, selectedSidebar]);
  
  // Handle accepting a task suggestion
  const handleAcceptSuggestion = (suggestion) => {
    // Here you would typically open a modal to create the task
    // or directly create the task via API
    
    // For demonstration, we'll just remove the suggestion
    setTaskSuggestions(prev => prev.filter(sugg => sugg.id !== suggestion.id));
    
    // Show toast notification
    toast.success(`Task "${suggestion.title}" has been added to your list`);
    
    // Open the tasks view
    setSidebarSelection("tasks");
  };
  
  // Handle dismissing a task suggestion
  const handleDismissSuggestion = (suggestionId) => {
    // Remove the suggestion from the current state
    setTaskSuggestions(prev => prev.filter(sugg => sugg.id !== suggestionId));
    
    // Store dismissed suggestion IDs in localStorage to prevent them from reappearing
    const dismissedSuggestions = JSON.parse(localStorage.getItem('dismissed_suggestions') || '[]');
    dismissedSuggestions.push(suggestionId);
    localStorage.setItem('dismissed_suggestions', JSON.stringify(dismissedSuggestions));
  };

  // Create a reusable function to fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No authentication token found. Cannot fetch dashboard data.");
        return;
      }
      
      console.log("Fetching dashboard data from backend...");
      
      // Create an object to store all API responses
      const apiResponsesData = {};
      
      // Fetch projects data
      try {
        const projectsResponse = await axios.get('http://localhost:3001/project/get-my-assigned-projects', {
          headers: { 'authorization': token }
        });
        apiResponsesData.assignedProjects = projectsResponse.data || [];
        console.log(`Assigned projects fetched: ${apiResponsesData.assignedProjects.length}`);
      } catch (error) {
        console.error("Error fetching assigned projects:", error);
        apiResponsesData.assignedProjects = [];
      }
      
      // Fetch projects created by the user
      try {
        const createdProjectsResponse = await axios.get('http://localhost:3001/project/my-created-projects', {
          headers: { 'authorization': token }
        });
        apiResponsesData.createdProjects = createdProjectsResponse.data || [];
        console.log(`Created projects fetched: ${apiResponsesData.createdProjects.length}`);
      } catch (error) {
        console.error("Error fetching created projects:", error);
        apiResponsesData.createdProjects = [];
      }
      
      // Fetch tasks data - both assigned and created tasks
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        
        // Fetch assigned tasks
        const tasksResponse = await axios.get(`http://localhost:3001/task/user/${userId}/assigned-tasks`, {
          headers: { 'authorization': token }
        });
        apiResponsesData.assignedTasks = tasksResponse.data || [];
        console.log(`Assigned tasks fetched: ${apiResponsesData.assignedTasks.length}`);
        
        // Fetch created tasks
        const createdTasksResponse = await axios.get(`http://localhost:3001/task/user/${userEmail}/created-tasks`, {
          headers: { 'authorization': token }
        });
        apiResponsesData.createdTasks = createdTasksResponse.data || [];
        console.log(`Created tasks fetched: ${apiResponsesData.createdTasks.length}`);
        
        // Combine all tasks and remove duplicates
        apiResponsesData.allTasks = [...apiResponsesData.assignedTasks, ...apiResponsesData.createdTasks]
          .filter((task, index, self) => index === self.findIndex(t => t.id === task.id));
        console.log(`Total unique tasks: ${apiResponsesData.allTasks.length}`);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        apiResponsesData.assignedTasks = [];
        apiResponsesData.createdTasks = [];
        apiResponsesData.allTasks = [];
      }
      
      // Fetch users/team members data
      try {
        // Try multiple endpoints for fetching users
        let usersResponse;
        
        try {
          // First try the project-specific users endpoint if we have a project ID
          const pid = localStorage.getItem('project_id');
          if (pid) {
            usersResponse = await axios.get(`http://localhost:3001/project/get-all-users/${pid}`, {
              headers: { 'authorization': token }
            });
            console.log(`Project users fetched from project ${pid}`);
          } else {
            // If no project ID, try the generic users endpoint
            throw new Error("No project ID found, falling back to all-users endpoint");
          }
        } catch (err) {
          // If that fails, try the admin all-users endpoint
          try {
            usersResponse = await axios.get('http://localhost:3001/admin/all-users', {
              headers: { 'authorization': token }
            });
            console.log("All users fetched from admin endpoint");
          } catch (adminErr) {
            // If that also fails, try the basic users endpoint
            usersResponse = await axios.get('http://localhost:3001/user/all-users', {
              headers: { 'authorization': token }
            });
            console.log("All users fetched from user endpoint");
          }
        }
        
        apiResponsesData.users = usersResponse.data || [];
        console.log(`Users fetched: ${apiResponsesData.users.length}`);
      } catch (error) {
        console.error("Error fetching users:", error);
        apiResponsesData.users = [];
      }
      
      // Store the API responses
      setApiResponses(apiResponsesData);
      
      // Combine and sort projects by creation date
      const allProjects = [...apiResponsesData.assignedProjects, ...apiResponsesData.createdProjects]
        .filter((project, index, self) => 
          index === self.findIndex(p => p.id === project.id)
        )
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        });
      
      // Count completed tasks
      const completedTasks = (apiResponsesData.allTasks || []).filter(task => 
        task.status === '2' || 
        task.status === 2 || 
        task.status === 'completed' || 
        task.status === 'Completed' || 
        task.status?.toLowerCase() === 'completed'
      ).length;
      
      console.log("Dashboard data summary:");
      console.log(`- Total Projects: ${allProjects.length}`);
      console.log(`- Total Tasks: ${(apiResponsesData.allTasks || []).length}`);
      console.log(`- Completed Tasks: ${completedTasks}`);
      console.log(`- Team Members: ${apiResponsesData.users.length}`);
      
      // Store the fetch timestamp
      setLastUpdated(new Date());
      
      // Update dashboard stats
      setDashboardStats({
        totalProjects: allProjects.length,
        totalTasks: (apiResponsesData.allTasks || []).length,
        completedTasks: completedTasks,
        teamMembers: apiResponsesData.users.length,
        recentProjects: allProjects.slice(0, 5)
      });
      
      // Store these values in localStorage for other components to use
      localStorage.setItem('dashboard_totalProjects', allProjects.length);
      localStorage.setItem('dashboard_totalTasks', (apiResponsesData.allTasks || []).length);
      localStorage.setItem('dashboard_completedTasks', completedTasks);
      localStorage.setItem('dashboard_teamMembers', apiResponsesData.users.length);
      
      // After fetching all data and updating dashboard stats
      // Generate new task suggestions
      const suggestions = generateTaskSuggestions();
      if (suggestions && suggestions.length > 0) {
        setTaskSuggestions(suggestions);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [generateTaskSuggestions]);

  // Fetch data on mount and when selected sidebar changes to dashboard
  useEffect(() => {
    if (selectedSidebar === 'dashboard') {
      console.log("Dashboard selected - fetching initial data");
      fetchDashboardStats();
    }
  }, [selectedSidebar, fetchDashboardStats]);
  
  // Set up polling to refresh dashboard data every 1 minute
  useEffect(() => {
    if (selectedSidebar === 'dashboard') {
      console.log("Setting up dashboard data polling (every 60 seconds)");
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing dashboard data");
        fetchDashboardStats();
      }, 60000); // 1 minute
      
      return () => {
        console.log("Clearing dashboard data polling");
        clearInterval(intervalId);
      };
    }
  }, [selectedSidebar, fetchDashboardStats]);

  // Handle manual refresh
  const handleRefresh = () => {
    console.log("Manual refresh requested");
    fetchDashboardStats();
  };

  // Format date for last updated display
  const formatLastUpdated = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render the theme selector
  const renderThemeSelector = () => {
    return (
      <div className="relative">
        <button 
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          className={`p-2 rounded-full ${theme.hover} transition-colors`}
          title="Change color theme"
        >
          <Palette className={`h-5 w-5 ${theme.text}`} />
        </button>
        
        {themeMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => changeTheme('blue')}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${currentTheme === 'blue' ? 'bg-blue-50' : ''}`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  Blue Theme
                </div>
              </button>
              <button
                onClick={() => changeTheme('green')}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${currentTheme === 'green' ? 'bg-green-50' : ''}`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  Green Theme
                </div>
              </button>
              <button
                onClick={() => changeTheme('purple')}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${currentTheme === 'purple' ? 'bg-purple-50' : ''}`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-3"></div>
                  Purple Theme
                </div>
              </button>
              <button
                onClick={() => changeTheme('amber')}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${currentTheme === 'amber' ? 'bg-amber-50' : ''}`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-amber-500 mr-3"></div>
                  Amber Theme
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the animation selector
  const renderAnimationSelector = () => {
    return (
      <div className="relative">
        <button 
          onClick={() => setAnimationMenuOpen(!animationMenuOpen)}
          className={`p-2 rounded-full ${theme.hover} transition-colors`}
          title="Change background animation"
        >
          <Stars className={`h-5 w-5 ${theme.text}`} />
        </button>
        
        {animationMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {Object.entries(animations).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => changeAnimation(key)}
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${currentAnimation === key ? `bg-${currentTheme}-50` : ''}`}
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 mr-3 flex items-center justify-center ${theme.text}`}>
                      {value.icon}
                    </div>
                    {value.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the dashboard with animations and task suggestions
  const renderDashboard = () => {
    return (
      <div className={`max-w-[1200px] mx-auto relative ${animation.className}`}>
        {currentAnimation !== 'none' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {currentAnimation === 'particles' && <ParticlesBackground theme={currentTheme} />}
            {currentAnimation === 'gradient' && <GradientBackground theme={currentTheme} />}
            {currentAnimation === 'pulse' && <PulseBackground theme={currentTheme} />}
          </div>
        )}
      
        {/* Task Suggestions */}
        {showSuggestions && taskSuggestions.length > 0 && (
          <div className="task-suggestions-container fixed bottom-6 right-6 space-y-4 z-50">
            {taskSuggestions.map((suggestion, index) => (
              <TaskSuggestion
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={handleAcceptSuggestion}
                onDismiss={() => handleDismissSuggestion(suggestion.id)}
                theme={theme}
                delay={index * 300}
              />
            ))}
          </div>
        )}
      
        {/* Dashboard Header */}
        <div className="mb-5 relative z-10">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-gray-600 text-sm">Overview of your projects and activities</p>
        </div>
        
        {/* Team Overview Section */}
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Team Overview</h2>
              <p className="text-gray-600 text-sm">View your team's progress and activity • Last updated: {formatLastUpdated(lastUpdated)}</p>
            </div>
            <div className="flex items-center space-x-2">
              {renderThemeSelector()}
              {renderAnimationSelector()}
              <button 
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-400'}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FontAwesomeIcon icon={faSync} className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Projects</p>
                  <p className="text-3xl font-semibold">{dashboardStats.totalProjects}</p>
                </div>
                <div className={theme.statsCard1 + " p-3 rounded-md"}>
                  <FontAwesomeIcon icon={faPlus} size="lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Tasks</p>
                  <p className="text-3xl font-semibold">{dashboardStats.totalTasks}</p>
                </div>
                <div className={theme.statsCard2 + " p-3 rounded-md"}>
                  <FontAwesomeIcon icon={faTable} size="lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Completed Tasks</p>
                  <p className="text-3xl font-semibold">{dashboardStats.completedTasks}</p>
                </div>
                <div className={theme.statsCard3 + " p-3 rounded-md"}>
                  <FontAwesomeIcon icon={faChartLine} size="lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Team Members</p>
                  <p className="text-3xl font-semibold">{dashboardStats.teamMembers}</p>
                </div>
                <div className={theme.statsCard4 + " p-3 rounded-md"}>
                  <FontAwesomeIcon icon={faUsers} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Projects and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Recent Projects */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 h-full hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-lg">Recent Projects</h2>
                <button 
                  className={`${theme.accent} text-sm hover:underline`}
                  onClick={() => setSidebarSelection("projects")}
                >
                  View All
                </button>
              </div>
              <div className="p-4">
                {dashboardStats.recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-xs text-gray-500">Priority: {project.priority || 'Normal'}</p>
                            {project.createdAt && (
                              <p className="text-xs text-gray-500">
                                Added: {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'Completed' || project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          project.status === 'In Progress' || project.status === 'in progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status || 'Not Started'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No recent projects found</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg">Quick Actions</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <button 
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md group transition-colors"
                    onClick={openModal}
                  >
                    <div className="flex items-center">
                      <span className={theme.text + " mr-3"}>
                        <FontAwesomeIcon icon={faPlus} />
                      </span>
                      <span>Create New Project</span>
                    </div>
                    <FontAwesomeIcon 
                      icon={faArrowRight} 
                      className={`text-gray-400 group-hover:${theme.text} transition-colors`} 
                    />
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md group transition-colors"
                    onClick={() => setSidebarSelection("tasks")}
                  >
                    <div className="flex items-center">
                      <span className={theme.statsCard2.split(' ')[0] + " mr-3"}>
                        <FontAwesomeIcon icon={faTable} />
                      </span>
                      <span>View Tasks</span>
                    </div>
                    <FontAwesomeIcon 
                      icon={faArrowRight} 
                      className={`text-gray-400 group-hover:${theme.statsCard2.split(' ')[0]} transition-colors`} 
                    />
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md group transition-colors"
                    onClick={() => setSidebarSelection("users")}
                  >
                    <div className="flex items-center">
                      <span className={theme.statsCard3.split(' ')[0] + " mr-3"}>
                        <FontAwesomeIcon icon={faUsers} />
                      </span>
                      <span>Team Members</span>
                    </div>
                    <FontAwesomeIcon 
                      icon={faArrowRight} 
                      className={`text-gray-400 group-hover:${theme.statsCard3.split(' ')[0]} transition-colors`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 min-h-screen ${animation.className}`}>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          {selectedSidebar === "dashboard" && (
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">
                Overview of your projects and activities
              </p>
            </div>
          )}
          {selectedSidebar === "projects" && (
            <div>
              <h1 className="text-2xl font-semibold">Projects</h1>
              <p className="text-gray-600 text-sm mt-1">
                View and Manage Your Teams Projects
              </p>
            </div>
          )}
          {selectedSidebar === "your-projects" && (
            <div>
              <h1 className="text-2xl font-semibold">Your Projects</h1>
              <p className="text-gray-600 text-sm mt-1">
                Projects created by you
              </p>
            </div>
          )}
          {selectedSidebar === "tasks" && (
            <div>
              <h1 className="text-2xl font-semibold">Assigned Tasks</h1>
              <p className="text-gray-600 text-sm mt-1">
                Tasks assigned to you
              </p>
            </div>
          )}
          {selectedSidebar === "created-tasks" && (
            <div>
              <h1 className="text-2xl font-semibold">Created Tasks</h1>
              <p className="text-gray-600 text-sm mt-1">
                Tasks created by you
              </p>
            </div>
          )}
          {selectedSidebar === "users" && (
            <div>
              <h1 className="text-2xl font-semibold">Team Members</h1>
              <p className="text-gray-600 text-sm mt-1">
                View all team members
              </p>
            </div>
          )}
        </div>
        {selectedSidebar === "projects" && (
          <button
            className={`flex items-center gap-2 px-4 py-2 ${theme.button} text-white rounded-lg transition-colors`}
            onClick={openModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Add Project</span>
          </button>
        )}
        {selectedSidebar === "your-projects" && (
          <button
            className={`flex items-center gap-2 px-4 py-2 ${theme.button} text-white rounded-lg transition-colors`}
            onClick={openModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Add Project</span>
          </button>
        )}
      </div>

      {selectedSidebar === 'dashboard' && renderDashboard()}
      {selectedSidebar === 'users' && <UsersProject />}
      {selectedSidebar === 'notifications' && <Notifications />}
      {selectedSidebar === 'projects' && (
        <UnifiedProjectTable 
          endpoint="get-my-assigned-projects"
          title="Your assigned Projects"
          filterApproved={true}
        />
      )}
      {selectedSidebar === "tasks" && <MyTasksTable />}
      {selectedSidebar === "your-projects" && (
        <UnifiedProjectTable 
          endpoint="my-created-projects"
          title="Your Created Projects"
          filterApproved={false}
        />
      )}
      {selectedSidebar === "created-tasks" && <MyTasksTable type='created' />}

      <AddProjectModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

// Background Animation Components
const ParticlesBackground = ({ theme }) => {
  return (
    <div className="particles-container absolute inset-0 z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <div 
          key={i}
          className={`particle ${themes[theme].primary.replace('bg-', 'bg-opacity-')} rounded-full absolute`}
          style={{
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 20 + 10}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

const GradientBackground = ({ theme }) => {
  const colors = {
    blue: 'from-blue-500 via-indigo-500 to-purple-500',
    green: 'from-green-500 via-emerald-500 to-teal-500',
    purple: 'from-purple-500 via-violet-500 to-fuchsia-500',
    amber: 'from-amber-500 via-orange-500 to-red-500'
  };
  
  return (
    <div className={`absolute inset-0 z-0 bg-gradient-to-r ${colors[theme]} bg-size-200 animate-gradient opacity-10`} />
  );
};

const PulseBackground = ({ theme }) => {
  const baseColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500'
  };
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className={`absolute -inset-10 ${baseColors[theme]} animate-pulse-slow opacity-5 rounded-full blur-3xl transform scale-100`} />
    </div>
  );
};

export default Hero;