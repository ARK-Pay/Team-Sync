import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, projectId, onTaskAdded }) => {
    const [taskDetails, setTaskDetails] = useState({
        title: '',
        description: '',
        priority: '1', // Medium priority by default
        deadline: '',
        status: '0', // To Do status by default (hardcoded)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'status') {
            return;
        }
        setTaskDetails({ ...taskDetails, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!projectId) {
            setError("Project ID is missing. Please try again.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail');
            const projectName = localStorage.getItem('project_name');
            
            // Add project name and creator to the task details
            const taskData = {
                ...taskDetails,
                creator_id: userEmail,
                project_name: projectName
            };

            console.log("Sending task data:", taskData);

            const response = await axios.post(
                `http://localhost:3001/task/project/${projectId}/create-task`, 
                taskData, 
                {
                    headers: { 
                        "authorization": token,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Task created response:", response.data);
            
            // Clear form fields
            setTaskDetails({
                title: '',
                description: '',
                priority: '1',
                deadline: '',
                status: '0',
            });
            
            // Notify parent component
            if (onTaskAdded) {
                onTaskAdded();
            }
            
            // Close modal
            onClose();
        } catch (error) {
            console.error('Error creating task:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white rounded-lg w-[600px] max-w-[95%] p-6 max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Task Title*
                        </label>
                        <input 
                            type="text"
                            name="title"
                            value={taskDetails.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Description*
                        </label>
                        <textarea
                            name="description"
                            value={taskDetails.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the task details"
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Priority
                            </label>
                            <div className="relative">
                                <select
                                    name="priority"
                                    value={taskDetails.priority}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="0">Low</option>
                                    <option value="1">Medium</option>
                                    <option value="2">High</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Deadline*
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    name="deadline"
                                    value={taskDetails.deadline}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center ${
                                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                            } transition-colors`}
                        >
                            {loading ? (
                                <>
                                    <Clock className="animate-spin h-4 w-4 mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
0"
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