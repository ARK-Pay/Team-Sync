import React, { useState, useEffect, useRef } from 'react';
import { MonacoEditor, EditorUtils } from '../../components/Editor';
import FileExplorer from '../../components/Editor/FileExplorer';
import FileService from '../../components/Editor/FileService';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Play, Download, Upload, Settings, FolderUp, Folder } from 'lucide-react';
import './EditorStyles.css';

const EditorPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fileName, setFileName] = useState('untitled.js');
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: false });
  
  // Refs for file/folder upload
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // Get user theme preference from localStorage
  useEffect(() => {
    const dashboardTheme = localStorage.getItem('dashboard_theme') || 'blue';
    // You could map dashboard themes to editor themes if needed
  }, []);
  
  // Handle code changes
  const handleCodeChange = (value) => {
    setCode(value);
  };
  
  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Update file extension based on language
    const baseName = fileName.split('.')[0] || 'untitled';
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
    setFileName(`${baseName}.${extension}`);
  };
  
  // Handle theme change
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };
  
  // Handle file name change
  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    
    // Update language based on file extension
    const extension = e.target.value.split('.').pop();
    if (extension) {
      const detectedLanguage = EditorUtils.detectLanguage(e.target.value);
      if (detectedLanguage) {
        setLanguage(detectedLanguage);
      }
    }
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, this would save to a backend or localStorage
    localStorage.setItem(`editor_file_${fileName}`, code);
    alert(`File ${fileName} saved successfully!`);
  };
  
  // Handle download
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle file selection from FileExplorer
  const handleFileSelect = async (file) => {
    try {
      setSelectedFile(file);
      const content = await FileService.getFileContent(file.path);
      setCode(content);
      setFileName(file.name);
      
      // Update language based on file extension
      const detectedLanguage = EditorUtils.detectLanguage(file.name);
      if (detectedLanguage) {
        setLanguage(detectedLanguage);
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
      await FileService.uploadFile(files[0], '');
      setUploadStatus({ loading: false, error: null, success: true });
      
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
      await FileService.uploadMultipleFiles(files, '');
      setUploadStatus({ loading: false, error: null, success: true });
      
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
  
  // Toggle file explorer visibility
  const toggleFileExplorer = () => {
    setShowFileExplorer(prev => !prev);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Code Editor</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          
          <select 
            value={language}
            onChange={handleLanguageChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
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
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 hover:bg-green-700"
            title="Upload File"
          >
            <Upload size={16} />
            <span>Upload File</span>
          </button>
          
          <button 
            onClick={() => folderInputRef.current && folderInputRef.current.click()}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 hover:bg-purple-700"
            title="Upload Folder"
          >
            <Folder size={16} />
            <span>Upload Folder</span>
          </button>
          
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
          
          <button
            onClick={toggleFileExplorer}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 hover:bg-gray-600"
            title={showFileExplorer ? "Hide File Explorer" : "Show File Explorer"}
          >
            <FolderUp size={16} />
            <span>{showFileExplorer ? "Hide Files" : "Show Files"}</span>
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
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File explorer */}
        {showFileExplorer && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <FileExplorer 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onCreateFile={() => {/* Implement later */}}
              onCreateFolder={() => {/* Implement later */}}
              onDeleteItem={() => {/* Implement later */}}
              onRefresh={() => {/* Implement later */}}
            />
          </div>
        )}
        
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme={theme}
            height="100%"
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
