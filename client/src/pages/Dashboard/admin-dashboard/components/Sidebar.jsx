import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faFolder, 
  faTasks, 
  faFileAlt, 
  faUsers, 
  faLifeRing,
  faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { userNameState, userEmailState } from '../../../../store/atoms/authAtoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sidebarSelection } from '../../../../store/atoms/adminDashboardAtoms';
import { useDispatch } from "react-redux";
import { logout } from '../../../../redux/userSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

// Reusable component for rendering sidebar menu items with icons
const IconItem = ({ icon, label, active = false }) => {
  return (
    <a
      href="#"
      className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group transition-colors
        ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
    >
      <FontAwesomeIcon 
        icon={icon} 
        className={`w-5 h-5 transition duration-75 
          ${active ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}
      />
      <span className="flex-1 ms-3 whitespace-nowrap">{label}</span>
    </a>
  );
};

// Sidebar component to handle navigation and user actions
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const setSidebarSelection = useSetRecoilState(sidebarSelection);
  const [active,setactive]=useState("approved");
  const dispatch = useDispatch();

  useEffect(()=>{
    //on initial render automatically render the approved projects
    setSidebarSelection("approved");
  },[])

  const handleLogout = () => {
    // Clear local storage items
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    dispatch(logout());

    // Redirect to home page
    navigate('/');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-10
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-56
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-center relative">
            <div className="text-2xl font-bold">Team Sync</div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors absolute right-4"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 mx-6"></div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-2 font-medium">
              <li onClick={() => {
                navigate('/');
              }}><IconItem icon={faHome} label="Home" /></li>
              <li onClick={()=>{
                setactive("approved");
                setSidebarSelection("approved");
              }}><IconItem icon={faFolder} label="Approved" active={active==="approved"} /></li>

              <li onClick={()=>{
                setactive("need-approval");
                setSidebarSelection("need-approval");
              }}><IconItem icon={faFolder} label="Need Approval" active={active==="need-approval"} /></li>
              {/* <li><IconItem icon={faFileAlt} label="File Manager" /></li> */}

              <li onClick={()=>{
                setactive("users");
                setSidebarSelection("users");
              }}><IconItem icon={faUsers} label="Users" active={active==="users"} /></li>
              {/* <li><IconItem icon={faLifeRing} label="Support" /></li> */}
              <li onClick={()=>{
                setactive("admins");
                setSidebarSelection("admins");
              }}><IconItem icon={faUsers} label="Admins" active={active==="admins"} /></li>
              <li onClick={()=>{
                setactive("mail");
                setSidebarSelection("mail");
              }}><IconItem icon={faEnvelope} label="Mail" active={active==="mail"} /></li>
              <li onClick={()=>{
                setactive("figma");
                setSidebarSelection("figma");
              }}>
                <a
                  href="#"
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group transition-colors
                    ${active === "figma" ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className={`w-5 h-5 transition duration-75 
                      ${active === "figma" ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
                    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
                    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
                    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
                    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Figma Designs</span>
                </a>
              </li>

            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <img
                className="w-10 h-10 rounded-full"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="User Profile"
              />
              <div>
                <p className="font-semibold text-gray-800">{userName || "admin"}</p>
                <p className="text-sm text-gray-500">{userEmail || "admin@mail.com"}</p>
              </div>
            </div>
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
            >
              Logout <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;