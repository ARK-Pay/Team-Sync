import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Styled Components
const DashboardContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #f9fafb;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#0d99ff' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#374151'};
  border: 1px solid ${props => props.primary ? 'transparent' : '#d1d5db'};
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#2b6cb0' : '#f3f4f6'};
  }
`;

const ContentContainer = styled.main`
  padding: 24px;
  flex: 1;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ProjectCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const ProjectThumbnail = styled.div`
  height: 160px;
  background-color: ${props => props.color || '#f3f4f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
`;

const ProjectInfo = styled.div`
  padding: 16px;
`;

const ProjectTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: ${props => props.marginTop || '0'};
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  padding: 12px 24px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? '#0d99ff' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#0d99ff' : 'transparent'};
  background: transparent;
  transition: all 0.2s;
  
  &:hover {
    color: #0d99ff;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #111827;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #0d99ff;
    box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #0d99ff;
    box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.15);
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
`;

// Sample project data
const sampleProjects = [
  { id: 1, title: 'Landing Page Design', color: '#10b981', lastModified: '2 days ago' },
  { id: 2, title: 'Mobile App UI', color: '#3b82f6', lastModified: '1 week ago' },
  { id: 3, title: 'Dashboard Wireframes', color: '#8b5cf6', lastModified: '3 days ago' },
  { id: 4, title: 'E-commerce Product Page', color: '#f59e0b', lastModified: 'Yesterday' },
  { id: 5, title: 'Social Media Kit', color: '#ef4444', lastModified: '5 days ago' },
  { id: 6, title: 'Brand Guidelines', color: '#0ea5e9', lastModified: '2 weeks ago' },
];

// Built-in templates
const templates = [
  { id: 101, title: 'Wireframe Kit', color: '#64748b', description: 'Basic wireframing components' },
  { id: 102, title: 'Web Dashboard', color: '#0891b2', description: 'Complete dashboard layout' },
  { id: 103, title: 'Mobile App UI Kit', color: '#7c3aed', description: 'Mobile app UI components' },
  { id: 104, title: 'Landing Page', color: '#059669', description: 'Landing page template with sections' },
  { id: 105, title: 'E-commerce', color: '#d97706', description: 'Online store layouts and components' },
  { id: 106, title: 'Social Media', color: '#db2777', description: 'Social media post templates' },
];

// FigmaDashboard Component
const FigmaDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch projects from an API
    // Here we're using localStorage to simulate persistence
    const savedProjects = localStorage.getItem('figma_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(sampleProjects);
      localStorage.setItem('figma_projects', JSON.stringify(sampleProjects));
    }
  }, []);

  const handleNewProject = () => {
    setShowNewModal(true);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    let templateId = null;
    if (selectedTemplate) {
      templateId = parseInt(selectedTemplate);
    }
    
    const newProject = {
      id: Date.now(),
      title: newProjectName.trim(),
      color: getRandomColor(),
      lastModified: 'Just now',
      templateId
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('figma_projects', JSON.stringify(updatedProjects));
    
    setShowNewModal(false);
    setNewProjectName('');
    setSelectedTemplate('');
    setError('');
    
    // Navigate to the editor with the new project
    navigate(`/figma/editor/${newProject.id}`);
  };

  const handleImportProject = () => {
    if (!importUrl.trim()) {
      setImportError('URL is required');
      return;
    }
    
    // Here you would typically validate the URL and process the import
    // For this example, we'll create a new project based on the import
    const newProject = {
      id: Date.now(),
      title: `Imported Project (${new Date().toLocaleDateString()})`,
      color: getRandomColor(),
      lastModified: 'Just now',
      imported: true,
      sourceUrl: importUrl
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('figma_projects', JSON.stringify(updatedProjects));
    
    setShowImportModal(false);
    setImportUrl('');
    setImportError('');
    
    // Navigate to the editor with the imported project
    navigate(`/figma/editor/${newProject.id}`);
  };

  const createFromTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const newProject = {
      id: Date.now(),
      title: `${template.title} (Copy)`,
      color: template.color,
      lastModified: 'Just now',
      templateId: template.id
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('figma_projects', JSON.stringify(updatedProjects));
    
    // Navigate to the editor with the template-based project
    navigate(`/figma/editor/${newProject.id}`);
  };

  const getRandomColor = () => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#ec4899', '#14b8a6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const shareProject = (projectId) => {
    const shareUrl = `${window.location.origin}/figma/viewer/${projectId}`;
    
    // Create a temporary input to copy the URL
    const tempInput = document.createElement('input');
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert(`Share link copied to clipboard: ${shareUrl}`);
  };
  
  return (
    <DashboardContainer>
      <Header>
        <HeaderTitle>Figma Designs</HeaderTitle>
        <HeaderActions>
          <Button onClick={handleImport}>Import</Button>
          <Button primary onClick={handleNewProject}>New Design</Button>
        </HeaderActions>
      </Header>
      
      <ContentContainer>
        <TabContainer>
          <Tab 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')}
          >
            My Projects
          </Tab>
          <Tab 
            active={activeTab === 'templates'} 
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </Tab>
        </TabContainer>
        
        {activeTab === 'projects' ? (
          <>
            <SectionTitle>Recent Projects</SectionTitle>
            
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>You don't have any projects yet</p>
                <Button primary onClick={handleNewProject}>Create New Project</Button>
              </div>
            ) : (
              <ProjectGrid>
                {projects.map(project => (
                  <ProjectCard key={project.id}>
                    <Link to={`/figma/editor/${project.id}`}>
                      <ProjectThumbnail color={project.color}>
                        {project.title.charAt(0)}
                      </ProjectThumbnail>
                      <ProjectInfo>
                        <ProjectTitle>{project.title}</ProjectTitle>
                        <ProjectMeta>
                          <span>Last modified: {project.lastModified}</span>
                          <div>
                            <Button 
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={(e) => {
                                e.preventDefault();
                                shareProject(project.id);
                              }}
                            >
                              Share
                            </Button>
                          </div>
                        </ProjectMeta>
                      </ProjectInfo>
                    </Link>
                  </ProjectCard>
                ))}
              </ProjectGrid>
            )}
          </>
        ) : (
          <>
            <SectionTitle>Built-in Templates</SectionTitle>
            <ProjectGrid>
              {templates.map(template => (
                <ProjectCard key={template.id}>
                  <div 
                    onClick={() => createFromTemplate(template.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ProjectThumbnail color={template.color}>
                      {template.title.charAt(0)}
                    </ProjectThumbnail>
                    <ProjectInfo>
                      <ProjectTitle>{template.title}</ProjectTitle>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                        {template.description}
                      </p>
                      <Button 
                        primary
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        Use Template
                      </Button>
                    </ProjectInfo>
                  </div>
                </ProjectCard>
              ))}
            </ProjectGrid>
          </>
        )}
      </ContentContainer>
      
      {/* New Project Modal */}
      {showNewModal && (
        <Modal onClick={() => setShowNewModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Project</ModalTitle>
              <CloseButton onClick={() => setShowNewModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label htmlFor="projectName">Project Name</Label>
              <Input 
                id="projectName" 
                type="text" 
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="template">Template (Optional)</Label>
              <Select 
                id="template" 
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
              >
                <option value="">Start from scratch</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <Button 
              primary 
              style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
              onClick={handleCreateProject}
            >
              Create Project
            </Button>
          </ModalContent>
        </Modal>
      )}
      
      {/* Import Modal */}
      {showImportModal && (
        <Modal onClick={() => setShowImportModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Import from Figma</ModalTitle>
              <CloseButton onClick={() => setShowImportModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label htmlFor="importUrl">Figma URL</Label>
              <Input 
                id="importUrl" 
                type="text" 
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
              />
              {importError && <ErrorMessage>{importError}</ErrorMessage>}
            </FormGroup>
            
            <Button 
              primary 
              style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
              onClick={handleImportProject}
            >
              Import
            </Button>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default FigmaDashboard; 