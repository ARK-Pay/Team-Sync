// AddTaskModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserPlus, FaTimes } from 'react-icons/fa';
import AddAssigneesModal from '../components/AddAssigneesModal';

// AddTaskModal component for creating a new task
const AddTaskModal = ({ isOpen, onClose, initialDate = '', onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(initialDate || '');
  const [priority, setPriority] = useState('1');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [assigneesModal, setAssigneesModal] = useState({
    isOpen: false,
    taskId: null,
  });

  useEffect(() => {
    // Fetch user's projects when component mounts
    fetchUserProjects();
    
    // Set initial deadline if provided
    if (initialDate) {
      setDeadline(initialDate);
    }
  }, [initialDate]);

  // Fetch projects the user is part of
  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication information missing');
        return;
      }
      
      // Fetch both created and assigned projects
      const createdProjectsResponse = await axios.get(
        'http://localhost:3001/project/my-created-projects',
        {
          headers: { authorization: token },
        }
      );
      
      const assignedProjectsResponse = await axios.get(
        'http://localhost:3001/project/get-my-assigned-projects',
        {
          headers: { authorization: token },
        }
      );
      
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
      
      console.log('Fetched projects:', allProjects);
      
      if (allProjects.length > 0) {
        setProjects(allProjects);
        
        // If there's a project_id in localStorage and it's in the list, select it
        const storedProjectId = localStorage.getItem('project_id');
        if (storedProjectId && allProjects.some(p => p.id === storedProjectId)) {
          setSelectedProject(storedProjectId);
        } else if (allProjects.length > 0) {
          // Otherwise select the first project
          setSelectedProject(allProjects[0].id);
        }
      } else {
        toast.warning('No projects found. Please create or join a project first.');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const formErrors = {};
    
    if (!title.trim()) {
      formErrors.title = 'Title is required';
    }
    
    if (!deadline) {
      formErrors.deadline = 'Deadline is required';
    }
    
    if (!selectedProject) {
      formErrors.project = 'Please select a project';
    }
    
    return formErrors;
  };

  // Submits the form data to create a new task
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const creatorId = localStorage.getItem('userEmail');
    
    // Find the selected project to get its name
    const selectedProjectObj = projects.find(p => p.id === selectedProject);
    const project_name = selectedProjectObj ? selectedProjectObj.name : '';

    try {
      // Step 1: Create the task without assignees
      const response = await axios.post(
        `http://localhost:3001/task/project/${selectedProject}/create-task`,
        {
          title,
          description,
          deadline,
          status: '0',
          priority,
          creator_id: creatorId,
          project_name,
        },
        {
          headers: { authorization: token },
        }
      );

      if (response.status === 201) {
        // Step 2: If task creation is successful, assign the creator to the task
        try {
          const taskId = response.data.task.id;
          await axios.post(
            `http://localhost:3001/task/assign`,
            {
              task_id: taskId,
              assignee_ids: [creatorId]
            },
            {
              headers: { authorization: token },
            }
          );
          console.log('Creator assigned to task successfully');
        } catch (assignError) {
          console.error('Error assigning creator to task:', assignError);
          // Continue even if assignment fails
        }

        toast.success('Task created successfully!');
        setTitle('');
        setDescription('');
        setDeadline('');
        setPriority('1');
        
        // Call the onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated(response.data.task);
        } else {
          onClose();
        }
      }
    } catch (error) {
      const { status } = error.response;
      if (status === 400) toast.error('Invalid task data. Please check the details.');
      else if (status === 404) toast.error('Project not found.');
      else if (status === 500) toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Opens the assignees modal for a specific task
  const handleAddAssigneesClick = (taskId) => {
    setAssigneesModal({
      isOpen: true,
      taskId,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Project Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project && (
                <p className="text-red-500 text-xs mt-1">{errors.project}</p>
              )}
            </div>

            {/* Task Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Task Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Task Deadline */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.deadline && (
                <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
              )}
            </div>

            {/* Task Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="0"
                    checked={priority === '0'}
                    onChange={() => setPriority('0')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Low</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="1"
                    checked={priority === '1'}
                    onChange={() => setPriority('1')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Medium</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="2"
                    checked={priority === '2'}
                    onChange={() => setPriority('2')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">High</span>
                </label>
              </div>
            </div>

            {/* Add Assignee Button */}
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleAddAssigneesClick(' ')}
                className="text-blue-950 hover:text-blue-900 transition-colors"
                title="Add Assignee"
              >
                <FaUserPlus size={24} />
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {assigneesModal.isOpen && (
        <AddAssigneesModal
          isOpen={assigneesModal.isOpen}
          onClose={() => setAssigneesModal({ isOpen: false, taskId: null })}
          taskId={assigneesModal.taskId}
          onSuccess={() => {}}
        />
      )}
    </>
  );
};

export default AddTaskModal;