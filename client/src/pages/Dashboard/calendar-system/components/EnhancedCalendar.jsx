import React, { useState, useEffect, useRef } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isToday, 
  isSameMonth, 
  isSameDay,
  addDays,
  parseISO,
  getDay
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  X, 
  AlertTriangle,
  Check,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';
import axios from 'axios';
import './Calendar.css';

const EnhancedCalendar = ({ 
  onScheduleTask, 
  selectedDate: propSelectedDate, 
  currentDate: propCurrentDate,
  view: propView,
  onViewChange,
  tasks: propTasks = [],
  refreshTasks
}) => {
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date());
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || null);
  const [view, setView] = useState(propView || 'month'); // month, week, agenda
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    priority: '1', // medium priority by default
    status: '0', // not started by default
    deadline: format(new Date(), 'yyyy-MM-dd'),
    project_id: ''
  });
  
  const calendarRef = useRef(null);

  // Update state when props change
  useEffect(() => {
    if (propCurrentDate) {
      setCurrentDate(propCurrentDate);
    }
  }, [propCurrentDate]);

  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  useEffect(() => {
    if (propView) {
      setView(propView);
    }
  }, [propView]);

  // Update tasks when propTasks changes
  useEffect(() => {
    if (propTasks && propTasks.length > 0) {
      // Process tasks from props
      const processedTasks = propTasks.map(task => ({
        ...task,
        deadline: task.deadline ? (typeof task.deadline === 'string' ? parseISO(task.deadline) : task.deadline) : null
      }));
      setTasks(processedTasks);
    } else {
      // If no tasks are provided via props, fetch them
      fetchTasks();
    }
  }, [propTasks, refreshTasks]);
  
  // Calculate days for the month view
  const days = (() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  })();
  
  // Calculate days for the week view
  const weekDays = (() => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  })();
  
  // Fetch projects and tasks on component mount
  useEffect(() => {
    fetchProjects();
    if (!propTasks || propTasks.length === 0) {
      fetchTasks();
    }
  }, []);
  
  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/project/user-projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    }
  };
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found');
      }
      
      // Fetch tasks assigned to the user
      const assignedResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/task/user/${userEmail}/assigned-tasks`, {
        headers: {
          authorization: token
        }
      });
      
      // Fetch tasks created by the user
      const createdResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/task/user/${userEmail}/created-tasks`, {
        headers: {
          authorization: token
        }
      });
      
      // Combine and deduplicate tasks
      const assignedTasks = assignedResponse.data.tasks || [];
      const createdTasks = createdResponse.data || [];
      
      // Create a map to deduplicate tasks by ID
      const taskMap = new Map();
      
      // Add all tasks to the map (this will automatically deduplicate by ID)
      [...assignedTasks, ...createdTasks].forEach(task => {
        taskMap.set(task.id, task);
      });
      
      // Convert map back to array and parse deadline strings to Date objects
      const allTasks = Array.from(taskMap.values()).map(task => ({
        ...task,
        deadline: task.deadline ? parseISO(task.deadline) : null
      }));
      
      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    }
  };
  
  // Handle task creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      if (!taskDetails.project_id) {
        throw new Error('Please select a project');
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/task/project/${taskDetails.project_id}/create-task`,
        taskDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new task to the tasks array
      const newTask = {
        ...response.data.task,
        deadline: taskDetails.deadline ? parseISO(taskDetails.deadline) : null,
        project_name: projects.find(p => p._id === taskDetails.project_id)?.name || 'Unknown Project'
      };
      
      setTasks([...tasks, newTask]);
      
      // Reset form and close modal
      setTaskDetails({
        title: '',
        description: '',
        priority: '1',
        status: '0',
        deadline: format(new Date(), 'yyyy-MM-dd'),
        project_id: ''
      });
      
      setShowTaskModal(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation functions
  const nextMonth = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    }
  };
  
  const previousMonth = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle date click
  const handleDateClick = (date, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedDate(date);
    
    // Always use the onScheduleTask callback if provided
    if (onScheduleTask) {
      onScheduleTask(date);
    } else {
      setTaskDetails({
        ...taskDetails,
        deadline: format(date, 'yyyy-MM-dd')
      });
      setShowTaskModal(true);
    }
  };
  
  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.deadline && isSameDay(task.deadline, date)
    );
  };
  
  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case '0': return 'bg-green-500';
      case '1': return 'bg-yellow-500';
      case '2': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case '0': return 'Not Started';
      case '1': return 'In Progress';
      case '2': return 'Completed';
      default: return 'Unknown';
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails({
      ...taskDetails,
      [name]: value
    });
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Render month view
  const renderMonthView = () => {
    return (
      <div className="calendar-grid">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="calendar-weekday"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayTasks = getTasksForDate(day);
          
          return (
            <div
              key={dayIdx}
              onClick={(e) => handleDateClick(day, e)}
              className={`
                calendar-day
                ${!isCurrentMonth ? 'other-month' : ''}
                ${isToday(day) ? 'today' : ''}
                ${isSelected ? 'selected' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className="calendar-day-number">
                  {format(day, 'd')}
                </span>
                
                {isCurrentMonth && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(day, e);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              
              {/* Task indicators */}
              <div className="mt-1 space-y-1 max-h-[70px] overflow-y-auto">
                {dayTasks.slice(0, 3).map((task, idx) => (
                  <div 
                    key={idx} 
                    className={`calendar-task task-priority-${task.priority === '0' ? 'low' : task.priority === '1' ? 'medium' : 'high'}`}
                  >
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="week-view-container">
        <div className="week-header">
          {/* Time column header */}
          <div className="week-header-cell">
            Time
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`week-header-cell ${isToday(day) ? 'today' : ''}`}
            >
              <div className="week-header-day">{format(day, 'EEE')}</div>
              <div className="week-header-date">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="week-grid">
          {hours.map((hour) => (
            <div key={hour} className="week-hour-cell">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
          
          {/* Hour cells for each day of the week */}
          {weekDays.map((day, dayIdx) => 
            hours.map((hour, hourIdx) => {
              const currentHourDate = new Date(day);
              currentHourDate.setHours(hour);
              
              // Get tasks that fall on this day
              const dayTasks = tasks.filter(task => 
                task.deadline && isSameDay(task.deadline, day)
              );
              
              return (
                <div 
                  key={`${dayIdx}-${hourIdx}`} 
                  className="week-time-cell"
                  onClick={(e) => {
                    const newDate = new Date(day);
                    newDate.setHours(hour);
                    handleDateClick(newDate, e);
                  }}
                >
                  {/* Task items */}
                  {hour < 12 && dayTasks.map((task, idx) => (
                    <div 
                      key={idx} 
                      className={`calendar-task task-priority-${task.priority === '0' ? 'low' : task.priority === '1' ? 'medium' : 'high'}`}
                      style={{display: idx === 0 ? 'block' : 'none'}} // Only show one task per hour for simplicity
                    >
                      <div className="font-medium truncate">{task.title}</div>
                    </div>
                  ))}
                </div>
              );
            })
          ).flat()}
        </div>
      </div>
    );
  };

  // Render agenda view
  const renderAgendaView = () => {
    // Group tasks by date
    const groupedTasks = tasks.reduce((acc, task) => {
      if (!task.deadline) return acc;
      
      const dateStr = format(task.deadline, 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(task);
      return acc;
    }, {});
    
    // Sort dates
    const sortedDates = Object.keys(groupedTasks).sort();
    
    return (
      <div className="agenda-container">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks scheduled
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const date = parseISO(dateStr);
            const dateTasks = groupedTasks[dateStr];
            
            return (
              <div key={dateStr} className="agenda-day">
                <div className={`agenda-day-header ${isToday(date) ? 'today' : ''}`}>
                  {isToday(date) ? 'Today' : format(date, 'EEEE, MMMM d, yyyy')}
                </div>
                
                <div className="agenda-tasks">
                  {dateTasks.map((task, idx) => (
                    <div key={idx} className="agenda-task">
                      <div className="flex items-start">
                        <div className={`w-3 h-3 rounded-full mt-1 mr-2 ${getPriorityColor(task.priority)}`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-0.5 rounded-full ${
                              task.status === '2' ? 'bg-green-100 text-green-800' : 
                              task.status === '1' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusText(task.status)}
                            </span>
                            <span className="ml-2">{task.project_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow calendar-container" ref={calendarRef}>
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="flex items-center">
          <h2 className="calendar-title">
            {view === 'month' ? format(currentDate, 'MMMM yyyy') : 
             view === 'week' ? `Week of ${format(weekDays[0], 'MMM d')}` : 
             'Agenda View'}
          </h2>
          <div className="calendar-navigation ml-4">
            <button
              onClick={previousMonth}
              className="calendar-nav-button"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="calendar-nav-button"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goToToday}
              className="google-calendar-button google-calendar-button-secondary ml-2 px-3 py-1 text-sm"
            >
              Today
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View selector */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => handleViewChange('month')}
              className={`px-3 py-1.5 text-sm flex items-center ${view === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <Grid size={16} className="mr-1" />
              Month
            </button>
            <button
              onClick={() => handleViewChange('week')}
              className={`px-3 py-1.5 text-sm flex items-center ${view === 'week' ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <CalendarIcon size={16} className="mr-1" />
              Week
            </button>
            <button
              onClick={() => handleViewChange('agenda')}
              className={`px-3 py-1.5 text-sm flex items-center ${view === 'agenda' ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <List size={16} className="mr-1" />
              Agenda
            </button>
          </div>
          
          {/* Add task button */}
          <button
            onClick={() => {
              const today = new Date();
              setSelectedDate(today);
              
              if (onScheduleTask) {
                onScheduleTask(today);
              } else {
                setTaskDetails({
                  ...taskDetails,
                  deadline: format(today, 'yyyy-MM-dd')
                });
                setShowTaskModal(true);
              }
            }}
            className="google-calendar-button google-calendar-button-primary flex items-center gap-1"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="mt-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'agenda' && renderAgendaView()}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="task-modal-overlay">
          <div className="task-modal">
            <button 
              onClick={() => setShowTaskModal(false)}
              className="task-modal-close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask}>
              {/* Project Selection */}
              <div className="mb-4">
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  value={taskDetails.project_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={taskDetails.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={taskDetails.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Task Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="0"
                      checked={taskDetails.priority === '0'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Low</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="1"
                      checked={taskDetails.priority === '1'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Medium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="2"
                      checked={taskDetails.priority === '2'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">High</span>
                  </label>
                </div>
              </div>

              {/* Task Status */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={taskDetails.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Not Started</option>
                  <option value="1">In Progress</option>
                  <option value="2">Completed</option>
                </select>
              </div>

              {/* Task Deadline */}
              <div className="mb-6">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={taskDetails.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="google-calendar-button google-calendar-button-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="google-calendar-button google-calendar-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCalendar;
