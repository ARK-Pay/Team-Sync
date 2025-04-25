import React, { useState, useEffect, useRef } from 'react';
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, RotateCw, TrashIcon, FolderPlusIcon, FileTextIcon, Upload, X, Edit, Copy, FilePlus2 } from 'lucide-react';
import PropTypes from 'prop-types';
import FileService from './FileService';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveFile, closeFile, openFile } from '../../redux/editorSlice';

/**
 * File Explorer component for the Monaco Editor
 * Displays a tree view of files and folders for the current project
 */
const FileExplorer = ({ 
  onFileSelect, 
  selectedFile,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onRefresh,
  tabs = [],
  onCloseTab
}) => {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [explorerExpanded, setExplorerExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null
  });
  
  // File input refs for uploads
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // Create file service instance
  const [fileServiceInstance] = useState(() => new FileService());
  
  const { openFiles, activeFileId } = useSelector((state) => state.editor);
  const dispatch = useDispatch();
  
  // Debug log for redux state
  useEffect(() => {
    console.log("Redux openFiles:", openFiles);
    console.log("Redux activeFileId:", activeFileId);
  }, [openFiles, activeFileId]);
  
  // Fetch files from the backend
  const fetchFiles = async (path = '') => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Fetching files from path:', path);
      
      // Add a timeout to prevent hanging on the loading state
      const fetchPromise = fileServiceInstance.listFiles(path);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 8000);
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Files response:', response);
      
      if (response && response.files) {
        setFiles(response.files);
        setCurrentPath(response.currentDir || path);
        console.log('Files loaded successfully:', response.files.length, 'files');
      } else {
        setFiles([]);
        setError('No files found or invalid response format');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.message === 'Request timed out') {
        setError('Loading files is taking longer than expected. Please try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to load files: ' + error.message);
      }
      setLoading(false);
      // If we fail to load files, set an empty array to avoid undefined errors
      setFiles([]);
    }
  };
  
  // Initial file fetch
  useEffect(() => {
    fetchFiles();
  }, []);
  
  // Auto-expand root folders on initial load
  useEffect(() => {
    if (files.length > 0 && Object.keys(expandedFolders).length === 0) {
      const rootFolders = files.filter(file => file.isDirectory && (!file.path.includes('/') || file.path.split('/').length <= 2));
      const newExpandedFolders = {};
      rootFolders.forEach(folder => {
        newExpandedFolders[folder.path] = true;
      });
      setExpandedFolders(prev => ({ ...prev, ...newExpandedFolders }));
    }
  }, [files]);
  
  // Handle folder toggle
  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
    
    // If expanding and we haven't loaded this folder yet, fetch its contents
    if (!expandedFolders[folderPath]) {
      fetchFiles(folderPath);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Uploading file:', files[0].name, 'to path:', currentPath);
      await fileServiceInstance.uploadFile(files[0], currentPath);
      console.log('File uploaded successfully');
      fetchFiles(currentPath); // Refresh file list
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle folder upload
  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Uploading folder with', files.length, 'files to path:', currentPath);
      
      // Show progress message during upload
      setError(`Uploading ${files.length} files... Please wait.`);
      
      // Upload files in batches
      const result = await fileServiceInstance.uploadMultipleFiles(files, currentPath);
      console.log('Folder uploaded successfully:', result);
      
      // Clear error message and refresh file list
      setError(null);
      await fetchFiles(currentPath);
      
      // Auto-expand the uploaded folder if it's a root folder
      if (files[0]?.webkitRelativePath) {
        const folderName = files[0].webkitRelativePath.split('/')[0];
        const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setExpandedFolders(prev => ({
          ...prev,
          [folderPath]: true
        }));
      }
    } catch (error) {
      console.error('Error uploading folder:', error);
      setError('Failed to upload folder: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      // Reset file input
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };
  
  // Handle deleting a file or folder
  const handleDeleteItem = (item) => {
    if (onDeleteItem) {
      onDeleteItem(item);
    } else {
      // If no custom handler is provided, implement default behavior
      const confirmMessage = `Are you sure you want to delete this ${item.isDirectory ? 'folder' : 'file'}? ${
        item.isDirectory ? 'All contents will be deleted.' : ''
      }`;
      
      if (window.confirm(confirmMessage)) {
        setLoading(true);
        setError(null);
        
        const deletePromise = item.isDirectory
          ? fileServiceInstance.deleteFolder(item.path)
          : fileServiceInstance.deleteFile(item.path);
          
        deletePromise.then(() => {
          // If deleted file is open, close it
          if (!item.isDirectory) {
            const openTab = openFiles.find(tab => tab.path === item.path);
            if (openTab) {
              dispatch(closeFile(openTab.id));
            }
          } else {
            // If a folder is deleted, close any open files from that folder
            openFiles.forEach(file => {
              if (file.path.startsWith(item.path + '/')) {
                dispatch(closeFile(file.id));
              }
            });
            
            // Also remove the folder from expandedFolders
            const newExpandedFolders = { ...expandedFolders };
            delete newExpandedFolders[item.path];
            setExpandedFolders(newExpandedFolders);
          }
          
          // Refresh the file list
          fetchFiles(currentPath);
        }).catch(error => {
          console.error(`Error deleting ${item.isDirectory ? 'folder' : 'file'}:`, error);
          setError(`Failed to delete ${item.isDirectory ? 'folder' : 'file'}: ${error.message}`);
        }).finally(() => {
          setLoading(false);
        });
      }
    }
  };
  
  // Handle file click
  const handleFileClick = (file) => {
    if (file.isDirectory) return;
    
    // Create a unique ID for the file
    const fileId = `file-${Date.now()}`;
    
    dispatch(openFile({
      id: fileId,
      path: file.path,
      name: file.name || file.path.split('/').pop(),
      language: getLanguageFromFileName(file.name || file.path)
    }));
    
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  // Helper to determine language from filename
  const getLanguageFromFileName = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'php': 'php',
      'rb': 'ruby',
      'rs': 'rust',
      'swift': 'swift',
      'sql': 'sql'
    };
    
    return languageMap[ext] || 'plaintext';
  };
  
  // Create a new file
  const handleCreateFile = () => {
    if (onCreateFile) {
      onCreateFile(currentPath);
    }
  };
  
  // Create a new folder
  const handleCreateFolder = () => {
    if (onCreateFolder) {
      onCreateFolder(currentPath);
    }
  };
  
  // Refresh the current directory
  const handleRefresh = () => {
    fetchFiles(currentPath);
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Toggle explorer section
  const toggleExplorer = () => {
    setExplorerExpanded(!explorerExpanded);
  };
  
  // Collapse all folders
  const collapseAllFolders = () => {
    setExpandedFolders({});
  };
  
  const openFileHandler = (filePath) => {
    dispatch(openFile({
      path: filePath,
      name: filePath.split('/').pop()
    }));
  };

  const closeFileHandler = (e, filePath) => {
    e.stopPropagation();
    const fileToClose = openFiles.find(file => file.path === filePath);
    if (fileToClose) {
      console.log("Closing file with ID:", fileToClose.id);
      dispatch(closeFile(fileToClose.id));
    } else {
      console.log("File not found in open files:", filePath);
      console.log("Current open files:", openFiles);
    }
  };
  
  // Handle context menu opening
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };
  
  // Handle context menu item click
  const handleContextMenuAction = (action) => {
    const item = contextMenu.item;
    if (!item) return;
    
    switch (action) {
      case 'open':
        if (!item.isDirectory) {
          handleFileClick(item);
        }
        break;
      case 'close':
        if (!item.isDirectory) {
          const openTab = openFiles.find(tab => tab.path === item.path);
          if (openTab) {
            console.log("Context menu closing file with ID:", openTab.id);
            dispatch(closeFile(openTab.id));
          }
        }
        break;
      case 'delete':
        handleDeleteItem(item);
        break;
      case 'rename':
        // Implement rename functionality
        const newName = prompt(`Rename ${item.isDirectory ? 'folder' : 'file'}:`, item.name);
        if (newName && newName !== item.name) {
          // TODO: Implement rename API call
          alert(`Rename functionality to be implemented for: ${item.path} to ${newName}`);
        }
        break;
      case 'newFile':
        if (item.isDirectory) {
          onCreateFile && onCreateFile(item.path);
        }
        break;
      case 'newFolder':
        if (item.isDirectory) {
          onCreateFolder && onCreateFolder(item.path);
        }
        break;
      case 'collapse':
        if (item.isDirectory) {
          // Remove this folder from expanded folders
          const newExpandedFolders = { ...expandedFolders };
          delete newExpandedFolders[item.path];
          setExpandedFolders(newExpandedFolders);
        }
        break;
      case 'collapseAll':
        collapseAllFolders();
        break;
      default:
        break;
    }
    
    // Close the context menu
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };
  
  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);
  
  // Render file or folder item with children
  const renderTreeItem = (item, depth = 0) => {
    const isFolder = item.isDirectory;
    const isExpanded = expandedFolders[item.path];
    const isSelected = selectedFile && selectedFile.path === item.path;
    const isVirtual = item.virtual;
    
    // Check if this file is open in a tab
    const openTab = openFiles.find(tab => tab.path === item.path);
    const isOpen = Boolean(openTab);
    const isActive = openTab && openTab.id === activeFileId;
    
    return (
      <div key={item.path} className="file-tree-item">
        <div 
          className={`flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 group ${
            isSelected || isActive ? 'bg-blue-100 dark:bg-blue-900' : ''
          } ${isVirtual ? 'text-gray-400' : isOpen ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
          style={{ paddingLeft: `${(depth * 16) + 8}px` }}
          onClick={isFolder ? () => toggleFolder(item.path) : () => handleFileClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {isFolder ? (
            <span className="inline-flex items-center justify-between w-full">
              <span className="inline-flex items-center">
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-500" />
                )}
                <FolderIcon className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="truncate">{item.name}</span>
              </span>
              <div className="flex items-center">
                {!isVirtual && (
                  <button
                    className="p-1 rounded-sm invisible group-hover:visible hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item);
                    }}
                    title="Delete Folder"
                  >
                    <TrashIcon size={12} className="text-gray-500" />
                  </button>
                )}
              </div>
            </span>
          ) : (
            <div className="inline-flex items-center justify-between w-full">
              <span className={`inline-flex items-center ml-5 ${isOpen ? 'font-medium' : ''}`}>
                <FileIcon className={`w-4 h-4 mr-2 ${isOpen ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="truncate">{item.name}</span>
                {isOpen && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </span>
              <div className="flex items-center">
                {isOpen && (
                  <button
                    className="p-1 rounded-sm invisible group-hover:visible hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fileToClose = openFiles.find(file => file.path === item.path);
                      if (fileToClose) {
                        console.log("Closing file with ID:", fileToClose.id);
                        dispatch(closeFile(fileToClose.id));
                      }
                    }}
                    title="Close"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                )}
                {!isVirtual && (
                  <button
                    className="p-1 rounded-sm invisible group-hover:visible hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item);
                    }}
                    title="Delete File"
                  >
                    <TrashIcon size={12} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {isFolder && isExpanded && item.children && item.children.length > 0 && (
          <div className="folder-children">
            {item.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Organize files into a tree structure with improved hierarchy
  const buildFileTree = (files) => {
    // Sort files (folders first, then alphabetically)
    const sortedFiles = [...files].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    // Create a map of path to file/folder
    const fileMap = {};
    sortedFiles.forEach(file => {
      fileMap[file.path] = {
        ...file,
        children: [],
        level: file.path.split('/').filter(Boolean).length // Calculate nesting level
      };
    });
    
    // Build the tree structure
    const root = [];
    
    // First pass: identify all directories
    sortedFiles.forEach(file => {
      if (file.isDirectory) {
        // Ensure all parent directories exist
        const pathParts = file.path.split('/').filter(Boolean);
        let currentPath = '';
        
        for (let i = 0; i < pathParts.length; i++) {
          const segment = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          
          if (!fileMap[currentPath] && i < pathParts.length - 1) {
            // Create virtual parent folder
            const virtualFolder = {
              name: segment,
              path: currentPath,
              isDirectory: true,
              children: [],
              level: currentPath.split('/').filter(Boolean).length,
              virtual: true
            };
            fileMap[currentPath] = virtualFolder;
          }
        }
      }
    });
    
    // Second pass: build the tree
    sortedFiles.forEach(file => {
      const pathParts = file.path.split('/').filter(Boolean);
      
      // Root level items
      if (pathParts.length === 0 || pathParts.length === 1) {
        root.push(fileMap[file.path]);
        return;
      }
      
      // Find parent folder
      const parentPath = pathParts.slice(0, -1).join('/');
      if (fileMap[parentPath]) {
        fileMap[parentPath].children.push(fileMap[file.path]);
      } else {
        // If parent folder is not found, create virtual parent folders
        let currentPath = '';
        const pathSegments = parentPath.split('/').filter(Boolean);
        
        for (let i = 0; i < pathSegments.length; i++) {
          const segment = pathSegments[i];
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          
          if (!fileMap[currentPath]) {
            // Create virtual folder
            const virtualFolder = {
              name: segment,
              path: currentPath,
              isDirectory: true,
              children: [],
              level: currentPath.split('/').filter(Boolean).length,
              virtual: true
            };
            
            fileMap[currentPath] = virtualFolder;
            
            // Add to parent or root
            if (i === 0) {
              root.push(virtualFolder);
            } else {
              const virtualParentPath = pathSegments.slice(0, i).join('/');
              if (fileMap[virtualParentPath]) {
                fileMap[virtualParentPath].children.push(virtualFolder);
              }
            }
          }
        }
        
        // Now add the file to its parent
        if (fileMap[parentPath]) {
          fileMap[parentPath].children.push(fileMap[file.path]);
        } else {
          // If we still can't find a parent, add to root
          root.push(fileMap[file.path]);
        }
      }
    });
    
    // Sort children recursively
    const sortChildren = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        
        node.children.forEach(sortChildren);
      }
    };
    
    // Sort root items and their children
    root.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    root.forEach(sortChildren);
    
    return root;
  };
  
  // Build the file tree
  const fileTree = buildFileTree(files);
  
  return (
    <div className="file-explorer h-full flex flex-col border-r dark:border-gray-700">
      <div className="file-explorer-header p-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-sm font-medium">Explorer</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleCreateFile}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="New File"
          >
            <FileTextIcon size={16} />
          </button>
          <button 
            onClick={handleCreateFolder}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="New Folder"
          >
            <FolderPlusIcon size={16} />
          </button>
          <button 
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Upload File"
          >
            <PlusIcon size={16} />
          </button>
          <button 
            onClick={() => folderInputRef.current && folderInputRef.current.click()}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Upload Folder"
          >
            <Upload size={16} />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RotateCw size={16} />
          </button>
          <button 
            onClick={collapseAllFolders}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Collapse All Folders"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
      
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
        webkitdirectory="true" 
        directory="true" 
        multiple 
      />
      
      <div className="file-explorer-content flex-1 overflow-y-auto">
        {/* Explorer Section */}
        <div className="explorer-section">
          <div
            className="flex items-center justify-between py-2 px-3 text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleExplorer}
          >
            {explorerExpanded ? (
              <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-500" />
            )}
            <span className="uppercase text-xs tracking-wider">Explorer</span>
          </div>
          
          {explorerExpanded && (
            <>
        {loading ? (
                <div className="flex flex-col justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <span className="text-sm">Loading files...</span>
            <button 
              onClick={() => fetchFiles(currentPath)}
              className="mt-4 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : error ? (
                <div className="flex flex-col justify-center items-center p-4">
            <span className="text-sm text-red-500 mb-2">{error}</span>
            <button 
              onClick={() => fetchFiles(currentPath)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : fileTree.length === 0 ? (
                <div className="flex flex-col justify-center items-center p-4">
            <span className="text-sm text-gray-500 mb-2">No files found</span>
            <button 
              onClick={handleCreateFile}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center"
            >
              <PlusIcon size={12} className="mr-1" />
              Create File
            </button>
          </div>
        ) : (
                <div className="file-tree p-1">
            {fileTree.map(item => renderTreeItem(item))}
          </div>
        )}
            </>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 min-w-40 border border-gray-200 dark:border-gray-700"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          {contextMenu.item && !contextMenu.item.isDirectory && (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleContextMenuAction('open')}
              >
                <FileIcon className="w-4 h-4 mr-2" /> Open
              </button>
              {openFiles.some(file => file.path === contextMenu.item.path) && (
                <button 
                  className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => handleContextMenuAction('close')}
                >
                  <X className="w-4 h-4 mr-2" /> Close
                </button>
              )}
              <div className="border-t my-1 border-gray-200 dark:border-gray-700"></div>
            </>
          )}
          
          {contextMenu.item && contextMenu.item.isDirectory && (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleContextMenuAction('newFile')}
              >
                <FilePlus2 className="w-4 h-4 mr-2" /> New File
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleContextMenuAction('newFolder')}
              >
                <FolderPlusIcon className="w-4 h-4 mr-2" /> New Folder
              </button>
              {expandedFolders[contextMenu.item.path] && (
                <button 
                  className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => handleContextMenuAction('collapse')}
                >
                  <ChevronRightIcon className="w-4 h-4 mr-2" /> Collapse
                </button>
              )}
              <div className="border-t my-1 border-gray-200 dark:border-gray-700"></div>
            </>
          )}
          
          {!contextMenu.item?.virtual && (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleContextMenuAction('rename')}
              >
                <Edit className="w-4 h-4 mr-2" /> Rename
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-500"
                onClick={() => handleContextMenuAction('delete')}
              >
                <TrashIcon className="w-4 h-4 mr-2" /> Delete
              </button>
            </>
          )}
          
          <div className="border-t my-1 border-gray-200 dark:border-gray-700"></div>
          <button 
            className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleContextMenuAction('collapseAll')}
          >
            <ChevronRightIcon className="w-4 h-4 mr-2" /> Collapse All Folders
          </button>
        </div>
      )}
    </div>
  );
};

FileExplorer.propTypes = {
  onFileSelect: PropTypes.func,
  selectedFile: PropTypes.object,
  onCreateFile: PropTypes.func,
  onCreateFolder: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onRefresh: PropTypes.func,
  tabs: PropTypes.array,
  onCloseTab: PropTypes.func
};

export default FileExplorer;
