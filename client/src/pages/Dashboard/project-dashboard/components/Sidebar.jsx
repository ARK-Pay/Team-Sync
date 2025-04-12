import React, { useEffect, useState } from 'react';
import { X, Video, FileText, Code, Megaphone } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faTasks, faUsers, faBell, faTachometerAlt, faEnvelope, faCalendar } from '@fortawesome/free-solid-svg-icons';
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

              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "calendar" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSidebarSelection("calendar"); setActive("calendar"); }}
                >
                  <FontAwesomeIcon 
                    icon={faCalendar} 
                    className={`w-5 h-5 mr-3 ${active === "calendar" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Calendar</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "video-call" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { navigate("/video-call"); setActive("video-call"); }}
                >
                  <Video 
                    className={`w-5 h-5 mr-3 ${active === "video-call" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Video Call</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "document-summarizer" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { navigate("/document-summarizer"); setActive("document-summarizer"); }}
                >
                  <FileText 
                    className={`w-5 h-5 mr-3 ${active === "document-summarizer" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Summarize Docs</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "figma" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { navigate("/figma"); setActive("figma"); }}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className={`w-5 h-5 mr-3 ${active === "figma" ? 'text-blue-600' : 'text-gray-500'}`}
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
                  <span className="font-medium">Figma Designs</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "editor" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { navigate("/editor"); setActive("editor"); }}
                >
                  <Code 
                    className={`w-5 h-5 mr-3 ${active === "editor" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Code Editor</span>
                </a>
              </li>
              
              <li>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-2.5 text-gray-700 rounded-md ${active === "marketing" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => { navigate("/marketing"); setActive("marketing"); }}
                >
                  <Megaphone 
                    className={`w-5 h-5 mr-3 ${active === "marketing" ? 'text-blue-600' : 'text-gray-500'}`} 
                  />
                  <span className="font-medium">Marketing</span>
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
