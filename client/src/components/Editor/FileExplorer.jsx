import React, { useState, useEffect, useRef } from 'react';
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, RotateCw, TrashIcon, FolderPlusIcon, FileTextIcon, Upload } from 'lucide-react';
import PropTypes from 'prop-types';
import FileService from './FileService';

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
  onRefresh
}) => {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // File input refs for uploads
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // Create file service instance
  const [fileServiceInstance] = useState(() => new FileService());
  
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
  
  // Handle file click
  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
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
  
  // Render file or folder item with children
  const renderTreeItem = (item, depth = 0) => {
    const isFolder = item.isDirectory;
    const isExpanded = expandedFolders[item.path];
    const isSelected = selectedFile && selectedFile.path === item.path;
    const isVirtual = item.virtual;
    
    return (
      <div key={item.path} className="file-explorer-item">
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''} ${isVirtual ? 'opacity-80' : ''}`}
          style={{ paddingLeft: `${(depth * 16) + 8}px` }}
          onClick={() => isFolder ? toggleFolder(item.path) : handleFileClick(item)}
          title={item.path}
        >
          {isFolder ? (
            <>
              <span className="mr-1">
                {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              </span>
              <FolderIcon size={16} className="mr-2 text-yellow-500" />
            </>
          ) : (
            <>
              <span className="mr-1 w-4"></span>
              <FileIcon size={16} className="mr-2 text-blue-500" />
            </>
          )}
          <span className="truncate font-mono text-sm">{item.name}</span>
        </div>
        
        {isFolder && isExpanded && item.children && item.children.length > 0 && (
          <div className="folder-contents ml-2 border-l border-gray-200 dark:border-gray-700">
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
        <h3 className="text-sm font-medium">Files</h3>
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
      
      <div className="file-explorer-content flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
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
          <div className="flex flex-col justify-center items-center h-full">
            <span className="text-sm text-red-500 mb-2">{error}</span>
            <button 
              onClick={() => fetchFiles(currentPath)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : fileTree.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
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
          <div className="file-tree space-y-1">
            {fileTree.map(item => renderTreeItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};

FileExplorer.propTypes = {
  onFileSelect: PropTypes.func,
  selectedFile: PropTypes.object,
  onCreateFile: PropTypes.func,
  onCreateFolder: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onRefresh: PropTypes.func
};

export default FileExplorer;
