import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faTasks, faUsers, faBell, faTachometerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { sidebarSelection } from '../../../../store/atoms/adminDashboardAtoms';
import axios from 'axios';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const setSidebarSelection = useSetRecoilState(sidebarSelection);
  const [active, setActive] = useState("dashboard");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setSidebarSelection("dashboard");
    fetchNotification();
  }, [setSidebarSelection]);

  useEffect(() => {
    fetchNotification();
  }, [active]);

  const fetchNotification = async () => {
    try {
      const uid = localStorage.getItem("userId");
      const res = await axios.get(`http://localhost:3001/comment/total-unread/${uid}`);
      if (res.data.success) {
        setUnreadNotifications(res.data.total_unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white w-64 transform transition-transform duration-300 ease-in-out z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-56`}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Main Menu</h2>
          </div>

          <nav className="flex-1 px-4 py-5 overflow-y-auto">
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "dashboard" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("dashboard"); setActive("dashboard"); }}
                >
                  <FontAwesomeIcon 
                    icon={faTachometerAlt} 
                    className={`w-5 h-5 mr-3 ${active === "dashboard" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Dashboard</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "your-projects" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("your-projects"); setActive("your-projects"); }}
                >
                  <FontAwesomeIcon 
                    icon={faFolder} 
                    className={`w-5 h-5 mr-3 ${active === "your-projects" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Your Projects</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "projects" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("projects"); setActive("projects"); }}
                >
                  <FontAwesomeIcon 
                    icon={faFolder} 
                    className={`w-5 h-5 mr-3 ${active === "projects" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Assigned Projects</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "tasks" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("tasks"); setActive("tasks"); }}
                >
                  <FontAwesomeIcon 
                    icon={faTasks} 
                    className={`w-5 h-5 mr-3 ${active === "tasks" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Assigned Tasks</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "created-tasks" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("created-tasks"); setActive("created-tasks"); }}
                >
                  <FontAwesomeIcon 
                    icon={faTasks} 
                    className={`w-5 h-5 mr-3 ${active === "created-tasks" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Created Tasks</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "notifications" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("notifications"); setActive("notifications"); }}
                >
                  <FontAwesomeIcon 
                    icon={faBell} 
                    className={`w-5 h-5 mr-3 ${active === "notifications" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "users" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("users"); setActive("users"); }}
                >
                  <FontAwesomeIcon 
                    icon={faUsers} 
                    className={`w-5 h-5 mr-3 ${active === "users" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Users</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "mail" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("mail"); setActive("mail"); }}
                >
                  <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className={`w-5 h-5 mr-3 ${active === "mail" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Mail</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
