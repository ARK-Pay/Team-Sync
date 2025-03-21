import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Plus, Search, Calendar, AlertCircle, Clock, Tag, Layers, User, CheckCircle, CheckSquare, Flag, BarChart2 } from 'lucide-react';
import { SearchBar } from './common/SearchBar';
import { TableHeader } from './table/TableHeader';
import { ProjectRow } from './table/ProjectRow';
import { useSetRecoilState } from 'recoil';
import { sidebarSelection } from '../../../../store/atoms/adminDashboardAtoms';

const UnifiedProjectTable = ({ 
  endpoint, 
  title = "Table View",
  filterApproved = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isAnimated, setIsAnimated] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const setSidebarSelection = useSetRecoilState(sidebarSelection);
  
  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('dashboard_theme') || 'blue';
  
  // Define theme colors based on the current theme
  const themes = {
    blue: {
      primary: 'bg-blue-500',
      primaryDark: 'bg-blue-700',
      secondary: 'bg-blue-50',
      text: 'text-blue-500',
      textDark: 'text-blue-700',
      hover: 'hover:bg-blue-100',
      hoverDark: 'hover:bg-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white',
      accent: 'text-blue-600',
      border: 'border-blue-200',
      shadow: 'shadow-blue-100',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600',
    },
    green: {
      primary: 'bg-emerald-500',
      primaryDark: 'bg-emerald-700',
      secondary: 'bg-emerald-50',
      text: 'text-emerald-500',
      textDark: 'text-emerald-700',
      hover: 'hover:bg-emerald-100',
      hoverDark: 'hover:bg-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      buttonText: 'text-white',
      accent: 'text-emerald-600',
      border: 'border-emerald-200',
      shadow: 'shadow-emerald-100',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600',
    },
    purple: {
      primary: 'bg-purple-500',
      primaryDark: 'bg-purple-700',
      secondary: 'bg-purple-50',
      text: 'text-purple-500',
      textDark: 'text-purple-700',
      hover: 'hover:bg-purple-100',
      hoverDark: 'hover:bg-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
      buttonText: 'text-white',
      accent: 'text-purple-600',
      border: 'border-purple-200',
      shadow: 'shadow-purple-100',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-violet-600',
    },
    amber: {
      primary: 'bg-amber-500',
      primaryDark: 'bg-amber-700',
      secondary: 'bg-amber-50',
      text: 'text-amber-500',
      textDark: 'text-amber-700',
      hover: 'hover:bg-amber-100',
      hoverDark: 'hover:bg-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'text-white',
      accent: 'text-amber-600',
      border: 'border-amber-200',
      shadow: 'shadow-amber-100',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
    },
  };
  
  const theme = themes[currentTheme];
  const isCreatedProjectsView = endpoint === "my-created-projects";

  //fetch projects 
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/project/${endpoint}`, {
          headers: {
            'authorization': token,
            'Content-Type': 'application/json'
          },
        });

        let projectData = response.data;
        
        // Filter approved projects if needed
        if (filterApproved) {
          projectData = projectData.filter(project => project.is_approved);
        }

        setProjects(projectData);
        setFilteredProjects(projectData);
      } catch (error) {
        setError(error.response ? error.response.data.message : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [endpoint, filterApproved]);

  //search function
  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = projects.filter((project) => {
      const { name, description } = project;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(lowerCaseQuery) ||
        description.toLowerCase().includes(lowerCaseQuery) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    });
    setFilteredProjects(filtered);
  };
  
  // Filter projects by status
  const filterProjects = (filterType) => {
    setActiveFilter(filterType);
    
    if (filterType === 'all') {
      setFilteredProjects(projects);
      return;
    }
    
    const filtered = projects.filter(project => {
      if (filterType === 'approved') return project.is_approved;
      if (filterType === 'pending') return !project.is_approved;
      if (filterType === 'active') return project.status === 'active';
      if (filterType === 'completed') return project.status === 'completed';
      return true;
    });
    
    setFilteredProjects(filtered);
  };
  
  // Function to handle project click and navigation
  const handleProjectClick = (project) => {
    setSidebarSelection("project-view");
    localStorage.setItem("project_id", project.id);
    localStorage.setItem("project_name", project.name);
    localStorage.setItem("project_description", project.description);
    localStorage.setItem("project_deadline", project.deadline);
    localStorage.setItem("project_status", project.status);
    localStorage.setItem("project_priority", project.priority);
    localStorage.setItem("project_creator", project.creator_id);
    localStorage.setItem("project_tags", project.tags);
  };
  
  // Generate random percentage for demo purposes (replace with actual progress values)
  const getRandomProgress = () => {
    return Math.floor(Math.random() * 101);
  };
  
  // Get project summary stats
  const getProjectStats = () => {
    const total = filteredProjects.length;
    const approved = filteredProjects.filter(p => p.is_approved).length;
    const pending = filteredProjects.filter(p => !p.is_approved).length;
    const active = filteredProjects.filter(p => p.status === 'active').length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    
    return { total, approved, pending, active, completed };
  };
  
  const stats = getProjectStats();
  
  // Sort function
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    
    // Apply sorting
    const sorted = [...filteredProjects].sort((a, b) => {
      let valueA = a[field] || '';
      let valueB = b[field] || '';
      
      // Handle different data types
      if (field === 'deadline') {
        valueA = valueA ? new Date(valueA) : new Date(0);
        valueB = valueB ? new Date(valueB) : new Date(0);
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      // Apply sort order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredProjects(sorted);
  };
  
  // Get status style for grid view
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-200 text-red-800';
    }
  };
  
  // Get priority style for grid view
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Flag className="h-3 w-3 text-red-600 mr-1" />;
      case 'medium':
        return <Flag className="h-3 w-3 text-yellow-600 mr-1" />;
      case 'low':
        return <Flag className="h-3 w-3 text-blue-600 mr-1" />;
      default:
        return <Flag className="h-3 w-3 text-gray-600 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="py-6 max-w-[1200px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className={`${theme.text} animate-spin mr-2`}>
            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-700">Loading projects...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-6 max-w-[1200px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Error loading projects</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-[1200px] mx-auto animate-fadeIn">
      {/* Header with title and stats */}
      <div className={`mb-8 rounded-xl bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} text-white shadow-lg overflow-hidden`}>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">{title}</h1>
          <p className="opacity-90 text-sm md:text-base">
            Manage and monitor all your projects in one place
          </p>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col">
              <span className="text-white/70 text-xs font-medium mb-2">Total Projects</span>
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-lg md:text-xl font-bold">{stats.total}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col">
              <span className="text-white/70 text-xs font-medium mb-2">Approved</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-lg md:text-xl font-bold">{stats.approved}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col">
              <span className="text-white/70 text-xs font-medium mb-2">Pending</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-lg md:text-xl font-bold">{stats.pending}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col">
              <span className="text-white/70 text-xs font-medium mb-2">Active</span>
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-lg md:text-xl font-bold">{stats.active}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col">
              <span className="text-white/70 text-xs font-medium mb-2">Completed</span>
              <div className="flex items-center">
                <CheckSquare className="h-4 w-4 mr-2 opacity-80" />
                <span className="text-lg md:text-xl font-bold">{stats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        {/* Search and filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <SearchBar 
              placeholder="Search for projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            
            <button 
              type="submit" 
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${theme.button} ${theme.buttonText} transition-all duration-300`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>
          
          <div className="flex gap-2 w-full lg:w-auto justify-between">
            {/* Filter buttons */}
            <div className="flex gap-1 overflow-x-auto">
              <button 
                onClick={() => filterProjects('all')} 
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
                  ${activeFilter === 'all' 
                    ? `${theme.primary} text-white` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`
                }
              >
                All
              </button>
              <button 
                onClick={() => filterProjects('approved')} 
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
                  ${activeFilter === 'approved' 
                    ? `${theme.primary} text-white` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`
                }
              >
                Approved
              </button>
              <button 
                onClick={() => filterProjects('pending')} 
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
                  ${activeFilter === 'pending' 
                    ? `${theme.primary} text-white` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`
                }
              >
                Pending
              </button>
              <button 
                onClick={() => filterProjects('active')} 
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
                  ${activeFilter === 'active' 
                    ? `${theme.primary} text-white` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`
                }
              >
                Active
              </button>
            </div>
            
            {/* View toggle */}
            <div className="flex">
              <button 
                type="button" 
                onClick={() => setView('grid')}
                className={`flex items-center justify-center p-2 transition-colors rounded-l-lg border ${
                  view === 'grid' 
                    ? `${theme.primary} text-white border-transparent` 
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={() => setView('table')}
                className={`flex items-center justify-center p-2 transition-colors rounded-r-lg border ${
                  view === 'table' 
                    ? `${theme.primary} text-white border-transparent` 
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title="Table view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No projects message */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
          <button 
            className={`inline-flex items-center px-4 py-2 ${theme.button} ${theme.buttonText} rounded-lg transition-colors duration-300`}
            onClick={() => filterProjects('all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Table View */}
      {view === 'table' && filteredProjects.length > 0 && (
        <div className={`border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-white`}>
          <table className="w-full border-separate border-spacing-0">
            <thead className={`bg-gray-50 border-b border-gray-200`}>
              <TableHeader 
                handleSort={handleSort} 
                sortBy={sortBy} 
                sortOrder={sortOrder}
              />
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <ProjectRow 
                  key={project.id} 
                  project={project} 
                  isCreatedProject={isCreatedProjectsView}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            // Format deadline
            const formattedDeadline = project.deadline 
              ? new Date(project.deadline).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                }) 
              : 'No deadline';
            
            // Calculate progress (demo)
            const progress = getRandomProgress();
            
            return (
              <div 
                key={project.id} 
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 
                  ${isAnimated ? 'animate-cardFadeIn' : ''} cursor-pointer group`}
                style={{animationDelay: `${50 * index}ms`}}
                onClick={() => handleProjectClick(project)}
              >
                <div className={`h-1.5 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`}></div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.is_approved ? getStatusStyle(project.status) : 'bg-red-100 text-red-800'
                    }`}>
                      {project.is_approved ? project.status : "Not approved"}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-3">
                    <User className="h-3 w-3 mr-1" />
                    <span>{project.creator_id || 'Unknown creator'}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {project.description || "No description provided"}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${theme.primary}`}
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getPriorityIcon(project.priority)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityStyle(project.priority)}`}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formattedDeadline}
                    </div>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnifiedProjectTable;