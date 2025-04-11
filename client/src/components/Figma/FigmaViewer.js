import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ViewerContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
`;

const ViewerHeader = styled.header`
  height: 56px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#0d99ff' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: 1px solid ${props => props.primary ? 'transparent' : '#d1d5db'};
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#2b6cb0' : '#f3f4f6'};
  }
`;

const ViewerContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const Canvas = styled.div`
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: ${props => props.width || '1440px'};
  height: ${props => props.height || '900px'};
  position: relative;
  overflow: hidden;
`;

const FigmaViewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('Shared Design');
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Load the project data from localStorage
    const savedProjects = localStorage.getItem('figma_projects');
    if (!savedProjects) {
      setError('Project not found');
      setLoading(false);
      return;
    }
    
    const projects = JSON.parse(savedProjects);
    const project = projects.find(p => p.id.toString() === projectId.toString());
    
    if (!project) {
      setError('Project not found');
      setLoading(false);
      return;
    }
    
    setProjectTitle(project.title);
    
    // Load elements
    const savedElements = localStorage.getItem(`figma_elements_${projectId}`);
    if (savedElements) {
      setElements(JSON.parse(savedElements));
    }
    
    setLoading(false);
  }, [projectId]);
  
  if (loading) {
    return (
      <ViewerContainer>
        <ViewerHeader>
          <HeaderTitle>Loading shared design...</HeaderTitle>
        </ViewerHeader>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ViewerContainer>
    );
  }
  
  if (error) {
    return (
      <ViewerContainer>
        <ViewerHeader>
          <HeaderTitle>Error</HeaderTitle>
          <Button onClick={() => navigate('/figma')}>Go to Dashboard</Button>
        </ViewerHeader>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
            <p className="text-gray-600 mb-4">The design you're looking for might have been deleted or doesn't exist.</p>
            <Button primary onClick={() => navigate('/figma')}>Go to Dashboard</Button>
          </div>
        </div>
      </ViewerContainer>
    );
  }
  
  return (
    <ViewerContainer>
      <ViewerHeader>
        <HeaderTitle>
          <svg 
            viewBox="0 0 24 24" 
            width="20"
            height="20"
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
          {projectTitle}
        </HeaderTitle>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
          <Button primary onClick={() => navigate('/figma')}>
            Open Figma
          </Button>
        </div>
      </ViewerHeader>
      
      <ViewerContent>
        <Canvas>
          {elements.map(element => {
            if (element.type === 'rectangle') {
              return (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    backgroundColor: element.color,
                    border: '1px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}
                >
                  {element.label}
                </div>
              );
            } else if (element.type === 'circle') {
              return (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: `${element.x - element.radius}px`,
                    top: `${element.y - element.radius}px`,
                    width: `${element.radius * 2}px`,
                    height: `${element.radius * 2}px`,
                    backgroundColor: element.color,
                    borderRadius: '50%',
                    border: '1px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}
                >
                  {element.label}
                </div>
              );
            } else if (element.type === 'text') {
              return (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    minHeight: `${element.height}px`,
                    padding: '8px',
                    fontSize: `${element.fontSize}px`,
                    color: element.color,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  {element.text}
                </div>
              );
            }
            return null;
          })}
        </Canvas>
      </ViewerContent>
    </ViewerContainer>
  );
};

export default FigmaViewer; 