import React, { useState, useEffect, useRef } from 'react';
import { MonacoEditor, EditorUtils } from '../../components/Editor';
import FileExplorer from '../../components/Editor/FileExplorer';
import FileService from '../../components/Editor/FileService';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Play, Download, Settings, FolderUp, Folder, X, Plus, FileIcon, ChevronRight } from 'lucide-react';
import './EditorStyles.css';

const EditorPage = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([{ id: 'default', name: 'untitled.js', content: '// Start coding here...', language: 'javascript' }]);
  const [activeTabId, setActiveTabId] = useState('default');
  const [theme, setTheme] = useState('vs-dark');
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState('file'); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('');
  
  // Refs for file/folder upload
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // Create file service instance as a state variable
  const [fileService] = useState(() => new FileService());
  
  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  // Get user theme preference from localStorage
  useEffect(() => {
    const dashboardTheme = localStorage.getItem('dashboard_theme') || 'blue';
    // You could map dashboard themes to editor themes if needed
  }, []);
  
  // Function to refresh file list
  const refreshFileList = async () => {
    try {
      const fileList = await fileService.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.message?.includes('Invalid token')) {
        alert('Your session has expired. Please log in again.');
        // You could redirect to login here if needed
      }
    }
  };
  
  // Load files when component mounts
  useEffect(() => {
    refreshFileList();
  }, []);
  
  // Handle code changes
  const handleCodeChange = (value) => {
    // Update the content of the active tab
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId ? { ...tab, content: value } : tab
      )
    );
  };
  
  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    
    // Update file extension based on language
    const baseName = activeTab.name.split('.')[0] || 'untitled';
    // Map language to common file extensions
    const extensionMap = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      json: 'json',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp'
    };
    const extension = extensionMap[newLanguage] || 'txt';
    const newName = `${baseName}.${extension}`;
    
    // Update the language and name of the active tab
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId ? { ...tab, language: newLanguage, name: newName } : tab
      )
    );
  };
  
  // Handle theme change
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };
  
  // Handle file name change
  const handleFileNameChange = (e) => {
    const newName = e.target.value;
    
    // Update language based on file extension
    const extension = newName.split('.').pop();
    let newLanguage = activeTab.language;
    
    if (extension) {
      const detectedLanguage = EditorUtils.detectLanguage(newName);
      if (detectedLanguage) {
        newLanguage = detectedLanguage;
      }
    }
    
    // Update the name and language of the active tab
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId ? { ...tab, name: newName, language: newLanguage } : tab
      )
    );
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, this would save to a backend or localStorage
    localStorage.setItem(`editor_file_${activeTab.name}`, activeTab.content);
    alert(`File ${activeTab.name} saved successfully!`);
  };
  
  // Handle download
  const handleDownload = () => {
    const blob = new Blob([activeTab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle file selection from FileExplorer
  const handleFileSelect = async (file) => {
    try {
      setSelectedFile(file);
      const content = await fileService.getFileContent(file.path);
      
      // Check if this file is already open in a tab
      const existingTabIndex = tabs.findIndex(tab => tab.path === file.path);
      
      if (existingTabIndex >= 0) {
        // If the file is already open, just activate that tab
        setActiveTabId(tabs[existingTabIndex].id);
      } else {
        // Create a new tab for this file
        const detectedLanguage = EditorUtils.detectLanguage(file.name) || 'plaintext';
        const newTab = {
          id: `tab-${Date.now()}`,
          name: file.name,
          content: content,
          language: detectedLanguage,
          path: file.path
        };
        
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert(`Error loading file: ${error.message}`);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadStatus({ loading: true, error: null, success: false });
      await fileService.uploadFile(files[0], '');
      setUploadStatus({ loading: false, error: null, success: true });
      
      // Refresh file list after successful upload
      await refreshFileList();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({ loading: false, error: error.message, success: false });
    }
  };
  
  // Handle folder upload
  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadStatus({ loading: true, error: null, success: false });
      await fileService.uploadMultipleFiles(files, '');
      setUploadStatus({ loading: false, error: null, success: true });
      
      // Refresh file list after successful upload
      await refreshFileList();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
      // Reset file input
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading folder:', error);
      setUploadStatus({ loading: false, error: error.message, success: false });
    }
  };
  
  // Handle create file dialog
  const handleCreateFile = (directory = '') => {
    setCreateModalType('file');
    setCurrentDirectory(directory);
    setNewItemName('untitled.js');
    setIsCreateModalOpen(true);
  };
  
  // Handle create folder dialog
  const handleCreateFolder = (directory = '') => {
    setCreateModalType('folder');
    setCurrentDirectory(directory);
    setNewItemName('new-folder');
    setIsCreateModalOpen(true);
  };
  
  // Submit new file or folder creation
  const handleCreateSubmit = async () => {
    try {
      setUploadStatus({ loading: true, error: null, success: false });
      
      if (createModalType === 'file') {
        // Create file path
        const filePath = currentDirectory ? `${currentDirectory}/${newItemName}` : newItemName;
        
        // Save empty file
        await fileService.saveFile(filePath, '');
        
        // Open the new file
        const newFile = {
          name: newItemName,
          path: filePath,
          isDirectory: false
        };
        
        // Create a new tab for this file
        const detectedLanguage = EditorUtils.detectLanguage(newItemName) || 'plaintext';
        const newTab = {
          id: `tab-${Date.now()}`,
          name: newItemName,
          content: '',
          language: detectedLanguage,
          path: filePath
        };
        
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabId(newTab.id);
      } else {
        // Create folder path
        const folderPath = currentDirectory ? `${currentDirectory}/${newItemName}` : newItemName;
        
        // Create directory
        await fileService.createDirectory(folderPath);
      }
      
      // Success
      setUploadStatus({ loading: false, error: null, success: true });
      
      // Close modal
      setIsCreateModalOpen(false);
      
      // Refresh file list
      await refreshFileList();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error(`Error creating ${createModalType}:`, error);
      setUploadStatus({ loading: false, error: error.message, success: false });
    }
  };
  
  // Toggle file explorer visibility
  const toggleFileExplorer = () => {
    setShowFileExplorer(!showFileExplorer);
  };
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Code Editor</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={theme}
            onChange={handleThemeChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
            <option value="teamSyncDark">Team Sync Dark</option>
            <option value="teamSyncLight">Team Sync Light</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 hover:bg-blue-700"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          
          <button 
            onClick={handleDownload}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 hover:bg-gray-700"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </header>
      
      {/* Upload status messages */}
      {uploadStatus.loading && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 mb-2">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <p>Uploading...</p>
          </div>
        </div>
      )}
      
      {uploadStatus.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2">
          <p>Error: {uploadStatus.error}</p>
        </div>
      )}
      
      {uploadStatus.success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-2">
          <p>Upload successful!</p>
        </div>
      )}
      
      {/* Hidden file inputs for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFolderUpload} 
        style={{ display: 'none' }} 
        webkitdirectory="" 
        directory="" 
        multiple 
      />
      
      {/* Modal for creating new file/folder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {createModalType === 'file' ? 'Create New File' : 'Create New Folder'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name:
              </label>
              <input 
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              {currentDirectory && (
                <p className="mt-1 text-sm text-gray-500">
                  In directory: {currentDirectory}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={handleCreateSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs Bar */}
      <div className="tabs-container bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex overflow-x-auto">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab-item flex items-center px-3 py-2 border-r border-gray-300 dark:border-gray-700 cursor-pointer group ${activeTabId === tab.id ? 'active bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <FileIcon size={14} className="mr-2 text-gray-500" />
            <input
              type="text"
              value={tab.name}
              onChange={handleFileNameChange}
              className={`text-sm bg-transparent border-none focus:outline-none ${activeTabId === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={(e) => e.stopPropagation()}
            />
            {tabs.length > 1 && (
              <button 
                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none invisible group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  setTabs(tabs.filter(t => t.id !== tab.id));
                  if (activeTabId === tab.id) {
                    setActiveTabId(tabs[0].id === tab.id ? tabs[1].id : tabs[0].id);
                  }
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button 
          className="tab-item flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          onClick={() => {
            const newTab = {
              id: `tab-${Date.now()}`,
              name: 'untitled.js',
              content: '// Start coding here...',
              language: 'javascript'
            };
            setTabs([...tabs, newTab]);
            setActiveTabId(newTab.id);
          }}
        >
          <Plus size={16} className="text-gray-500" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar toggle */}
        {!showFileExplorer && (
          <button 
            className="sidebar-toggle p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleFileExplorer}
            title="Show Explorer"
          >
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        )}
        
        {/* File explorer */}
        {showFileExplorer && (
          <div className="relative w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* Close button */}
            <button 
              className="sidebar-close-btn absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
              onClick={toggleFileExplorer}
              title="Close Explorer"
            >
              <X size={14} className="text-gray-500 dark:text-gray-400" />
            </button>
            
            <FileExplorer 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onDeleteItem={() => {/* Implement later */}}
              onRefresh={refreshFileList}
              tabs={tabs}
              onCloseTab={(tabId) => {
                setTabs(tabs.filter(t => t.id !== tabId));
                if (activeTabId === tabId) {
                  setActiveTabId(tabs[0].id === tabId ? tabs[1].id : tabs[0].id);
                }
              }}
            />
          </div>
        )}
        
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <div className="language-selector px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <select 
              value={activeTab.language}
              onChange={handleLanguageChange}
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          
          <MonacoEditor
            language={activeTab.language}
            value={activeTab.content}
            onChange={handleCodeChange}
            theme={theme}
            height="calc(100% - 32px)"
            width="100%"
            options={{
              wordWrap: 'on',
              minimap: { enabled: true },
              showUnused: false,
              folding: true,
              lineNumbersMinChars: 3,
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
