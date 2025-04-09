import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// DropdownButton Component
// Renders individual dropdown menu items with a label and URL
// Props:
// - label: text to display for the menu item
// - url: link destination for the menu item
// - onClick: optional click handler
const DropdownButton = ({ label, url, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {label}
      </button>
    </li>
  );
};

// DropdownMenu Component
// Renders the complete dropdown menu including user info and navigation items
const DropdownMenu = ({ onLogout }) => {
  const userName = localStorage.getItem('userName') || 'Admin User';
  const userEmail = localStorage.getItem('userEmail') || 'admin@example.com';
  const profileImage = localStorage.getItem('userProfileImage') || "https://flowbite.com/docs/images/people/profile-picture-5.jpg";

  // Array of menu items with their labels and URLs
  const menuItems = [
    { label: "Dashboard", url: "#" },
    { label: "Settings", url: "#" },
    { label: "Sign out", url: "#", onClick: onLogout },
  ];

  return (
    <div
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden"
      style={{ top: "100%", zIndex: 50 }}
    >
      {/* User Information Section */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center">
        <img 
          src={profileImage} 
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
      </div>
      {/* Navigation Menu Items */}
      <ul className="py-1">
        {menuItems.map((item, index) => (
          <DropdownButton 
            key={index} 
            label={item.label} 
            url={item.url} 
            onClick={item.onClick}
          />
        ))}
      </ul>
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  // State to manage dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('userProfileImage') || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
  );

  // Toggle function for dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfileImage');
    navigate('/');
  };

  // Update profile image when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem('userProfileImage');
      if (updatedImage) {
        setProfileImage(updatedImage);
      }
    };

    // Listen for storage events (changes in localStorage)
    window.addEventListener('storage', handleStorageChange);
    
    // Initial check for profile image
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Sidebar Toggle */}
          <div className="flex items-center justify-start rtl:justify-end">
            {/* Hamburger menu button for mobile sidebar */}
            <button
              data-drawer-target="logo-sidebar"
              data-drawer-toggle="logo-sidebar"
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">Open sidebar</span>
              {/* Hamburger menu icon */}
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
            {/* Logo and Brand Name */}
            <div className="flex ms-2 md:me-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-blue-600">
                Team Sync
              </span>
            </div>
          </div>

          {/* Right side - User Profile Section */}
          <div className="flex items-center">
            <div className="flex items-center ms-3 relative">
              {/* User Profile Button */}
              <div>
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                  aria-expanded={dropdownOpen}
                  onClick={toggleDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={profileImage}
                    alt="User profile"
                  />
                </button>
              </div>

              {/* Conditional rendering of dropdown menu */}
              {dropdownOpen && <DropdownMenu onLogout={handleLogout} />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                  <div className="py-2 px-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Your Projects</p>
                  </div>
                  
                  {loading ? (
                    <div className="py-4 px-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-gray-500 mt-1">Loading projects...</p>
                    </div>
                  ) : (
                    <>
                      <ul className="max-h-60 overflow-y-auto">
                        {projects && projects.length > 0 ? (
                          projects.map(project => (
                            <li key={project.id}>
                              <button 
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                                  selectedProject?.id === project.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                                onClick={() => handleProjectSelect(project)}
                              >
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    project.status === 'completed' ? 'bg-green-500' : 
                                    project.status === 'in progress' ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <span className="truncate max-w-[180px]">{project.name}</span>
                                </div>
                                {selectedProject?.id === project.id && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Current</span>
                                )}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-sm text-gray-500 text-center">
                            No projects found
                          </li>
                        )}
                      </ul>
                      
                      <div className="py-2 px-4 border-t border-gray-100">
                        <button 
                          className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1"
                          onClick={() => {
                            setProjectDropdownOpen(false);
                            setSelectedSidebar('projects');
                          }}
                        >
                          View All Projects
                        </button>
                        <button 
                          className="w-full text-left text-sm text-green-600 hover:text-green-800 py-1"
                          onClick={() => {
                            setProjectDropdownOpen(false);
                            navigate('/create-project');
                          }}
                        >
                          + Create New Project
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                src={profileImage} 
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
                <div className="py-3 px-4 border-b border-gray-100 flex items-center">
                  <img 
                    src={profileImage} 
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
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
      
      {isModalOpen && <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} onResetPassword={handleResetPasswordOpen} />}
      {isResetPasswordOpen && <ResetPassword setResetPasswordOpen={setResetPasswordOpen} />}
    </nav>
  );
};

export default Navbar;
