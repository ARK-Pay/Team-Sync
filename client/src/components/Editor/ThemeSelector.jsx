import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, ChevronDown, CheckSquare, Square } from 'lucide-react';

/**
 * ThemeSelector component for the editor
 * Allows users to choose between different editor themes
 */
const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const menuRef = useRef(null);

  const themes = [
    { id: 'light', name: 'Light Theme', icon: <Sun size={14} /> },
    { id: 'dark', name: 'Dark Theme (VS Code)', icon: <Moon size={14} /> },
    { id: 'night-owl', name: 'Night Owl', icon: <Moon size={14} /> },
    { id: 'dracula', name: 'Dracula', icon: <Moon size={14} /> }
  ];

  // Set the theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('editor-theme') || 'dark';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply theme to body and save to localStorage
  const applyTheme = (themeId) => {
    // Remove all theme classes
    document.body.classList.remove('light', 'dark', 'night-owl', 'dracula');
    // Add the selected theme class
    document.body.classList.add(themeId);
    // Save to localStorage
    localStorage.setItem('editor-theme', themeId);
  };

  // Handle theme selection
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  // Get current theme object
  const theme = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="theme-selector relative" ref={menuRef}>
      <button
        className="theme-selector-btn flex items-center text-sm py-1 px-2 rounded hover:bg-opacity-20 hover:bg-white"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        <span className="mr-1">{theme.icon}</span>
        <span className="hidden md:inline mr-1">{theme.name}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="theme-menu absolute bottom-full right-0 mb-1 w-48 bg-gray-800 dark:bg-gray-900 rounded shadow-lg py-1 z-10">
          <div className="theme-menu-header px-3 py-2 text-xs uppercase text-gray-500 border-b border-gray-700">
            Select Theme
          </div>
          <div className="theme-menu-items py-1">
            {themes.map((item) => (
              <button
                key={item.id}
                className="theme-menu-item flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-700"
                onClick={() => handleThemeChange(item.id)}
              >
                <span className="mr-2 opacity-60">
                  {item.id === currentTheme ? <CheckSquare size={14} /> : <Square size={14} />}
                </span>
                <span className="mr-2">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="theme-menu-footer px-3 py-2 text-xs text-gray-500 border-t border-gray-700">
            Themes affect the editor and UI colors
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 