import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Template definitions - these correspond to the templates in FigmaDashboard
const TEMPLATES = {
  // Wireframe Kit
  101: {
    elements: [
      { id: 'header', type: 'rectangle', x: 0, y: 0, width: 1440, height: 80, color: '#f3f4f6', label: 'Header' },
      { id: 'sidebar', type: 'rectangle', x: 0, y: 80, width: 240, height: 820, color: '#f8fafc', label: 'Sidebar' },
      { id: 'content', type: 'rectangle', x: 240, y: 80, width: 1200, height: 820, color: '#ffffff', label: 'Content Area' },
      { id: 'logo', type: 'circle', x: 40, y: 30, radius: 20, color: '#d1d5db', label: 'Logo' },
    ]
  },
  // Web Dashboard
  102: {
    elements: [
      { id: 'header', type: 'rectangle', x: 0, y: 0, width: 1440, height: 64, color: '#0891b2', label: 'Header' },
      { id: 'sidebar', type: 'rectangle', x: 0, y: 64, width: 250, height: 836, color: '#0e7490', label: 'Sidebar' },
      { id: 'stats1', type: 'rectangle', x: 280, y: 94, width: 250, height: 120, color: '#ffffff', label: 'Stats Card 1' },
      { id: 'stats2', type: 'rectangle', x: 550, y: 94, width: 250, height: 120, color: '#ffffff', label: 'Stats Card 2' },
      { id: 'stats3', type: 'rectangle', x: 820, y: 94, width: 250, height: 120, color: '#ffffff', label: 'Stats Card 3' },
      { id: 'stats4', type: 'rectangle', x: 1090, y: 94, width: 250, height: 120, color: '#ffffff', label: 'Stats Card 4' },
      { id: 'chart', type: 'rectangle', x: 280, y: 244, width: 700, height: 350, color: '#ffffff', label: 'Chart' },
      { id: 'table', type: 'rectangle', x: 280, y: 614, width: 1060, height: 286, color: '#ffffff', label: 'Table' },
      { id: 'sidebar-widget', type: 'rectangle', x: 1000, y: 244, width: 340, height: 350, color: '#ffffff', label: 'Widget' },
    ]
  },
  // Mobile App UI Kit
  103: {
    elements: [
      { id: 'phone-frame', type: 'rectangle', x: 520, y: 100, width: 375, height: 812, color: '#f1f5f9', label: 'Phone Frame' },
      { id: 'status-bar', type: 'rectangle', x: 520, y: 100, width: 375, height: 44, color: '#e2e8f0', label: 'Status Bar' },
      { id: 'nav-bar', type: 'rectangle', x: 520, y: 868, width: 375, height: 44, color: '#e2e8f0', label: 'Navigation Bar' },
      { id: 'header', type: 'rectangle', x: 520, y: 144, width: 375, height: 60, color: '#ffffff', label: 'Header' },
      { id: 'card1', type: 'rectangle', x: 540, y: 224, width: 335, height: 100, color: '#ffffff', label: 'Card 1' },
      { id: 'card2', type: 'rectangle', x: 540, y: 344, width: 335, height: 100, color: '#ffffff', label: 'Card 2' },
      { id: 'card3', type: 'rectangle', x: 540, y: 464, width: 335, height: 100, color: '#ffffff', label: 'Card 3' },
      { id: 'card4', type: 'rectangle', x: 540, y: 584, width: 335, height: 100, color: '#ffffff', label: 'Card 4' },
      { id: 'tab1', type: 'rectangle', x: 520, y: 868, width: 125, height: 44, color: '#7c3aed', label: 'Tab 1' },
    ]
  },
  // Landing Page
  104: {
    elements: [
      { id: 'header', type: 'rectangle', x: 0, y: 0, width: 1440, height: 80, color: '#ffffff', label: 'Header' },
      { id: 'hero', type: 'rectangle', x: 0, y: 80, width: 1440, height: 600, color: '#f9fafb', label: 'Hero' },
      { id: 'features', type: 'rectangle', x: 0, y: 680, width: 1440, height: 500, color: '#ffffff', label: 'Features' },
      { id: 'testimonials', type: 'rectangle', x: 0, y: 1180, width: 1440, height: 400, color: '#f9fafb', label: 'Testimonials' },
      { id: 'cta', type: 'rectangle', x: 0, y: 1580, width: 1440, height: 300, color: '#059669', label: 'CTA' },
      { id: 'footer', type: 'rectangle', x: 0, y: 1880, width: 1440, height: 200, color: '#1f2937', label: 'Footer' },
      { id: 'hero-title', type: 'text', x: 200, y: 200, text: 'Your Landing Page Title', fontSize: 48, color: '#111827' },
      { id: 'hero-subtitle', type: 'text', x: 200, y: 280, text: 'A brief description of your product or service.', fontSize: 24, color: '#4b5563' },
    ]
  },
  // E-commerce
  105: {
    elements: [
      { id: 'header', type: 'rectangle', x: 0, y: 0, width: 1440, height: 80, color: '#ffffff', label: 'Header' },
      { id: 'navigation', type: 'rectangle', x: 0, y: 80, width: 1440, height: 50, color: '#f3f4f6', label: 'Navigation' },
      { id: 'filters', type: 'rectangle', x: 0, y: 130, width: 280, height: 770, color: '#ffffff', label: 'Filters' },
      { id: 'product-grid', type: 'rectangle', x: 300, y: 130, width: 1140, height: 770, color: '#ffffff', label: 'Product Grid' },
      // Products
      { id: 'product1', type: 'rectangle', x: 320, y: 150, width: 260, height: 350, color: '#f8fafc', label: 'Product 1' },
      { id: 'product2', type: 'rectangle', x: 600, y: 150, width: 260, height: 350, color: '#f8fafc', label: 'Product 2' },
      { id: 'product3', type: 'rectangle', x: 880, y: 150, width: 260, height: 350, color: '#f8fafc', label: 'Product 3' },
      { id: 'product4', type: 'rectangle', x: 1160, y: 150, width: 260, height: 350, color: '#f8fafc', label: 'Product 4' },
      // Second row
      { id: 'product5', type: 'rectangle', x: 320, y: 520, width: 260, height: 350, color: '#f8fafc', label: 'Product 5' },
      { id: 'product6', type: 'rectangle', x: 600, y: 520, width: 260, height: 350, color: '#f8fafc', label: 'Product 6' },
      { id: 'product7', type: 'rectangle', x: 880, y: 520, width: 260, height: 350, color: '#f8fafc', label: 'Product 7' },
      { id: 'product8', type: 'rectangle', x: 1160, y: 520, width: 260, height: 350, color: '#f8fafc', label: 'Product 8' },
    ]
  },
  // Social Media
  106: {
    elements: [
      { id: 'instagram-post', type: 'rectangle', x: 100, y: 100, width: 500, height: 500, color: '#ffffff', label: 'Instagram Post' },
      { id: 'facebook-post', type: 'rectangle', x: 650, y: 100, width: 500, height: 300, color: '#ffffff', label: 'Facebook Post' },
      { id: 'twitter-post', type: 'rectangle', x: 650, y: 450, width: 500, height: 250, color: '#ffffff', label: 'Twitter Post' },
      { id: 'story', type: 'rectangle', x: 100, y: 650, width: 300, height: 500, color: '#ffffff', label: 'Story' },
      { id: 'profile', type: 'circle', x: 150, y: 150, radius: 40, color: '#e2e8f0', label: 'Profile' },
    ]
  }
};

