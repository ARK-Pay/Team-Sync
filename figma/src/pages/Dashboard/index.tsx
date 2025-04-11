import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import './dashboard.css';

// Using SVG icons directly instead of react-icons/fi to avoid dependency issues
interface IconProps {
  size?: number;
  color?: string;
}

const SearchIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const GridIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const FolderIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const TrashIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const GlobeIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

// Enhanced Dashboard UI with professional styling
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--neutral-50);
  overflow: hidden;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid var(--neutral-200);
  background-color: white;
  box-shadow: var(--shadow-xs);
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-600);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-100);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-200);
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 320px;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--neutral-500);
  }
  
  input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 36px;
    border-radius: 6px;
    border: 1px solid var(--neutral-300);
    background-color: var(--neutral-100);
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-400);
      background-color: white;
    }
    
    &::placeholder {
      color: var(--neutral-400);
    }
  }
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 240px;
  background-color: white;
  border-right: 1px solid var(--neutral-200);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
`;

const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SidebarTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  padding: 0 8px;
`;

const SidebarItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: ${props => props.active ? '500' : '400'};
  color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-700)'};
  background-color: ${props => props.active ? 'var(--primary-50)' : 'transparent'};
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-100)' : 'var(--neutral-100)'};
  }
  
  svg {
    color: ${props => props.active ? 'var(--primary-500)' : 'var(--neutral-500)'};
  }
`;

const ProjectsContainer = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--neutral-900);
    margin-bottom: 24px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--neutral-200);
  padding-bottom: 12px;
`;

const Tab = styled.button<{ active: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-600)'};
  padding-bottom: 12px;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-500)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-900)'};
  }
`;

const ViewControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ViewModeToggle = styled.div`
  display: flex;
  background-color: var(--neutral-100);
  border-radius: 6px;
  padding: 4px;
`;

const ViewModeButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--neutral-900)' : 'var(--neutral-500)'};
  box-shadow: ${props => props.active ? 'var(--shadow-xs)' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => !props.active && 'var(--neutral-700)'};
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.3s ease;
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeIn} 0.3s ease;
`;

const ProjectCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectThumbnail = styled.div`
  height: 160px;
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProjectInfo = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectName = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-900);
  margin: 0;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProjectDate = styled.span`
  font-size: 12px;
  color: var(--neutral-500);
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ProjectCard}:hover & {
    opacity: 1;
  }
`;

const ProjectAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--neutral-500);
  
  &:hover {
    background-color: var(--neutral-100);
    color: var(--neutral-900);
  }
`;

const ProjectListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--neutral-50);
    box-shadow: var(--shadow-sm);
  }
`;

const ProjectListInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProjectListThumbnail = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--neutral-100);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProjectListDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectListActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    width: 32px;
    height: 32px;
    color: var(--neutral-400);
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--neutral-800);
  margin-bottom: 8px;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: var(--neutral-500);
  margin-bottom: 24px;
  max-width: 400px;
`;

const CreateNewButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  z-index: 100;
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    background-color: var(--primary-600);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  edited?: Date;
  type: 'design' | 'template' | 'library';
  thumbnail?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recent' | 'files' | 'projects'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('recent');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Mobile App Dashboard',
      createdAt: new Date(),
      edited: new Date(),
      type: 'design',
      thumbnail: 'https://i.imgur.com/JvVQmjS.png'
    },
    {
      id: '2',
      name: 'Website Redesign',
      createdAt: new Date(Date.now() - 86400000),
      edited: new Date(Date.now() - 43200000),
      type: 'design',
      thumbnail: 'https://i.imgur.com/3tYB2Hj.png'
    },
    {
      id: '3',
      name: 'Brand Guidelines',
      createdAt: new Date(Date.now() - 172800000),
      edited: new Date(Date.now() - 86400000),
      type: 'design',
      thumbnail: 'https://i.imgur.com/QlA8e0J.png'
    },
    {
      id: '4',
      name: 'UI Component Library',
      createdAt: new Date(Date.now() - 259200000),
      edited: new Date(Date.now() - 172800000),
      type: 'library',
      thumbnail: 'https://i.imgur.com/L8xacbA.png'
    },
    {
      id: '5',
      name: 'E-commerce Template',
      createdAt: new Date(Date.now() - 345600000),
      edited: new Date(Date.now() - 259200000),
      type: 'template',
      thumbnail: 'https://i.imgur.com/7KnQNWk.png'
    }
  ]);
  
  const handleCreateNew = () => {
    const newId = Math.random().toString(36).substring(2, 15);
    const newProject = {
      id: newId,
      name: 'Untitled',
      createdAt: new Date(),
      edited: new Date(),
      type: 'design' as const,
      thumbnail: ''
    };
    
    setProjects([newProject, ...projects]);
    navigate(`/editor/${newId}`);
  };
  
  const handleProjectClick = (id: string) => {
    navigate(`/editor/${id}`);
  };
  
  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjects(projects.filter(project => project.id !== id));
  };
  
  const handleDuplicateProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const newId = Math.random().toString(36).substring(2, 15);
    const duplicatedProject = {
      ...project,
      id: newId,
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      edited: new Date()
    };
    
    setProjects([duplicatedProject, ...projects]);
  };
  
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <DashboardContainer>
      <Header>
        <Logo>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12V21M12 12L19.5 8.25M12 12L4.5 8.25M19.5 8.25L12 3L4.5 8.25M19.5 8.25V15.75L12 21M4.5 8.25V15.75L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Figma Clone
        </Logo>
        
        <SearchBar>
          <SearchIcon />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search files and projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        
        <HeaderActions>
          <UserAvatar onClick={() => alert('User profile would open here')}>
            U
          </UserAvatar>
        </HeaderActions>
      </Header>
      
      <MainContent>
        <Sidebar>
          <SidebarSection>
            <SidebarItem 
              active={activeSidebarItem === 'recent'} 
              onClick={() => setActiveSidebarItem('recent')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Recent
            </SidebarItem>
            <SidebarItem 
              active={activeSidebarItem === 'drafts'} 
              onClick={() => setActiveSidebarItem('drafts')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Drafts
            </SidebarItem>
            <SidebarItem 
              active={activeSidebarItem === 'templates'} 
              onClick={() => navigate('/templates')}
            >
              <GridIcon />
              Templates
            </SidebarItem>
            <SidebarItem 
              active={activeSidebarItem === 'trash'} 
              onClick={() => setActiveSidebarItem('trash')}
            >
              <TrashIcon />
              Trash
            </SidebarItem>
          </SidebarSection>
          
          <SidebarSection>
            <SidebarTitle>Teams</SidebarTitle>
            <SidebarItem 
              active={activeSidebarItem === 'personal'} 
              onClick={() => setActiveSidebarItem('personal')}
            >
              <UserAvatar style={{ width: '18px', height: '18px', fontSize: '10px' }}>
                U
              </UserAvatar>
              Personal
            </SidebarItem>
            <SidebarItem onClick={() => alert('Create team feature would open here')}>
              <PlusIcon />
              Create team
            </SidebarItem>
          </SidebarSection>
        </Sidebar>
        
        <ProjectsContainer>
          <h2>{activeSidebarItem === 'recent' ? 'Recent files' : activeSidebarItem === 'drafts' ? 'Drafts' : activeSidebarItem === 'personal' ? 'Personal files' : 'Trash'}</h2>
          
          <ViewControls>
            <TabsContainer>
              <Tab 
                active={activeTab === 'recent'} 
                onClick={() => setActiveTab('recent')}
              >
                Recent
              </Tab>
              <Tab 
                active={activeTab === 'files'} 
                onClick={() => setActiveTab('files')}
              >
                Files
              </Tab>
              <Tab 
                active={activeTab === 'projects'} 
                onClick={() => setActiveTab('projects')}
              >
                Projects
              </Tab>
            </TabsContainer>
            
            <ViewModeToggle>
              <ViewModeButton 
                active={viewMode === 'grid'} 
                onClick={() => setViewMode('grid')}
              >
                <GridIcon />
              </ViewModeButton>
              <ViewModeButton 
                active={viewMode === 'list'} 
                onClick={() => setViewMode('list')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </ViewModeButton>
            </ViewModeToggle>
          </ViewControls>
          
          {isLoaded ? (
            filteredProjects.length > 0 ? (
              viewMode === 'grid' ? (
                <ProjectsGrid>
                  {filteredProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <ProjectThumbnail>
                        {project.thumbnail ? (
                          <img src={project.thumbnail} alt={project.name} />
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        )}
                      </ProjectThumbnail>
                      <ProjectInfo>
                        <ProjectName>{project.name}</ProjectName>
                        <ProjectMeta>
                          <ProjectDate>Edited {formatDate(project.edited || project.createdAt)}</ProjectDate>
                          <ProjectActions>
                            <ProjectAction 
                              title="Duplicate"
                              onClick={(e) => handleDuplicateProject(e, project)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor"></rect>
                                <rect x="3" y="3" width="13" height="13" rx="2" fill="none" stroke="currentColor"></rect>
                              </svg>
                            </ProjectAction>
                            <ProjectAction 
                              title="Delete"
                              onClick={(e) => handleDeleteProject(e, project.id)}
                            >
                              <TrashIcon />
                            </ProjectAction>
                          </ProjectActions>
                        </ProjectMeta>
                      </ProjectInfo>
                    </ProjectCard>
                  ))}
                </ProjectsGrid>
              ) : (
                <ProjectsList>
                  {filteredProjects.map(project => (
                    <ProjectListItem 
                      key={project.id} 
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <ProjectListInfo>
                        <ProjectListThumbnail>
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.name} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                            </div>
                          )}
                        </ProjectListThumbnail>
                        <ProjectListDetails>
                          <ProjectName>{project.name}</ProjectName>
                          <ProjectDate>Edited {formatDate(project.edited || project.createdAt)}</ProjectDate>
                        </ProjectListDetails>
                      </ProjectListInfo>
                      <ProjectListActions>
                        <ProjectAction 
                          title="Duplicate"
                          onClick={(e) => handleDuplicateProject(e, project)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor"></rect>
                            <rect x="3" y="3" width="13" height="13" rx="2" fill="none" stroke="currentColor"></rect>
                          </svg>
                        </ProjectAction>
                        <ProjectAction 
                          title="Delete"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                        >
                          <TrashIcon />
                        </ProjectAction>
                      </ProjectListActions>
                    </ProjectListItem>
                  ))}
                </ProjectsList>
              )
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </EmptyStateIcon>
                <EmptyStateTitle>No files found</EmptyStateTitle>
                <EmptyStateText>
                  {searchQuery ? `No results found for "${searchQuery}"` : "You don't have any files yet. Create a new file to get started."}
                </EmptyStateText>
                <button 
                  className="primary-button"
                  onClick={handleCreateNew}
                >
                  <PlusIcon />
                  Create new file
                </button>
              </EmptyState>
            )
          ) : (
            // Skeleton loading state
            <ProjectsGrid>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ 
                  backgroundColor: 'var(--neutral-100)', 
                  borderRadius: '8px',
                  height: '220px',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}></div>
              ))}
            </ProjectsGrid>
          )}
        </ProjectsContainer>
      </MainContent>
      
      <CreateNewButton onClick={handleCreateNew} title="Create new file">
        <PlusIcon size={24} />
      </CreateNewButton>
    </DashboardContainer>
  );
};

export default Dashboard;
