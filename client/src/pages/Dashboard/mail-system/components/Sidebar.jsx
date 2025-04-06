import React from 'react';
import { Inbox, Send, FileText, Trash, Star, Archive, Plus } from 'lucide-react';

const Sidebar = ({ currentFolder, onFolderChange, onComposeClick }) => {
  // Folder structure with icons
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: <Inbox size={18} /> },
    { id: 'sent', name: 'Sent', icon: <Send size={18} /> },
    { id: 'drafts', name: 'Drafts', icon: <FileText size={18} /> },
    { id: 'trash', name: 'Trash', icon: <Trash size={18} /> },
    { id: 'starred', name: 'Starred', icon: <Star size={18} /> },
    { id: 'archived', name: 'Archived', icon: <Archive size={18} /> },
  ];

  // Labels/tags
  const labels = [
    { id: 'urgent', name: 'Urgent', color: 'bg-red-500' },
    { id: 'design', name: 'Design', color: 'bg-purple-500' },
    { id: 'teamA', name: 'Team A', color: 'bg-blue-500' },
    { id: 'teamB', name: 'Team B', color: 'bg-green-500' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      {/* Compose Button */}
      <button
        onClick={onComposeClick}
        className="flex items-center justify-center gap-2 mb-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus size={18} />
        <span>Compose</span>
      </button>

      {/* Folders */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Folders</h3>
        <ul>
          {folders.map((folder) => (
            <li key={folder.id}>
              <button
                onClick={() => onFolderChange(folder.id)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${currentFolder === folder.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="mr-3">{folder.icon}</span>
                <span>{folder.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Labels */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labels</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus size={16} />
          </button>
        </div>
        <ul>
          {labels.map((label) => (
            <li key={label.id} className="mb-1">
              <button className="flex items-center w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                <span className={`w-3 h-3 rounded-full ${label.color} mr-3`}></span>
                <span>{label.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
