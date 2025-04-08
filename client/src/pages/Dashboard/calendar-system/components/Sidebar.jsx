import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  addDays
} from 'date-fns';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Grid, 
  Clock, 
  List,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import axios from 'axios';
import './Calendar.css';

const Sidebar = ({ 
  onDateSelect, 
  currentView, 
  onViewChange, 
  onScheduleClick,
  tasks = [],
  refreshTasks
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate days for the mini calendar
  const days = (() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  })();

  // Process tasks when they change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      processUpcomingTasks(tasks);
    } else {
      fetchUpcomingTasks();
    }
  }, [tasks, refreshTasks]);

  // Process tasks from props
  const processUpcomingTasks = (taskList) => {
    try {
      // Parse deadline strings to Date objects and sort by deadline
      const tasksWithDates = taskList
        .map(task => ({
          ...task,
          deadline: task.deadline ? (typeof task.deadline === 'string' ? parseISO(task.deadline) : task.deadline) : null
        }))
        .filter(task => task.deadline) // Only include tasks with deadlines
        .sort((a, b) => a.deadline - b.deadline); // Sort by deadline (earliest first)
      
      // Get only upcoming tasks (today and future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = tasksWithDates.filter(task => 
        task.deadline >= today && task.status !== '2' // Not completed
      ).slice(0, 10); // Limit to 10 tasks
      
      setUpcomingTasks(upcoming);
      setError('');
    } catch (err) {
      console.error('Error processing tasks:', err);
      setError('Failed to process tasks');
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true);
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
      
      // Convert map back to array
      const allTasks = Array.from(taskMap.values());
      
      processUpcomingTasks(allTasks);
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Handle date click in mini calendar
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case '0': return 'bg-green-500';
      case '1': return 'bg-yellow-500';
      case '2': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case '0': return <Circle className="h-4 w-4 text-gray-400" />;
      case '1': return <Clock className="h-4 w-4 text-yellow-500" />;
      case '2': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="sidebar-container h-full flex flex-col">
      {/* Header */}
      <div className="sidebar-header p-4 border-b">
        <button
          onClick={onScheduleClick}
          className="create-task-button"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
        
        {/* View Selection */}
        <div className="sidebar-view-buttons">
          <button
            onClick={() => onViewChange('month')}
            className={`sidebar-view-button ${currentView === 'month' ? 'active' : ''}`}
          >
            <Grid size={18} />
            <span>Month</span>
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`sidebar-view-button ${currentView === 'week' ? 'active' : ''}`}
          >
            <CalendarIcon size={18} />
            <span>Week</span>
          </button>
          <button
            onClick={() => onViewChange('agenda')}
            className={`sidebar-view-button ${currentView === 'agenda' ? 'active' : ''}`}
          >
            <List size={18} />
            <span>Agenda</span>
          </button>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="p-4 border-b">
        <div className="mini-calendar">
          {/* Mini Calendar Header */}
          <div className="mini-calendar-header">
            <button onClick={previousMonth} className="mini-calendar-nav-button">
              <ChevronLeft size={16} />
            </button>
            <h3 className="mini-calendar-title">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={nextMonth} className="mini-calendar-nav-button">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mini-calendar-weekdays">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="mini-calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="mini-calendar-days">
            {days.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              
              // Check if there are tasks for this day
              const hasTasksForDay = upcomingTasks.some(task => 
                task.deadline && isSameDay(task.deadline, day)
              );
              
              return (
                <button
                  key={dayIdx}
                  onClick={() => handleDateClick(day)}
                  className={`
                    mini-calendar-day
                    ${!isCurrentMonth ? 'other-month' : ''}
                    ${isToday(day) ? 'today' : ''}
                    ${isSelected ? 'selected' : ''}
                    ${hasTasksForDay ? 'has-tasks' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasTasksForDay && <span className="task-indicator"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Tasks</h3>
        
        {loading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Loading tasks...
          </div>
        )}
        
        {error && (
          <div className="text-center py-4 text-red-500 text-sm flex items-center justify-center">
            <AlertCircle size={14} className="mr-1" />
            {error}
          </div>
        )}
        
        {!loading && !error && upcomingTasks.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No upcoming tasks
          </div>
        )}
        
        <div className="space-y-3">
          {upcomingTasks.map((task, index) => (
            <div key={index} className="upcoming-task">
              <div className="flex items-start">
                <div className={`upcoming-task-priority ${getPriorityColor(task.priority)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="upcoming-task-title">{task.title}</h4>
                    {getStatusIcon(task.status)}
                  </div>
                  <p className="upcoming-task-date">
                    {format(task.deadline, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;