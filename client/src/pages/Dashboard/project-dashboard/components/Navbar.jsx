import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logout } from '../../../../redux/userSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser, faCog, faSignOutAlt, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import ProfileModal from '../../profile/ProfileModal';
import ResetPassword from "../../../../components/ResetPassword";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);
  
  const userName = localStorage.getItem('userName') || 'Guest';
  const userEmail = localStorage.getItem('userEmail') || 'No email';
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    dispatch(logout());
    navigate('/');
  };
  
  const handleOpenProfile = () => {
    setProfileDropdownOpen(false);
    setModalOpen(true);
  };
  
  const handleResetPasswordOpen = () => {
    setModalOpen(false);
    setResetPasswordOpen(true);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center">
          <div className="text-blue-600 font-bold text-xl mr-8">Team Sync</div>
          
          <div className="hidden md:flex space-x-4 ml-4">
            <div className="flex items-center space-x-1 text-gray-700 cursor-pointer py-2 px-3 rounded hover:bg-gray-100">
              <span className="text-sm font-medium">Project 0</span>
              <FontAwesomeIcon icon={faCaretDown} className="text-xs" />
            </div>
            <div className="flex items-center space-x-1 text-gray-700 cursor-pointer py-2 px-3 rounded hover:bg-gray-100">
              <span className="text-sm font-medium">Access Manager</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="hidden md:flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
            <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-3 focus:outline-none py-2 px-3 rounded hover:bg-gray-100"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <img 
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" 
                style={{ borderRadius: '40% / 50%' }}
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" 
                alt="User Profile" 
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <FontAwesomeIcon icon={faCaretDown} className="text-gray-400 text-xs" />
            </button>
            
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
                <ul>
                  <li>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleOpenProfile}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setResetPasswordOpen(true)}
                    >
                      <FontAwesomeIcon icon={faCog} className="mr-2 text-gray-500" />
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && <ProfileModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onResetPassword={handleResetPasswordOpen} />}
      {isResetPasswordOpen && <ResetPassword setResetPasswordOpen={setResetPasswordOpen} />}
    </nav>
  );
};

export default Navbar;
