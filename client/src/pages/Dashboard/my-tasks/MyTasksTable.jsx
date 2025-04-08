import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Filter, Edit3, ChevronDown, ChevronRight, X, Trash2, PlusCircle } from 'lucide-react';
import { z } from 'zod';
import AddAssigneesModal from '../project-view/components/AddAssigneesModal';

// Toast component for displaying success or error messages
const Toast = ({ message, type, onClose }) => { 
  // Automatically close the toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
 // Define the background color based on the type of message
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};
// Schema for validating the task details using Zod
const EditTaskDetailsSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters long' }).optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }).optional(),
  priority: z.enum(['0', '1', '2'], { 
      message: 'Priority must be 0 (low), 1 (medium), or 2 (high)'
  }).optional(),
  deadline: z.string().optional(),
  status: z.enum(['0', '1', '2'], { 
      message: 'Status must be 0 (to do), 1 (in progress), or 2 (completed)'
  }).optional(),
}).refine(data => Object.values(data).some(value => value !== undefined && value !== ''), {
  message: 'At least one field (title, description, priority, deadline, or status) must be provided'
});
// Modal for confirming task deletion
const DeleteModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 w-96 max-w-[90%] shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Delete Task</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{taskTitle}"? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
// Modal for editing task details
const EditModal = ({ isOpen, onClose, task, onSave, type }) => {
  const [editedTask, setEditedTask] = useState({ ...task });
  const [errors, setErrors] = useState({});
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isNewTask, setIsNewTask] = useState(false);
  const [isCreatedTask, setIsCreatedTask] = useState(false);

  // Update the modal form when the task data changes
  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsNewTask(!task._id && !task.id);
      
      // Check if this is a created task (created by the current user)
      const userEmail = localStorage.getItem('userEmail');
      setIsCreatedTask(task.creator_id === userEmail);
      
      // If it's a new task, fetch projects
      if (!task._id && !task.id) {
        fetchUserProjects();
      }
    }
  }, [task]);

  // Fetch projects the user is part of
  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrors({ ...errors, form: 'Authentication information missing' });
        return;
      }
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: 'http://localhost:3001',
        headers: { authorization: token }
      });
      
      // Fetch both created and assigned projects
      const createdProjectsResponse = await api.get('/project/my-created-projects');
      const assignedProjectsResponse = await api.get('/project/get-my-assigned-projects');
      
      // Combine both project lists and remove duplicates
      let allProjects = [];
      
      if (createdProjectsResponse.data && Array.isArray(createdProjectsResponse.data)) {
        allProjects = [...createdProjectsResponse.data];
      }
      
      if (assignedProjectsResponse.data && Array.isArray(assignedProjectsResponse.data)) {
        // Add assigned projects that aren't already in the list (avoiding duplicates)
        assignedProjectsResponse.data.forEach(project => {
          if (!allProjects.some(p => p.id === project.id)) {
            allProjects.push(project);
          }
        });
      }
      
      if (allProjects.length > 0) {
        setProjects(allProjects);
        
        // Select the first project by default
        if (!editedTask.project_id) {
          setEditedTask(prev => ({ ...prev, project_id: allProjects[0].id, project_name: allProjects[0].name }));
        }
      } else {
        setErrors({ ...errors, project: 'No projects found. Please create or join a project first.' });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrors({ ...errors, project: 'Failed to load projects' });
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changing status for created tasks
    if (name === 'status' && (isCreatedTask || (isNewTask && type === 'created'))) {
      return;
    }
    
    if (name === 'project_id' && value) {
      // When project is selected, also update project_name
      const selectedProject = projects.find(p => p.id === value);
      setEditedTask((prevTask) => {
        const updatedTask = { 
          ...prevTask, 
          [name]: value,
          project_name: selectedProject ? selectedProject.name : ''
        };
        validateForm(updatedTask);
        setIsFormChanged(JSON.stringify(updatedTask) !== JSON.stringify(task));
        return updatedTask;
      });
    } else {
      setEditedTask((prevTask) => {
        const updatedTask = { ...prevTask, [name]: value };
        validateForm(updatedTask);
        setIsFormChanged(JSON.stringify(updatedTask) !== JSON.stringify(task));
        return updatedTask;
      });
    }
  };

