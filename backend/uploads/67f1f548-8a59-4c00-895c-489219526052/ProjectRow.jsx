import { useState, useEffect, useRef } from 'react';
import { Check, MoreVertical, } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectRow = ({ project, onArchive, onProjectApproved }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // "approve" or "archive"
  const dropdownRef = useRef(null);
  const [progress, setProgress]=useState(0);

  // Opens the modal and sets the action type (approve/archive)
  const openModal = (action) => {
    setModalAction(action);
    setShowModal(true);
    setDropdownOpen(false);
  };

  // Closes the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalAction(null);
  };

  // Handles project approval
  const handleApprove = async () => {
    const toastId = toast.loading('Approving project...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/admin/approve-project',
        {
          project_id: project.id,
          status: 'approved',
        },
        {
          headers: {
            'authorization': token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Project has been approved successfully.', { id: toastId });
        setShowModal(false);
        
        // Instead of reloading the page, refresh the data or update UI
        if (typeof onProjectApproved === 'function') {
          onProjectApproved(project.id);
        } else {
          // Refresh only the current component without full page reload
          window.location.href = '/dashboard/admin';
        }
      }
    } catch (error) {
      toast.error('Failed to approve the project.', { id: toastId });
    }
  };

  // Handles project archiving
  const handleArchive = async () => {
    const toastId = toast.loading('Archiving project...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3001/admin/archive',
        {
          project_id: project.id,
        },
        {
          headers: {
            'authorization': token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Project has been archived successfully.', { id: toastId });
        setShowModal(false);
        onArchive(project.id); // Notify the parent to archive the project
      }
    } catch (error) {
      toast.error('Failed to archive the project.', { id: toastId });
    }
  };

  const formattedDeadline = new Date(project.deadline).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutsideDropdown);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const fetchCompletionPercentage = async () => {
      const projectid=project.id;
      try {
        const token=localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3001/project/report/${projectid}`, {
          headers: {
            'authorization': token,
          },
        });
        const value=(response.data.completedTasks/response.data.totalTasks)*100;
        const completionPercentage = parseFloat(value || 0).toFixed(2);
        setProgress(completionPercentage);
      } catch (error) {
        console.error('Error fetching completion percentage:', error);
      }
    };

    fetchCompletionPercentage();
  }, [project.id]);

  return (
    <>
      {/* Render the modal outside of the table structure */}
      {showModal && (
        <ConfirmationModal
          action={modalAction}
          onClose={handleCloseModal}
          onConfirm={modalAction === 'approve' ? handleApprove : handleArchive}
        />
      )}
      
      {/* Table row */}
      <tr className="border-b last:border-b-0 hover:bg-gray-50">
        <td className="py-4 px-4 md:px-4 max-w-[150px] truncate">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium text-sm md:text-md line-clamp-1">{project.name}</div>
              <div className="text-xs text-gray-500" title={project.creator_id}>
                {project.creator_id.length > 16 ? project.creator_id.slice(0, 16) + '...' : project.creator_id}
              </div>
            </div>
          </div>
        </td>
        <td className="py-4 px-2">
          <span
            className={`inline-flex justify-center items-center px-2 py-1 rounded-full text-xs ${
              project.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {project.is_approved ? project.status : 'Need Approval'}
          </span>
        </td>
        <td className="py-3 px-2 md:px-4 text-xs md:table-cell">
          <div className="break-words max-w-[200px]" title={project.description}>
            {project.description}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex -space-x-2 relative">
            {[...Array(Math.min(3, project.noUsers))].map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/32?img=${i + 1}`}
                alt={`Member ${i + 1}`}
                className="w-7 h-7 rounded-full border-2 border-white"
              />
            ))}
            {project.noUsers > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">
                +{project.noUsers - 3}
              </div>
            )}
          </div>
        </td>
        <td className="py-4 px-4 md:px-4">
          <ProgressBar progress={progress || 0} />
        </td>
        <td className="py-4 ps-7 px-4">
          <div className="text-xs text-gray-500">{formattedDeadline}</div>
        </td>
        <td className="py-4 px-2 relative">
          <div className="flex items-center gap-2">
            {/* Approve Project Icon - Only show if not approved */}
            {!project.is_approved && (
              <button
                onClick={() => openModal('approve')}
                className="p-1.5 hover:bg-green-100 rounded-full transition-colors duration-200 group relative"
                title="Approve Project"
              >
                <Check className="h-5 w-5 text-green-600 cursor-pointer" />
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 top-full mt-1 whitespace-nowrap">
                  Approve Project
                </span>
              </button>
            )}
            
            {/* Three Dots Menu */}
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
            {dropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                {project.is_approved && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-100"
                    onClick={() => openModal('archive')}
                  >
                    Archive Project
                  </button>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
};

const ConfirmationModal = ({ action, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  const modalTitle = action === 'approve' ? 'Approve Project' : 'Archive Project';
  const modalMessage =
    action === 'approve'
      ? 'Are you sure you want to approve this project?'
      : 'Are you sure you want to archive this project?';

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutsideModal);
    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">{modalTitle}</h2>
        <p className="text-gray-700 mb-4">{modalMessage}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center justify-center min-w-[100px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ProjectRow };
export default ProjectRow;
        <img
            src={`https://i.pravatar.cc/32?img=${index + 1}`}
            alt={member.name}
            className="w-7 h-7 rounded-full border-2 border-white object-cover"
          />
        </div>
      ))}
      {members.length > 3 && (
        <div
          className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 relative"
          style={{ zIndex: 0 }}
        >
          +{members.length - 3}
        </div>
      )}
    </div>
  </td>
  <td className="py-3 px-2 md:px-4">
    <ProgressBar progress={progress || 0} />
  </td>
  <td className="py-3 ps-5 px-2 md:px-4 text-xs text-gray-500">
    {formattedDeadline}
  </td>
  <td className="py-3 px-2 md:px-4">
    <span
      className={`inline-flex justify-center items-center px-2 py-1 rounded-full text-xs ${getPriorityStyle(project.priority)}`}
    >
      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
    </span>
  </td>
  <td className="py-3 px-2 relative" ref={dropdownRef}>
    {isCreatedProject && (
      <div className="flex gap-1">
        <button className="p-2 hover:bg-blue-50 rounded-full cursor-pointer" onClick={handleAddUsers}>
          <Plus className="w-4 h-4 text-green-500" />
        </button>
        <button className="p-2 hover:bg-blue-50 rounded-full cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <Edit3 className="w-4 h-4 text-blue-500" />
        </button>
      </div>
    )}
  </td>
</tr>


      {/* User Addition Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={addUserModalRef} className="bg-white rounded-lg p-6 w-[425px] max-w-full mx-4 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add Users</h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUsers([]);
                    setSearchTerm('');
                  }} 
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Users List */}
              <div className="flex-grow overflow-y-auto mb-4 border rounded-md">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className={`flex justify-between items-center p-3 border-b last:border-b-0 transition-colors ${
                        user.isDisabled ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-medium ${user.isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
                          {user.name}
                        </span>
                        <span className={`text-sm ${user.isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email}
                        </span>
                        {user.isDisabled && (
                          <span className="text-xs text-gray-500 italic mt-1">
                            Already a member
                          </span>
                        )}
                      </div>
                      {user.isDisabled ? (
                        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-md">
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!selectedUsers.some(selected => selected.id === user.id)) {
                              setSelectedUsers([...selectedUsers, user]);
                            }
                          }}
                          disabled={selectedUsers.some(selected => selected.id === user.id)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            selectedUsers.some(selected => selected.id === user.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {selectedUsers.some(selected => selected.id === user.id) ? 'Selected' : 'Add'}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No users found matching your search.
                  </div>
                )}
              </div>

              {/* Selected Users Section */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Users ({selectedUsers.length})</h4>
                  <div className="border rounded-md max-h-[150px] overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div key={user.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{user.name}</span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                        <button
                          onClick={() => removeUser(user)}
                          className="text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  selectedUsers.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
                disabled={isLoading || selectedUsers.length === 0}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    <span>Adding Users...</span>
                  </div>
                ) : (
                  `Add ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        )}
{/*Edit project modal */}
{isEditModalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center">
    <div ref={modalRef} className="bg-white p-6 rounded-md shadow-lg w-11/12 max-w-md relative">
      
      <button
        onClick={() => setIsEditModalOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      
      <h2 className="text-xl font-semibold mb-4 pr-8">Edit Project</h2>
      <label className="block mb-2">
        Description
        <input
          type="text"
          value={updatedAbout}
          onChange={(e) => setUpdatedAbout(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </label>
      <label className="block mb-2">
        Status
        <select
          value={updatedStatus}
          onChange={(e) => setUpdatedStatus(e.target.value)}
          className="border rounded w-full p-2 mt-1 bg-white"
        >
          <option value="active">Active</option>
          <option value="reviewing">Reviewing</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label className="block mb-2">
        Deadline
        <input
          type="date"
          value={updatedDeadline}
          onChange={(e) => setUpdatedDeadline(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </label>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleEditSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

// Export both as named and default export for maximum compatibility
export { ProjectRow };
export default ProjectRow;
