import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

//
// Functional component for adding a new project
const AddProjectModal = ({ isOpen, onClose }) => {
  // State variables for project details and validation
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    projectName: false,
    projectDescription: false,
    deadline: false,
    priority: false,
    tags: false,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setProjectDescription('');
      setDeadline('');
      setPriority('medium');
      setTagInput('');
      setTags([]);
      setErrors({});
      setTouched({
        projectName: false,
        projectDescription: false,
        deadline: false,
        priority: false,
        tags: false,
      });
    }
  }, [isOpen]);

  // Effect to validate project name when touched
  useEffect(() => {
    if (touched.projectName) validateProjectName(projectName);
  }, [projectName, touched.projectName]);

  // Effect to validate project description when touched
  useEffect(() => {
    if (touched.projectDescription) validateProjectDescription(projectDescription);
  }, [projectDescription, touched.projectDescription]);

  // Effect to validate deadline when touched
  useEffect(() => {
    if (touched.deadline) validateDeadline(deadline);
  }, [deadline, touched.deadline]);

  // Effect to validate tags when touched
  useEffect(() => {
    if (touched.tags) validateTags(tags);
  }, [tags, touched.tags]);

  // Asynchronous function to check if a project name already exists
  const checkProjectNameExists = async (name) => {
    try {
      const response = await axios.get(`http://localhost:3001/project/check-name?name=${name}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking project name:', error);
      return false;
    }
  };

  // Handles the key down event for tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      
      // Validate tag length
      if (newTag.length < 2) {
        setErrors(prev => ({ ...prev, tags: 'Tags must be at least 2 characters long' }));
        return;
      }
      
      // Check for duplicate tags
      if (tags.includes(newTag)) {
        setErrors(prev => ({ ...prev, tags: 'This tag already exists' }));
        return;
      }

      setTags(prev => [...prev, newTag]);
      setTagInput('');
      setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  // Removes a tag from the list of tags
  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Handles the form submission for creating a new project
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setTouched({
      projectName: true,
      projectDescription: true,
      deadline: true,
      priority: true,
      tags: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const projectNameExists = await checkProjectNameExists(projectName);
        if (projectNameExists) {
          toast.error('A project with this name already exists. Please choose a different name.');
          setIsSubmitting(false);
          return;
        }
        const token = localStorage.getItem('token');
        const formattedDeadline = formatDeadline(deadline);
        const projectData = {
          name: projectName,
          description: projectDescription,
          deadline: formattedDeadline,
          priority,
          tags,
          createdAt: new Date().toISOString() // Add creation date for sorting
        };

        const response = await axios.post('http://localhost:3001/project/create', projectData, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          toast.success('Project created successfully!');
          resetForm();
          onClose(); // Call onClose to trigger dashboard refresh in parent component
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400 && error.response.data.message) {
            if (error.response.data.message.includes('same name')) {
              toast.error('A project with this name already exists. Please try another name.');
            } else {
              toast.error('There was an issue with your project details. Please check and try again.');
            }
          } else if (error.response.status === 401) {
            toast.error('Unauthorized! Please log in again.');
          } else if (error.response.status === 500) {
            toast.error('Internal server error! Please try again later.');
          }
        } else {
          toast.error('An unexpected error occurred!');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form fields
  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setDeadline('');
    setPriority('medium');
    setTagInput('');
    setTags([]);
    setErrors({});
    setTouched({
      projectName: false,
      projectDescription: false,
      deadline: false,
      priority: false,
      tags: false,
    });
  };

  // Formats the deadline date from YYYY-MM-DD to DD/MM/YYYY
  const formatDeadline = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  // Validates the project name for minimum length
  const validateProjectName = (name) => {
    if (name.length < 4) {
      setErrors(prev => ({ ...prev, projectName: 'Project name must be at least 4 characters long' }));
    } else {
      setErrors(prev => ({ ...prev, projectName: undefined }));
    }
  };

  // Validates the project description for minimum length
  const validateProjectDescription = (description) => {
    if (description.length < 4) {
      setErrors(prev => ({ ...prev, projectDescription: 'Project description must be at least 4 characters long' }));
    } else {
      setErrors(prev => ({ ...prev, projectDescription: undefined }));
    }
  };

  // Validates the deadline to ensure it is at least 2 days ahead
  const validateDeadline = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    const minDeadline = new Date(currentDate.setDate(currentDate.getDate() + 2));
    if (!date || selectedDate < minDeadline) {
      setErrors(prev => ({ ...prev, deadline: 'Deadline must be at least 2 days ahead of today' }));
    } else {
      setErrors(prev => ({ ...prev, deadline: undefined }));
    }
  };

  // Validates the tags to ensure at least one tag is present
  const validateTags = (tags) => {
    if (tags.length === 0) {
      setErrors(prev => ({ ...prev, tags: 'At least one tag is required' }));
    } else {
      setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  // Validates the entire form and returns any errors found
  const validateForm = () => {
    const errors = {};
    if (projectName.length < 4) {
      errors.projectName = 'Project name must be at least 4 characters long';
    }
    if (projectDescription.length < 4) {
      errors.projectDescription = 'Project description must be at least 4 characters long';
    }
    const selectedDate = new Date(deadline);
    const currentDate = new Date();
    const minDeadline = new Date(currentDate.setDate(currentDate.getDate() + 2));
    if (!deadline || selectedDate < minDeadline) {
      errors.deadline = 'Deadline must be at least 2 days ahead of today';
    }
    if (tags.length === 0) {
      errors.tags = 'At least one tag is required';
    }
    return errors;
  };

  // Marks a field as touched for validation purposes
  const handleFocus = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Closes the modal when clicking outside of it
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <>
      <ToastContainer />
      {isOpen && (
        <div className="modal-overlay z-50 fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center transition-opacity duration-300" onClick={handleOutsideClick}>
        <div className="bg-white p-5 rounded-lg shadow-lg max-w-md w-full relative">
          <h2 className="text-lg font-semibold mb-2">Add New Project</h2>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-700 shadow-2xl text-4xl"
            >
              &times;
            </button>

            <form onSubmit={handleSubmit}>
              {/* Project Name */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onFocus={() => handleFocus('projectName')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.projectName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
                )}
              </div>

              {/* Project Description */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Project Description
                </label>
                <textarea
                  placeholder="Enter project description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  onFocus={() => handleFocus('projectDescription')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.projectDescription ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows="3"
                ></textarea>
                {errors.projectDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectDescription}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onFocus={() => handleFocus('deadline')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.deadline && (
                  <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                )}
              </div>

              {/* Priority */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-800 hover:text-red-500 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add a tag (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => handleFocus('tags')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.tags ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProjectModal;