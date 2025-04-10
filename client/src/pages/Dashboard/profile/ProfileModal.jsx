import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle, FaUserEdit, FaKey, FaUpload, FaUserAlt } from 'react-icons/fa';
import { X, Camera, CheckCircle2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sample avatar options - in a real application, these would be imported from files
const avatarOptions = [
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pumpkin' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: 7, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby' },
  { id: 8, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
];

/**
 * ProfileModal component displays a modal for user profile management.
 * It allows users to view and edit their profile information.
 */
const ProfileModal = ({ isOpen, onClose, onResetPassword }) => { 
  // Retrieve user information from local storage
  const user = {
    name: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    status: 'verified', 
    joinDate: localStorage.getItem("userJoindate"),
    profileImage: localStorage.getItem("userProfileImage") || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
  };
  
  // Fetch user profile from server on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:3001/user/profile', {
          headers: { authorization: token }
        });
        
        if (response.data.success && response.data.user.profile_image) {
          // Update profile image from server data
          setProfileImage(response.data.user.profile_image);
          localStorage.setItem('userProfileImage', response.data.user.profile_image);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Format the join date to a more readable format
  const formattedJoinDate = new Date(user.joinDate).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
  });

  // State to manage editing mode and profile details
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const fileInputRef = useRef(null);

  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('dashboard_theme') || 'blue';
  
  // Define theme colors
  const themes = {
    blue: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-500',
      light: 'bg-blue-50'
    },
    green: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      light: 'bg-emerald-50'
    },
    purple: {
      primary: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      text: 'text-purple-600',
      border: 'border-purple-500',
      light: 'bg-purple-50'
    },
    amber: {
      primary: 'bg-amber-600',
      hover: 'hover:bg-amber-700',
      text: 'text-amber-600',
      border: 'border-amber-500',
      light: 'bg-amber-50'
    },
  };
  
  const theme = themes[currentTheme];

  // If the modal is not open, return null to prevent rendering
  if (!isOpen) return null;

  // Function to enable editing mode
  const handleEditProfile = () => {
    setIsEditing(true); 
  };

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target.result);
      setSelectedAvatar(null);
    };
    reader.readAsDataURL(file);
  };

  // Function to select a predefined avatar
  const handleAvatarSelect = (avatar) => {
    setProfileImage(avatar.url);
    setSelectedAvatar(avatar.id);
    setShowAvatarOptions(false);
  };

  // Function to save the updated profile information
  const handleSave = async () => {
    // Validate the new name input
    if (newName.length < 2) {
      toast.error('Username must be at least 2 characters long.');
      return;
    }
    
    setLoading(true);
    
    try {
      // First, save to localStorage for immediate display
      localStorage.setItem('userProfileImage', profileImage);
      
      // Then try to save the profile image to the server
      try {
        console.log('Sending profile image to server:', profileImage);
        const imageResponse = await axios({
          method: 'put',
          url: 'http://localhost:3001/user/update-profile-image',
          data: { profileImage },
          headers: { 
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('token') 
          }
        });
        
        if (imageResponse.status === 200) {
          console.log('Profile image saved to server successfully');
        }
      } catch (imageError) {
        console.error('Error saving profile image to server:', imageError.response?.data || imageError);
        // We already saved to localStorage above, so the UI will still update
      }
      
      // Send a PUT request to update the user's name
      const nameResponse = await axios.put(
        'http://localhost:3001/user/edit-name',
        { name: newName },
        { headers: { authorization: localStorage.getItem('token') } }
      );

      // If name update is successful
      if (nameResponse.status === 200) {
        localStorage.setItem('userName', newName);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      // Handle errors based on response status
      if (error.response?.status === 400) {
        toast.error('Invalid input. Please try again.');
      } else {
        console.error('Error updating profile:', error);
        toast.error('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick />
      <div className="relative max-w-md w-full bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-4">
          <div className="pt-6 relative group">
            {isEditing ? (
              <>
                <div className="w-24 h-24 relative rounded-full overflow-hidden border-2 border-gray-200 mb-3">
                  <img 
                    className="w-full h-full object-cover" 
                    src={profileImage} 
                    alt="User profile" 
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs">Change</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <div className="flex flex-col">
                  <button 
                    type="button"
                    className={`text-sm ${theme.text} hover:underline mb-2`}
                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                  >
                    {showAvatarOptions ? 'Hide Avatars' : 'Choose from Avatars'}
                  </button>
                  
                  {showAvatarOptions && (
                    <div className="bg-white rounded-lg shadow-lg border p-3 grid grid-cols-4 gap-2 mt-2">
                      {avatarOptions.map(avatar => (
                        <div 
                          key={avatar.id} 
                          className={`relative rounded-full overflow-hidden cursor-pointer border-2 ${selectedAvatar === avatar.id ? `${theme.border}` : 'border-transparent'}`}
                          onClick={() => handleAvatarSelect(avatar)}
                        >
                          <img src={avatar.url} alt={`Avatar ${avatar.id}`} className="w-14 h-14" />
                          {selectedAvatar === avatar.id && (
                            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <img className="w-24 h-24 rounded-full mb-3 object-cover border-2 border-gray-200" src={profileImage} alt="User profile" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            {user.status === 'verified' ? (
              <FaCheckCircle className="text-green-500 w-5 h-5" title="Verified User" />
            ) : (
              <FaExclamationCircle className="text-red-500 w-5 h-5" title="Blocked User" />
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">{user.email}</p>
          <p className="text-sm text-gray-400 mt-2">Joined on: {formattedJoinDate}</p>
        </div>

        {isEditing ? (
          <div className="flex flex-col mt-4">
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`border-2 ${theme.border} rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.text}`}
                placeholder="Enter new username"
              />
            </div>
            <div className="flex justify-between space-x-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center justify-center w-full ${theme.primary} text-white py-2 px-4 rounded-lg shadow ${theme.hover} transition-colors duration-200`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setProfileImage(user.profileImage);
                  setNewName(user.name);
                  setShowAvatarOptions(false);
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-3 mt-6">
            <button 
              onClick={handleEditProfile} 
              className={`flex items-center justify-center flex-1 ${theme.primary} text-white py-2 px-4 rounded-lg shadow ${theme.hover} transition-colors duration-200`}
            >
              <FaUserEdit className="mr-2" />
              Edit Profile
            </button>
            <button 
              className="flex items-center justify-center flex-1 bg-green-600 text-white py-2 px-4 rounded-lg shadow hover:bg-green-700 transition-colors duration-200" 
              onClick={onResetPassword}
            >
              <FaKey className="mr-2" />
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