// Styled Components
const EditorContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
`;

const EditorHeader = styled.header`
  height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#0d99ff' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: 1px solid ${props => props.primary ? 'transparent' : '#d1d5db'};
  border-radius: 4px;
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

const IconButton = styled.button`
  background-color: transparent;
  color: #4b5563;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

const Toolbar = styled.div`
  height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
`;

const Canvas = styled.div`
  flex: 1;
  background-color: #f3f4f6;
  position: relative;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ArtBoard = styled.div`
  width: 1440px;
  height: 900px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  transform: scale(${props => props.zoom});
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
`;

const SidebarContent = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
`;

const PropertiesSection = styled.div`
  margin-bottom: 24px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #0d99ff;
    box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.15);
  }
`;

const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #d1d5db;
  cursor: pointer;
`;

// FigmaEditor Component
const FigmaEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(0.5);
  const [projectTitle, setProjectTitle] = useState('Untitled Design');
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [projectData, setProjectData] = useState(null);
  
  // Load project data from localStorage
  useEffect(() => {
    if (projectId) {
      // Get projects from local storage
      const savedProjects = localStorage.getItem('figma_projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      
      // Find the current project
      const project = projects.find(p => p.id.toString() === projectId.toString());
      
      if (project) {
        setProjectTitle(project.title);
        setProjectData(project);
        
        // Check for template
        if (project.templateId) {
          const templateData = TEMPLATES[project.templateId];
          if (templateData) {
            setElements(templateData.elements);
          }
        } else {
          // Load saved elements if any
          const savedElements = localStorage.getItem(`figma_elements_${projectId}`);
          if (savedElements) {
            setElements(JSON.parse(savedElements));
          }
        }
      }
    }
  }, [projectId]);
  
  // Save changes to localStorage
  useEffect(() => {
    if (projectId && elements.length > 0) {
      localStorage.setItem(`figma_elements_${projectId}`, JSON.stringify(elements));
      setIsSaved(true);
    }
  }, [elements, projectId]);
  
  const handleBackToDashboard = () => {
    if (!isSaved) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/figma');
      }
    } else {
      navigate('/figma');
    }
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  const handleExport = () => {
    setShowExportModal(true);
  };
  
  const handleSave = () => {
    // Save the current state to localStorage
    localStorage.setItem(`figma_elements_${projectId}`, JSON.stringify(elements));
    
    // Update the project's lastModified time
    const savedProjects = localStorage.getItem('figma_projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map(project => {
        if (project.id.toString() === projectId.toString()) {
          return {
            ...project,
            title: projectTitle,
            lastModified: 'Just now'
          };
        }
        return project;
      });
      
      localStorage.setItem('figma_projects', JSON.stringify(updatedProjects));
    }
    
    setIsSaved(true);
    alert('Project saved successfully!');
  };
  
  const handleTitleChange = (e) => {
    setProjectTitle(e.target.value);
    setIsSaved(false);
  };
  
  const handleElementSelect = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    setSelectedElement(element);
  };
  
  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    setIsSaved(false);
  };
  
  const addElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 150,
      color: '#e5e7eb',
      label: `New ${type}`
    };
    
    if (type === 'circle') {
      newElement.radius = 75;
      delete newElement.width;
      delete newElement.height;
    }
    
    if (type === 'text') {
      newElement.text = 'Text element';
      newElement.fontSize = 16;
      newElement.color = '#000000';
    }
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setIsSaved(false);
  };
  
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
    setIsSaved(false);
  };
  
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/figma/view/${projectId}`;
    
    // Create a temporary input to copy the URL
    const tempInput = document.createElement('input');
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    setShowShareModal(false);
    alert('Share link copied to clipboard!');
  };
  
  return (
    <EditorContainer>
      <EditorHeader>
        <HeaderLeft>
          <Logo>Figma Design</Logo>
          <input 
            type="text"
            value={projectTitle}
            onChange={handleTitleChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </HeaderLeft>
        <HeaderRight>
          <Button onClick={handleSave} title="Save project">Save</Button>
          <Button onClick={handleExport} title="Export design">Export</Button>
          <Button onClick={handleShare} title="Share design">Share</Button>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </HeaderRight>
      </EditorHeader>
      
      <Toolbar>
        <ToolGroup>
          <IconButton title="Select" onClick={() => {}}>
            <span>▢</span>
          </IconButton>
          <IconButton title="Add Rectangle" onClick={() => addElement('rectangle')}>
            <span>□</span>
          </IconButton>
          <IconButton title="Add Text" onClick={() => addElement('text')}>
            <span>T</span>
          </IconButton>
          <IconButton title="Add Circle" onClick={() => addElement('circle')}>
            <span>○</span>
          </IconButton>
        </ToolGroup>
        
        <ToolGroup>
          <Button>
            {(zoom * 100).toFixed(0)}%
          </Button>
          <IconButton title="Zoom Out" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
            <span>-</span>
          </IconButton>
          <IconButton title="Zoom In" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            <span>+</span>
          </IconButton>
        </ToolGroup>
      </Toolbar>
      
      <EditorContent>
        <Canvas>
          <ArtBoard zoom={zoom}>
            {elements.map(element => {
              if (element.type === 'rectangle') {
                return (
                  <div
                    key={element.id}
                    onClick={() => handleElementSelect(element.id)}
                    style={{
                      position: 'absolute',
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      backgroundColor: element.color,
                      border: selectedElement && selectedElement.id === element.id ? '2px solid #0d99ff' : '1px solid #d1d5db',
                      cursor: 'pointer',
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
                    onClick={() => handleElementSelect(element.id)}
                    style={{
                      position: 'absolute',
                      left: `${element.x - element.radius}px`,
                      top: `${element.y - element.radius}px`,
                      width: `${element.radius * 2}px`,
                      height: `${element.radius * 2}px`,
                      backgroundColor: element.color,
                      borderRadius: '50%',
                      border: selectedElement && selectedElement.id === element.id ? '2px solid #0d99ff' : '1px solid #d1d5db',
                      cursor: 'pointer',
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
                    onClick={() => handleElementSelect(element.id)}
                    style={{
                      position: 'absolute',
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      minHeight: `${element.height}px`,
                      padding: '8px',
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      border: selectedElement && selectedElement.id === element.id ? '2px solid #0d99ff' : '1px dashed #d1d5db',
                      cursor: 'pointer',
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
          </ArtBoard>
        </Canvas>
        
        <Sidebar>
          <SidebarHeader>Properties</SidebarHeader>
          <SidebarContent>
            {selectedElement ? (
              <PropertiesSection>
                <PropertyLabel>Element Type</PropertyLabel>
                <div style={{ marginBottom: '12px' }}>
                  <span>{selectedElement.type}</span>
                </div>
                
                <PropertyLabel>Position</PropertyLabel>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <PropertyLabel style={{ fontSize: '0.75rem' }}>X</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement.x}
                      onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <PropertyLabel style={{ fontSize: '0.75rem' }}>Y</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement.y}
                      onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                {selectedElement.type !== 'circle' ? (
                  <>
                    <PropertyLabel>Size</PropertyLabel>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <PropertyLabel style={{ fontSize: '0.75rem' }}>Width</PropertyLabel>
                        <PropertyInput 
                          type="number" 
                          value={selectedElement.width}
                          onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <PropertyLabel style={{ fontSize: '0.75rem' }}>Height</PropertyLabel>
                        <PropertyInput 
                          type="number" 
                          value={selectedElement.height}
                          onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <PropertyLabel>Size</PropertyLabel>
                    <div style={{ marginBottom: '12px' }}>
                      <PropertyLabel style={{ fontSize: '0.75rem' }}>Radius</PropertyLabel>
                      <PropertyInput 
                        type="number" 
                        value={selectedElement.radius}
                        onChange={(e) => updateElement(selectedElement.id, { radius: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </>
                )}
                
                {selectedElement.type === 'text' && (
                  <>
                    <PropertyLabel>Text</PropertyLabel>
                    <textarea
                      value={selectedElement.text}
                      onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        marginBottom: '12px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                    />
                    
                    <PropertyLabel>Font Size</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 12 })}
                    />
                  </>
                )}
                
                <PropertyLabel>{selectedElement.type === 'text' ? 'Color' : 'Fill'}</PropertyLabel>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none' }}
                  />
                  <PropertyInput 
                    type="text" 
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                  />
                </div>
                
                <PropertyLabel>Label</PropertyLabel>
                <PropertyInput 
                  type="text" 
                  value={selectedElement.label}
                  onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                />
                
                <Button 
                  style={{ marginTop: '16px', backgroundColor: '#ef4444', color: 'white', width: '100%' }}
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  Delete Element
                </Button>
              </PropertiesSection>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                <p>Select an element to edit its properties</p>
              </div>
            )}
          </SidebarContent>
        </Sidebar>
      </EditorContent>
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Share Your Design</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Anyone with the link can view this design</p>
              <div className="flex">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/figma/view/${projectId}`} 
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={copyShareLink}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition"
                >
                  Copy
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded mt-2 hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Export Design</h3>
            <div className="space-y-4">
              <button 
                className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                onClick={() => {
                  setShowExportModal(false);
                  alert('PNG export feature would download the design as a PNG file');
                }}
              >
                Export as PNG
              </button>
              <button 
                className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                onClick={() => {
                  setShowExportModal(false);
                  alert('SVG export feature would download the design as an SVG file');
                }}
              >
                Export as SVG
              </button>
              <button 
                className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                onClick={() => {
                  const designData = {
                    id: projectId,
                    title: projectTitle,
                    elements: elements,
                    exportedAt: new Date().toISOString()
                  };
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designData, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", `${projectTitle.replace(/\s+/g, '-').toLowerCase()}.json`);
                  document.body.appendChild(downloadAnchorNode); // Required for Firefox
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                  setShowExportModal(false);
                }}
              >
                Export as JSON
              </button>
            </div>
            <button 
              onClick={() => setShowExportModal(false)}
              className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded mt-4 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </EditorContainer>
  );
};

export default FigmaEditor; 