// Validate the form using Zod schema
  const validateForm = (formData) => {
      try {
          EditTaskDetailsSchema.parse(formData);
          setErrors({});
      } catch (error) {
          if (error instanceof z.ZodError) {
              const fieldErrors = {};
              error.errors.forEach((err) => {
                  fieldErrors[err.path[0]] = err.message;
              });
              setErrors(fieldErrors);
          }
      }
  };
// Save the edited task if validation passes
  const handleSave = () => {
    if (Object.keys(errors).length === 0 && (isFormChanged || isNewTask)) {
      onSave(editedTask);
    } else {
      setErrors({ ...errors, form: 'Please correct errors or make a change before saving' });
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={onClose}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg p-6 w-96 max-w-[90%] shadow-xl">
              <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                  <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-semibold mb-4">{isNewTask ? 'Create Task' : 'Edit Task'}</h2>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input 
                      type="text"
                      name="title"
                      value={editedTask.title || ''}
                      onChange={handleChange}
                      className="mt-1 px-3 py-2 border rounded-md w-full"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {isNewTask && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    name="project_id"
                    value={editedTask.project_id || ''}
                    onChange={handleChange}
                    className="mt-1 px-3 py-2 border rounded-md w-full"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
                </div>
              )}

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                      name="description"
                      value={editedTask.description || ''}
                      onChange={handleChange}
                      className="mt-1 px-3 py-2 border rounded-md w-full"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input 
                      type="date"
                      name="deadline"
                      value={editedTask.deadline ? new Date(editedTask.deadline).toISOString().split('T')[0] : ''}
                      onChange={handleChange}
                      className="mt-1 px-3 py-2 border rounded-md w-full"
                  />
                  {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                      name="priority"
                      value={editedTask.priority || ''}
                      onChange={handleChange}
                      className="mt-1 px-3 py-2 border rounded-md w-full"
                  >
                      <option value="">Select Priority</option>
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                  </select>
                  {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  {isCreatedTask || (isNewTask && type === 'created') ? (
                    <div className="mt-1 px-3 py-2 border rounded-md w-full bg-gray-100 text-gray-700">
                      To Do
                    </div>
                  ) : (
                    <select
                        name="status"
                        value={editedTask.status || ''}
                        onChange={handleChange}
                        className="mt-1 px-3 py-2 border rounded-md w-full"
                    >
                        <option value="">Select Status</option>
                        <option value="0">To Do</option>
                        <option value="1">In Progress</option>
                        <option value="2">Completed</option>
                    </select>
                  )}
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>

              {errors.form && <p className="text-red-500 text-xs mt-2">{errors.form}</p>}

              <div className="flex justify-end gap-3">
                  <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                      {isNewTask ? 'Create' : 'Save'}
                  </button>
              </div>
          </div>
      </div>
  );
};

const MyTasksTable = ({ type = 'assigned' }) => { 
// State to manage the list of all tasks fetched from the server
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);// State to store tasks after applying filters (e.g., search query or other criteria)
  const [loading, setLoading] = useState(true);// Loading indicator to display a spinner or message while tasks are being fetched
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());// State to manage which project rows are expanded in the UI (if tasks are grouped by project)
  // State to manage the delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: '',
    project_id:''
  });
  // State to manage the assignees modal
  const [assigneesModal, setAssigneesModal] = useState({
    isOpen: false,
    taskId: null
  });
   // Function to handle clicks for adding assignees to a specific task
  // It sets the `assigneesModal` state to open and assigns the task ID
  const handleAddAssigneesClick = (taskId) => {
    setAssigneesModal({
      isOpen: true,
      taskId
    });
  };
  
