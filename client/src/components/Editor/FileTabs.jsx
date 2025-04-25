import React from 'react';
import { X, FileText, FileCode, FileJson, File } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { closeFile, setActiveFile } from '../../redux/editorSlice';

/**
 * FileTabs component for the editor
 * Displays tabs for open files and allows switching between them
 */
const FileTabs = () => {
  const dispatch = useDispatch();
  const { openFiles, activeFileId } = useSelector((state) => state.editor);
  
  // If no files are open, return empty div
  if (!openFiles || openFiles.length === 0) {
    return <div className="tabs-container bg-gray-700 dark:bg-gray-900"></div>;
  }
  
  // Handle closing a tab
  const handleClose = (e, fileId) => {
    e.stopPropagation();
    dispatch(closeFile(fileId));
  };
  
  // Handle selecting a tab
  const handleSelect = (fileId) => {
    dispatch(setActiveFile(fileId));
  };
  
  // Get appropriate icon for file based on language/extension
  const getFileIcon = (file) => {
    const language = file.language?.toLowerCase() || '';
    const extension = file.name?.split('.').pop().toLowerCase() || '';
    
    if (['javascript', 'typescript', 'jsx', 'tsx'].includes(language) || 
        ['js', 'ts', 'jsx', 'tsx'].includes(extension)) {
      return <FileCode className="tab-icon" size={16} />;
    }
    
    if (['html', 'css', 'markdown', 'md'].includes(language) || 
        ['html', 'css', 'md', 'markdown'].includes(extension)) {
      return <FileText className="tab-icon" size={16} />;
    }
    
    if (['json'].includes(language) || ['json'].includes(extension)) {
      return <FileJson className="tab-icon" size={16} />;
    }
    
    return <File className="tab-icon" size={16} />;
  };
  
  return (
    <div className="tabs-container">
      {openFiles.map((file) => (
        <div 
          key={file.id}
          className={`tab-item ${file.id === activeFileId ? 'active' : ''}`}
          onClick={() => handleSelect(file.id)}
        >
          {getFileIcon(file)}
          <span className="truncate">{file.name}</span>
          <button 
            className="close-button"
            onClick={(e) => handleClose(e, file.id)}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileTabs; 