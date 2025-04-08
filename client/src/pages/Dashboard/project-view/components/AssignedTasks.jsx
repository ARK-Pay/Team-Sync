import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Filter, Plus, Search, X, CheckCircle, AlertTriangle, Edit, Trash, Users } from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import AddAssigneesModal from './AddAssigneesModal';

const AssignedTasks = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAssigneesModal, setShowAssigneesModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  useEffect(() => {
    // Apply filters whenever tasks, search query or filters change
    let filtered = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      console.log(`Fetching tasks for project: ${projectId}`);
      
      const response = await axios.get(
        `http://localhost:3001/task/project/${projectId}/tasks`,
        {
          headers: {
            Authorization: token
          }
        }
      );
      
      console.log("API Response:", response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Invalid response format:", response.data);
        setTasks([]);
        setFilteredTasks([]);
        setIsLoading(false);
        return;
      }
      
      // Sort tasks by status, priority
      const sortedTasks = response.data.sort((a, b) => {
        // First sort by status (To Do first, then In Progress, then Completed)
        const statusCompare = a.status.localeCompare(b.status);
        if (statusCompare !== 0) return statusCompare;
        
        // Then sort by priority (high to low)
        return b.priority.localeCompare(a.priority);
      });
      
      console.log(`Found ${sortedTasks.length} tasks`);
      
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
      showToast("Failed to fetch tasks", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskAdded = () => {
    fetchTasks();
    showToast("Task added successfully", "success");
  };

  const handleAssigneesUpdated = () => {
    fetchTasks();
    showToast("Assignees updated successfully", "success");
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the task in local state
      const taskToUpdate = tasks.find(task => 
        (task._id && task._id === taskId) || (task.id && task.id === taskId)
      );
      
      if (!taskToUpdate) {
        showToast("Task not found", "error");
        return;
      }
      
      // Use the correct ID field - the backend is looking for the 'id' field, not '_id'
      const correctTaskId = taskToUpdate.id || taskId;
      
      await axios.put(
        `http://localhost:3001/task/${correctTaskId}/edit-details`,
        { status: newStatus },
        {
          headers: {
            Authorization: `${token}`
          }
        }
      );
      
      // Update task in local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      showToast("Task status updated", "success");
    } catch (error) {
      showToast("Failed to update task status", "error");
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:3001/task/${taskId}`,
          {
            headers: {
              Authorization: token
            }
          }
        );
        
        // Remove task from local state
        setTasks(tasks.filter(task => task.id !== taskId));
        showToast("Task deleted successfully", "success");
      } catch (error) {
        showToast("Failed to delete task", "error");
        console.error("Error deleting task:", error);
      }
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "0": return "To Do";
      case "1": return "In Progress";
      case "2": return "Completed";
      default: return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "0": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "1": return <Clock className="w-4 h-4 text-blue-500" />;
      case "2": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "0": return "bg-yellow-100 text-yellow-800";
      case "1": return "bg-blue-100 text-blue-800";
      case "2": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "0": return "Low";
      case "1": return "Medium";
      case "2": return "High";
      default: return "Unknown";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "0": return "bg-blue-100 text-blue-800";
      case "1": return "bg-yellow-100 text-yellow-800";
      case "2": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const isRecentlyCreated = (task) => {
    const taskDate = new Date(task.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - taskDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            <span>{toast.message}</span>
            <button 
              className="ml-4" 
              onClick={() => setToast(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <h2 className="text-2xl font-semibold mb-4 lg:mb-0">Assigned Tasks</h2>
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filters - moved into a separate container with more spacing */}
      <div className="mb-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="0">To Do</option>
                <option value="1">In Progress</option>
                <option value="2">Completed</option>
              </select>
            </div>
            
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignees
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative group">
                      <div className="flex items-center cursor-pointer">
                        {getStatusIcon(task.status)}
                        <div className="ml-2 flex items-center">
                          <span className={`px-2 py-1 rounded-md text-sm ${getStatusClass(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Dropdown menu */}
                      <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg hidden group-hover:block">
                        <div className="py-1">
                          <button 
                            onClick={() => handleStatusChange(task.id, "0")}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${task.status === "0" ? "bg-gray-100" : ""}`}
                          >
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                              <span>To Do</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(task.id, "1")}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${task.status === "1" ? "bg-gray-100" : ""}`}
                          >
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-blue-500 mr-2" />
                              <span>In Progress</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(task.id, "2")}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${task.status === "2" ? "bg-gray-100" : ""}`}
                          >
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Completed</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(task.deadline)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                        <>
                          {task.assignees.slice(0, 3).map((assignee, idx) => (
                            <div 
                              key={idx} 
                              className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white"
                              title={assignee.name || 'User'}
                            >
                              {assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs border-2 border-white">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setShowAssigneesModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Assign
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setShowAssigneesModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Manage Assignees"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Task"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Task
          </button>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          projectId={projectId}
          onTaskAdded={handleTaskAdded}
        />
      )}

      {/* Add Assignees Modal */}
      {showAssigneesModal && (
        <AddAssigneesModal
          isOpen={showAssigneesModal}
          onClose={() => setShowAssigneesModal(false)}
          taskId={selectedTaskId}
          onSuccess={handleAssigneesUpdated}
        />
      )}
    </div>
  );
};

export default AssignedTasks; 