// Function to display a toast notification
  const showToast = (message, type) => {
      // Updates the toast state with a message and type (e.g., success or error)
    setToast({ message, type });
  };
  // State to manage the Edit Task modal visibility and content
  const [editModal, setEditModal] = useState({
    isOpen: false,// Tracks whether the modal is open or closed
    task: null // Holds the task object being edited, or null if no task is selected
  });
  
// Function to handle when the Delete button is clicked for a task
  const handleDeleteClick = useCallback((task) => {
    setDeleteModal({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title,
      project_id: task.project_id
    });
  }, []);

// Function to confirm task deletion

  const handleDeleteConfirm = useCallback(async () => {
    const taskId = deleteModal.taskId;
    try {
      const projectId = deleteModal.project_id;
      // Send a DELETE request to the API to remove the task
      await axios.delete(`http://localhost:3001/task/project/${projectId}/delete-task`, {
        data: { task_id: taskId }
      });
      // Update the tasks state to remove the deleted task
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      // Also update the filtered tasks state, in case a filter is applied
      setFilteredTasks(prevFilteredTasks => prevFilteredTasks.filter(task => task.id !== taskId));
      // Display a success toast notification
      showToast("Task deleted successfully", "success");
    } catch (error) {
      console.error('Delete task error:', error);
      showToast("Failed to delete task", "error");
    } finally {
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
    }
  }, [deleteModal.taskId, deleteModal.project_id]);
