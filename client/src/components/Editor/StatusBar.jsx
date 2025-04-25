import React from 'react';
import { GitBranch, Code, Cpu, Globe, Clock } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

/**
 * StatusBar component for the editor
 * Displays information about the current file and editor state
 */
const StatusBar = ({ 
  currentLanguage = 'plaintext', 
  currentFile = null,
  lineCount = 0
}) => {
  // Get current time formatted
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const [time, setTime] = React.useState(getFormattedTime());
  
  // Update time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(getFormattedTime());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format language name for display
  const formatLanguage = (lang) => {
    if (!lang) return 'Plain Text';
    
    const langMap = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'markdown': 'Markdown',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'csharp': 'C#',
      'go': 'Go',
      'php': 'PHP',
      'ruby': 'Ruby',
      'rust': 'Rust',
      'swift': 'Swift',
      'sql': 'SQL',
      'plaintext': 'Plain Text'
    };
    
    return langMap[lang.toLowerCase()] || lang;
  };
  
  return (
    <div className="status-bar text-sm">
      <div className="status-bar-left">
        <div className="status-bar-item">
          <GitBranch size={14} />
          <span>main</span>
        </div>
        
        <div className="status-bar-item">
          <Code size={14} />
          <span>{formatLanguage(currentLanguage)}</span>
        </div>
        
        <div className="status-bar-item">
          <Cpu size={14} />
          <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
        </div>
      </div>
      
      <div className="status-bar-right">
        <div className="status-bar-item">
          <Globe size={14} />
          <span>UTF-8</span>
        </div>
        
        <div className="status-bar-item">
          <Clock size={14} />
          <span>{time}</span>
        </div>
        
        <ThemeSelector />
      </div>
    </div>
  );
};

export default StatusBar; 