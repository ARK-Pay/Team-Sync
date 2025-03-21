import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageIcon from '@mui/icons-material/Image';
import './CodeEditor.css';

const CodeEditor = ({ initialValue = '', language = 'javascript', onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // File type configurations
  const fileTypeConfig = {
    js: {
      language: 'javascript',
      icon: '📜',
      runnable: true
    },
    jsx: {
      language: 'javascript',
      icon: '⚛️',
      runnable: true
    },
    ts: {
      language: 'typescript',
      icon: '📘',
      runnable: true
    },
    tsx: {
      language: 'typescript',
      icon: '⚛️',
      runnable: true
    },
    py: {
      language: 'python',
      icon: '🐍',
      runnable: true
    },
    html: {
      language: 'html',
      icon: '🌐',
      runnable: true
    },
    css: {
      language: 'css',
      icon: '🎨',
      runnable: false
    },
    json: {
      language: 'json',
      icon: '📋',
      runnable: false
    },
    md: {
      language: 'markdown',
      icon: '📝',
      runnable: false
    },
    sql: {
      language: 'sql',
      icon: '💾',
      runnable: true
    },
    xml: {
      language: 'xml',
      icon: '📰',
      runnable: false
    },
    yaml: {
      language: 'yaml',
      icon: '⚙️',
      runnable: false
    },
    // Image formats
    png: { type: 'image', icon: '🖼️' },
    jpg: { type: 'image', icon: '🖼️' },
    jpeg: { type: 'image', icon: '🖼️' },
    gif: { type: 'image', icon: '🖼️' },
    svg: { type: 'image', icon: '🖼️' },
    webp: { type: 'image', icon: '🖼️' },
    // Binary files
    pdf: { type: 'binary', icon: '📄' },
    zip: { type: 'binary', icon: '📦' },
    exe: { type: 'binary', icon: '⚡' }
  };

  const isImageFile = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
  };

  const isBinaryFile = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'zip', 'exe'].includes(ext);
  };

  const getFileConfig = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return fileTypeConfig[ext] || { language: 'plaintext', icon: '📄', runnable: false };
  };

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (onChange) {
      onChange({ language: newLanguage });
    }
  };

  const handleFolderUpload = async (event) => {
    try {
      setIsUploading(true);
      setError(null);
      const items = event.target.files;
      
      const processFile = async (file) => {
        try {
          const content = await readFileContent(file);
          return {
            name: file.name,
            content: content,
            type: file.name.split('.').pop().toLowerCase(),
            path: file.webkitRelativePath || file.name
          };
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err);
          throw new Error(`Failed to read file: ${file.name}`);
        }
      };

      const newFiles = await Promise.all(
        Array.from(items).map(processFile)
      );

      // Clear previous folder content
      setFiles(newFiles);
      setTabs([]);
      setCurrentFile(null);
      setValue('');
      setActiveTab(null);
      setExpandedFolders(new Set());
      setOutput('');
      
      // Select the first file from the new folder
      if (newFiles.length > 0) {
        const firstFile = newFiles[0];
        setCurrentFile(firstFile);
        setValue(firstFile.content);
        setTabs([firstFile]);
        setActiveTab(firstFile);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error uploading folder:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    const config = getFileConfig(file.name);
    
    // Add file to tabs if not already present
    if (!tabs.some(tab => tab.path === file.path)) {
      setTabs(prevTabs => [...prevTabs, file]);
    }
    setActiveTab(file);
    
    if (config.type === 'image') {
      // For image files, display the image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (config.type === 'binary') {
      // For binary files, show a message
      setValue('Binary file - preview not available');
    } else {
      // For text files, show the content
      setValue(file.content);
      setCurrentLanguage(config.language);
    }
  };

  const handleFileDelete = (fileToDelete) => {
    setFiles(files.filter(file => file.name !== fileToDelete.name));
    setTabs(tabs.filter(tab => tab.name !== fileToDelete.name));
    if (currentFile?.name === fileToDelete.name) {
      setCurrentFile(null);
      setValue('');
      setActiveTab(null);
    }
  };

  const closeTab = (tabToClose) => {
    setTabs(tabs.filter(tab => tab.name !== tabToClose.name));
    if (activeTab?.name === tabToClose.name) {
      const remainingTabs = tabs.filter(tab => tab.name !== tabToClose.name);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0]);
        setCurrentFile(remainingTabs[0]);
        setValue(remainingTabs[0].content);
      } else {
        setActiveTab(null);
        setCurrentFile(null);
        setValue('');
      }
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
        return '📜';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'cpp':
        return '⚙️';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      default:
        return '📄';
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderFileTree = (files) => {
    const fileTree = {};
    
    // Build file tree structure
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let current = fileTree;
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (index === pathParts.length - 1) {
          current[part] = { ...file, fullPath: currentPath };
        } else {
          current[part] = current[part] || { fullPath: currentPath };
          current = current[part];
        }
      });
    });

    const renderTree = (tree, level = 0, parentPath = '') => {
      return Object.entries(tree).map(([name, content]) => {
        const isFile = content.content !== undefined;
        const padding = level * 20;
        const currentPath = parentPath ? `${parentPath}/${name}` : name;
        
        if (isFile) {
          return (
            <div key={name} style={{ paddingLeft: `${padding}px` }}>
              <div className={`file-item ${currentFile?.path === content.path ? 'active' : ''}`}>
                <div className="file-item-content" onClick={() => handleFileSelect(content)}>
                  <span className="file-icon">{getFileIcon(name)}</span>
                  <span className="file-name">{name}</span>
                </div>
                <DeleteIcon
                  className="delete-icon"
                  onClick={() => handleFileDelete(content)}
                />
              </div>
            </div>
          );
        } else {
          const isExpanded = expandedFolders.has(currentPath);
          return (
            <div key={name} style={{ paddingLeft: `${padding}px` }}>
              <div 
                className={`folder-item ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(currentPath);
                }}
              >
                <div className="folder-content">
                  {isExpanded ? <ExpandMoreIcon className="folder-expand-icon" /> : <ExpandLessIcon className="folder-expand-icon" />}
                  <FolderIcon className="folder-icon" />
                  <span className="folder-name">{name}</span>
                </div>
              </div>
              <div className={`folder-children ${isExpanded ? 'show' : ''}`}>
                {isExpanded && renderTree(content, level + 1, currentPath)}
              </div>
            </div>
          );
        }
      });
    };

    return renderTree(fileTree);
  };

  const handleSave = async () => {
    try {
      const zip = new JSZip();
      
      // Function to recursively add files to zip while maintaining folder structure
      const addFilesToZip = (fileTree, currentPath = '') => {
        Object.entries(fileTree).forEach(([name, content]) => {
          const filePath = currentPath ? `${currentPath}/${name}` : name;
          
          if (content.content !== undefined) {
            // It's a file
            zip.file(filePath, content.content);
          } else {
            // It's a folder - recursively process its contents
            const folderContents = {};
            files.forEach(file => {
              if (file.path.startsWith(filePath + '/')) {
                folderContents[file.path.slice(filePath.length + 1)] = file;
              }
            });
            if (Object.keys(folderContents).length > 0) {
              addFilesToZip(folderContents, filePath);
            }
          }
        });
      };

      // Build file tree structure
      const fileTree = {};
      files.forEach(file => {
        const pathParts = file.path.split('/');
        let current = fileTree;
        
        pathParts.forEach((part, index) => {
          if (index === pathParts.length - 1) {
            current[part] = file;
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        });
      });

      // Add all files to zip
      addFilesToZip(fileTree);

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Save the zip file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveAs(zipBlob, `code-editor-files-${timestamp}.zip`);
    } catch (error) {
      console.error('Error saving files:', error);
      setError('Failed to save files: ' + error.message);
    }
  };

  const handleRun = async () => {
    if (!currentFile) {
      setError('Please select a file to run');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError(null);

    try {
      const fileType = currentFile.name.split('.').pop().toLowerCase();

      switch (fileType) {
        case 'js':
          try {
            // Create a safe context for evaluation
            const context = {
              console: {
                log: (...args) => setOutput(prev => prev + args.join(' ') + '\n'),
                error: (...args) => setOutput(prev => prev + 'Error: ' + args.join(' ') + '\n'),
                warn: (...args) => setOutput(prev => prev + 'Warning: ' + args.join(' ') + '\n')
              },
              setTimeout,
              clearTimeout,
              setInterval,
              clearInterval
            };

            // Create a function from the code with the safe context
            const code = `with (context) { 
              try {
                ${value}
              } catch (error) {
                console.error(error.message);
              }
            }`;

            // Execute the code
            new Function('context', code)(context);
          } catch (error) {
            setOutput('Error: ' + error.message);
          }
          break;

        case 'html':
          // Create a new window to display HTML
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(value);
            newWindow.document.close();
          } else {
            setError('Pop-up blocked. Please allow pop-ups to run HTML files.');
          }
          break;

        default:
          setOutput(`Running ${fileType} files requires a backend server.\nPlease set up a server to run this type of file.`);
      }
    } catch (error) {
      setError('Error running code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const renderEditor = () => {
    if (!currentFile) {
      return (
        <div className="welcome-screen">
          <h2>Welcome to Code Editor</h2>
          <p>Select a file to start editing</p>
        </div>
      );
    }

    const config = getFileConfig(currentFile.name);

    if (config.type === 'image') {
      return (
        <div className="image-preview">
          <img src={value} alt={currentFile.name} />
        </div>
      );
    }

    if (config.type === 'binary') {
      return (
        <div className="binary-file-message">
          <h3>Binary File</h3>
          <p>This file type cannot be previewed in the editor.</p>
          <p>File: {currentFile.name}</p>
        </div>
      );
    }

    return (
      <Editor
        height="calc(100vh - 200px)"
        defaultLanguage={config.language}
        language={config.language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyond: false,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorStyle: 'line',
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            arrowSize: 30,
          }
        }}
      />
    );
  };

  return (
    <div className="code-editor-wrapper">
      {/* File Explorer Panel */}
      <div className="file-explorer">
        <div className="file-explorer-header">
          <h3>Files</h3>
          <label className="upload-button">
            <input
              type="file"
              webkitdirectory=""
              directory=""
              onChange={handleFolderUpload}
              style={{ display: 'none' }}
              accept="*/*"
            />
            <UploadFileIcon className={`upload-icon ${isUploading ? 'uploading' : ''}`} />
          </label>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="file-list">
          {renderFileTree(files)}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="editor-panel">
        <div className="editor-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className={`editor-tab ${activeTab?.name === tab.name ? 'active' : ''}`}
            >
              <span className="tab-icon">{getFileConfig(tab.name).icon}</span>
              <span className="tab-name">{tab.name}</span>
              <CloseIcon
                className="tab-close"
                onClick={() => closeTab(tab)}
              />
            </div>
          ))}
        </div>

        <div className="code-editor-header">
          <div className="editor-actions">
            <button className="action-button" onClick={handleSave}>
              <SaveIcon /> Save as ZIP
            </button>
            {currentFile && getFileConfig(currentFile.name).runnable && (
              <button 
                className={`action-button ${isRunning ? 'running' : ''}`} 
                onClick={handleRun}
                disabled={isRunning}
              >
                <PlayArrowIcon /> Run
              </button>
            )}
          </div>
        </div>

        <div className="editor-container">
          <div className="code-editor-main">
            {renderEditor()}
          </div>
          
          {/* Output Console */}
          {currentFile && getFileConfig(currentFile.name).runnable && (
            <div className="output-console">
              <div className="output-header">
                <span>Output</span>
                {output && (
                  <button 
                    className="clear-button"
                    onClick={() => setOutput('')}
                  >
                    Clear
                  </button>
                )}
              </div>
              <pre className="output-content">
                {output || 'Run your code to see output here...'}
              </pre>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-item">{isRunning ? 'Running...' : 'Ready'}</div>
          <div className="status-item">
            {currentFile ? getFileConfig(currentFile.name).language || 'binary' : ''}
          </div>
          <div className="status-item">UTF-8</div>
          <div className="status-item">LF</div>
          <div className="status-item">Spaces: 2</div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 