// Create axios instance with default config
  const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      'Authorization': localStorage.getItem('token')
    }
  });

  // Effect hook to fetch tasks whenever the 'type' prop changes
  useEffect(() => {
    fetchTasks();
  }, [type]);

  // Function to fetch tasks from the server
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log(`Fetching ${type} tasks for user:`, { userId, userEmail });
      
      let taskData = [];
      
      if (type === 'assigned') {
        taskData = await fetchAssignedTasks();
      } else {
        // For created tasks, use the existing approach
        const response = await api.get(
          `task/user/${userEmail}/created-tasks`,
        );
        taskData = response.data;
      }
      
      // Sort tasks by project, priority, and deadline
      const sortedTasks = taskData.sort((a, b) => {
        // First sort by project_id
        if (a.project_id && b.project_id) {
          const projectCompare = a.project_id.localeCompare(b.project_id);
          if (projectCompare !== 0) return projectCompare;
        }
        
        // Then sort by priority (high to low)
        if (a.priority && b.priority) {
          const priorityCompare = b.priority.localeCompare(a.priority);
          if (priorityCompare !== 0) return priorityCompare;
        }
        
        // Finally sort by deadline
        if (a.deadline && b.deadline) {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        
        return 0;
      });

      console.log(`Found ${sortedTasks.length} ${type} tasks after sorting`);
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
    } catch (error) {
      console.error(`Error fetching ${type} tasks:`, error);
      showToast(`Failed to fetch ${type} tasks`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('Fetching assigned tasks for user:', { userId, userEmail });
      
      // Try multiple endpoints to ensure we get the assigned tasks
      let response = null;
      let error = null;
      
      // First try with userId
      if (userId) {
        try {
          console.log(`Trying endpoint: http://localhost:3001/task/user/${userId}/assigned-tasks`);
          const resp = await api.get(
            `task/user/${userId}/assigned-tasks`,
          );
          
          if (resp.data && resp.data.length > 0) {
            console.log(`Found ${resp.data.length} assigned tasks using userId`);
            response = resp;
          } else {
            console.log('No tasks found using userId endpoint');
          }
        } catch (err) {
          console.error('Error with userId endpoint:', err);
          error = err;
        }
      }
      
      // If userId approach failed, try with email
      if (!response && userEmail) {
        try {
          console.log(`Trying endpoint: http://localhost:3001/task/user/${userEmail}/assigned-tasks`);
          const resp = await api.get(
            `task/user/${userEmail}/assigned-tasks`,
          );
          
          if (resp.data && resp.data.length > 0) {
            console.log(`Found ${resp.data.length} assigned tasks using userEmail`);
            response = resp;
          } else {
            console.log('No tasks found using userEmail endpoint');
          }
        } catch (err) {
          console.error('Error with userEmail endpoint:', err);
          if (!error) error = err;
        }
      }
      
      // If both approaches failed, try a generic endpoint
      if (!response) {
        try {
          console.log('Trying generic assigned tasks endpoint');
          const resp = await api.get(
            `task/assigned-tasks`,
          );
          
          if (resp.data && resp.data.length > 0) {
            console.log(`Found ${resp.data.length} assigned tasks using generic endpoint`);
            response = resp;
          } else {
            console.log('No tasks found using generic endpoint');
          }
        } catch (err) {
          console.error('Error with generic endpoint:', err);
          if (!error) error = err;
        }
      }
      
      // If we have a response, process it
      if (response) {
        return response.data;
      } else {
        // If all approaches failed, throw the error
        if (error) throw error;
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch assigned tasks:', error);
      showToast("Failed to fetch assigned tasks. Please try again later.", "error");
      return [];
    }
  };

  const handleEditClick = (task) => {
    setEditModal({
      isOpen: true,
      task
    });
  };
  
// Function to handle saving the edited task details
  const handleEditSave = async (editedTask) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the task in our local state
      const taskToUpdate = tasks.find(task => 
        (task._id && task._id === editedTask._id) || (task.id && task.id === editedTask.id)
      );
      
      if (!taskToUpdate) {
        showToast("Task not found", "error");
        return;
      }
      
      console.log(`Updating task ${editedTask._id || editedTask.id} details`);
      
      // Call the API to update the task details
      await axios.put(
        `http://localhost:3001/task/${editedTask._id || editedTask.id}/edit-details`,
        editedTask,
        {
          headers: {
            Authorization: token
          }
        }
      );
      
      // Update the task in local state
      const updatedTasks = tasks.map(task => {
        if ((task._id && task._id === editedTask._id) || (task.id && task.id === editedTask.id)) {
          return editedTask;
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      showToast("Task updated successfully", "success");
    } catch (error) {
      console.error('Edit task error:', error);
      showToast("Failed to update task", "error");
    } finally {
      setEditModal({ isOpen: false, task: null });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the task in our local state
      const taskToUpdate = tasks.find(task => 
        (task._id && task._id === taskId) || (task.id && task.id === taskId)
      );
      
      if (!taskToUpdate) {
        showToast("Task not found", "error");
        return;
      }
      
      // Use the correct ID field - the backend is looking for the 'id' field, not '_id'
      const correctTaskId = taskToUpdate.id || taskId;
      
      console.log(`Updating task ${correctTaskId} status to ${newStatus}`);
      
      // Call the API to update the task status - using the same endpoint as in AssignedTasks
      await axios.put(
        `http://localhost:3001/task/${correctTaskId}/edit-details`,
        { status: newStatus },
        {
          headers: {
            Authorization: `${token}`
          }
        }
      );
      
      // Update the task in local state
      const updatedTasks = tasks.map(task => {
        if ((task._id && task._id === taskId) || (task.id && task.id === taskId)) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      showToast("Task status updated successfully", "success");
    } catch (error) {
      console.error('Update task status error:', error);
      showToast("Failed to update task status", "error");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter the tasks based on the search query (case-insensitive search)
    const filtered = tasks.filter((task) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(lowerCaseQuery) ||
        task.description.toLowerCase().includes(lowerCaseQuery) ||
        task.project_name.toLowerCase().includes(lowerCaseQuery)
      );
    });
    // Update the filteredTasks state to reflect the filtered results
    setFilteredTasks(filtered);
  };
// Function to toggle the expanded/collapsed state of a project (used for project details or collapsible lists)
  const toggleProject = (projectId) => {
    // Create a copy of the existing set of expanded project IDs
    const newExpanded = new Set(expandedProjects);
    // If the project ID is already in the set, remove it to collapse the project
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };
// Function to format a date string into a human-readable format (dd/mm/yy)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };
// Function to return different styling based on the task's status value
  const getStatusStyle = (status) => {
    switch (status) {
      case "0": return "bg-gray-100 text-gray-800";
      case "1": return "bg-blue-100 text-blue-800";
      case "2": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case '0':
      case 0:
        return '#fee2e2'; // red-100
      case '1':
      case 1:
        return '#fef3c7'; // amber-100
      case '2':
      case 2:
        return '#dcfce7'; // green-100
      default:
        return '#f3f4f6'; // gray-100
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case '0':
      case 0:
        return '#991b1b'; // red-800
      case '1':
      case 1:
        return '#92400e'; // amber-800
      case '2':
      case 2:
        return '#166534'; // green-800
      default:
        return '#1f2937'; // gray-800
    }
  };

// Function to return a CSS class based on the task's priority value
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "0": return "bg-blue-100 text-blue-800";
      case "1": return "bg-yellow-100 text-yellow-800";
      case "2": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
// Function to return the status text based on the task's status value
  const getStatusText = (status) => {
    switch (status) {
      case "0": return "To Do";
      case "1": return "In Progress";
      case "2": return "Completed";
      default: return "Unknown";
    }
  };
// Function to return the priority text based on the task's priority value
  const getPriorityText = (priority) => {
    switch (priority) {
      case "0": return "Low";
      case "1": return "Medium";
      case "2": return "High";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Group tasks by project
  const tasksByProject = filteredTasks.reduce((acc, task) => {
    const projectId = task.project_id;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(task);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, task: null })}
        task={editModal.task}
        onSave={handleEditSave}
        type={type}
      />
      
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' })}
        onConfirm={handleDeleteConfirm}
        taskTitle={deleteModal.taskTitle}
      />
      
      <AddAssigneesModal
        isOpen={assigneesModal.isOpen}
        onClose={() => setAssigneesModal({ isOpen: false, taskId: null })}
        taskId={assigneesModal.taskId}
        onSuccess={fetchTasks}
      />

      {/* Header and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{type === 'assigned' ? 'Tasks Assigned to You' : 'Tasks Created by You'}</h1>
            <p className="text-gray-500 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {type === 'created' && (
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => setEditModal({ isOpen: true, task: { status: '0', priority: '1' } })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>New Task</span>
              </button>
            )}
            
            <button 
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              onClick={fetchTasks}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Task Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {type === 'created' ? (
            // For created tasks, show only Total Tasks and To Do
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-600 mb-1">Total Tasks</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">{filteredTasks.length}</p>
                  <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm font-medium text-red-600 mb-1">To Do</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">{filteredTasks.length}</p>
                  <div className="p-2 bg-red-100 rounded-md text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // For assigned tasks, show all statuses
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-600 mb-1">Total Tasks</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">{filteredTasks.length}</p>
                  <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredTasks.filter(task => task.status === '2' || task.status === 2).length}
                  </p>
                  <div className="p-2 bg-green-100 rounded-md text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm font-medium text-amber-600 mb-1">In Progress</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredTasks.filter(task => task.status === '1' || task.status === 1).length}
                  </p>
                  <div className="p-2 bg-amber-100 rounded-md text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm font-medium text-red-600 mb-1">To Do</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredTasks.filter(task => task.status === '0' || task.status === 0).length}
                  </p>
                  <div className="p-2 bg-red-100 rounded-md text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-600">Overall Progress</p>
            <p className="text-sm font-medium text-gray-600">
              {filteredTasks.length > 0 
                ? Math.round((filteredTasks.filter(task => task.status === '2' || task.status === 2).length / filteredTasks.length) * 100)
                : 0}%
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ 
                width: `${filteredTasks.length > 0 
                  ? Math.round((filteredTasks.filter(task => task.status === '2' || task.status === 2).length / filteredTasks.length) * 100)
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
          
          <div className="flex gap-2">
            {type === 'created' ? (
              // For created tasks, no status filter needed since all tasks are "To Do"
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  // Filter by priority
                  const priority = e.target.value;
                  if (priority === 'all') {
                    setFilteredTasks(tasks);
                  } else {
                    setFilteredTasks(tasks.filter(task => task.priority === priority));
                  }
                }}
              >
                <option value="all">All Priorities</option>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            ) : (
              // For assigned tasks, show all status filters
              <>
                <select
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // Filter by status
                    const status = e.target.value;
                    if (status === 'all') {
                      setFilteredTasks(tasks);
                    } else {
                      setFilteredTasks(tasks.filter(task => task.status === status));
                    }
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="0">To Do</option>
                  <option value="1">In Progress</option>
                  <option value="2">Completed</option>
                </select>
                
                <select
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // Filter by priority
                    const priority = e.target.value;
                    if (priority === 'all') {
                      setFilteredTasks(tasks);
                    } else {
                      setFilteredTasks(tasks.filter(task => task.priority === priority));
                    }
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="0">Low</option>
                  <option value="1">Medium</option>
                  <option value="2">High</option>
                </select>
              </>
            )}
            
            <button 
              type="submit" 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              onClick={handleSearch}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {type === 'assigned' 
                ? "You don't have any assigned tasks yet." 
                : "You haven't created any tasks yet."}
            </p>
            {type === 'created' && (
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                onClick={() => setEditModal({ isOpen: true, task: { status: '0', priority: '1' } })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
              <div key={projectId} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer border-b border-gray-200"
                  onClick={() => toggleProject(projectId)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${expandedProjects.has(projectId) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {expandedProjects.has(projectId) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{projectTasks[0].project_name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {projectTasks.filter(t => t.status === '2' || t.status === 2).length} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full max-w-[100px] bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ 
                          width: `${Math.round((projectTasks.filter(t => t.status === '2' || t.status === 2).length / projectTasks.length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round((projectTasks.filter(t => t.status === '2' || t.status === 2).length / projectTasks.length) * 100)}%
                    </span>
                  </div>
                </div>

                {expandedProjects.has(projectId) && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Task</th>
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">Deadline</th>
                          <th className="w-10"></th>
                          <th className="w-10"></th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {projectTasks.map((task) => (
                          <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{task.title}</span>
                                <span className="text-xs text-gray-500 mt-1">{task.creator_id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-[200px] truncate text-sm text-gray-600" title={task.description}>
                                {task.description || "No description provided"}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {type === 'created' ? (
                                <span className="inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  To Do
                                </span>
                              ) : (
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task._id || task.id, e.target.value)}
                                  className="px-3 py-1 rounded-full text-xs font-medium border-none focus:ring-0 cursor-pointer"
                                  style={{ 
                                    backgroundColor: getStatusBgColor(task.status),
                                    color: getStatusTextColor(task.status)
                                  }}
                                >
                                  <option value="0">To Do</option>
                                  <option value="1">In Progress</option>
                                  <option value="2">Completed</option>
                                </select>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                                {getPriorityText(task.priority)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-xs text-gray-500">{formatDate(task.created_at)}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-xs text-gray-500">
                                {task.deadline ? formatDate(task.deadline) : "No deadline"}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <button
                                onClick={() => handleAddAssigneesClick(task._id)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                title="Add Assignees"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                              </button>
                            </td>
                            <td className="py-4 px-2">
                              {type === 'created' ? (
                                <div></div> // Empty div for created tasks (no edit button)
                              ) : (
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>
                              )}
                            </td>
                            <td className="py-4 px-2">
                              <button
                                onClick={() => handleDeleteClick(task)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredTasks.length}</span> of <span className="font-medium">{tasks.length}</span> tasks
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-600 border-blue-200">
                1
              </button>
              <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksTable;
