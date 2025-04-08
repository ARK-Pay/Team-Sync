import React, { useState, useEffect } from 'react';
import EnhancedCalendar from './components/EnhancedCalendar';
import Sidebar from './components/Sidebar';
import AddTaskModal from '../project-view/task/AddTaskModal';
import axios from 'axios';
import { format } from 'date-fns';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTasksFlag, setRefreshTasksFlag] = useState(0);

  // Fetch tasks on component mount and when refreshTasksFlag changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTasksFlag]);

  // Fetch tasks from API
  const fetchTasks = async () => {
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
      
      setTasks(allTasks);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Handle scheduling a task
  const handleScheduleTask = (date) => {
    setSelectedDate(date);
    setShowAddTaskModal(true);
  };

  // Handle task creation
  const handleTaskCreated = (newTask) => {
    // Close the modal
    setShowAddTaskModal(false);
    
    // Refresh tasks to include the newly created task
    setRefreshTasksFlag(prev => prev + 1);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200">
        <Sidebar
          onDateSelect={handleDateSelect}
          currentView={currentView}
          onViewChange={handleViewChange}
          onScheduleClick={() => setShowAddTaskModal(true)}
          tasks={tasks}
          refreshTasks={refreshTasksFlag}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <EnhancedCalendar
          onScheduleTask={handleScheduleTask}
          selectedDate={selectedDate}
          currentDate={currentDate}
          view={currentView}
          onViewChange={handleViewChange}
          tasks={tasks}
          refreshTasks={refreshTasksFlag}
        />
      </div>
      
      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          initialDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default CalendarPage;