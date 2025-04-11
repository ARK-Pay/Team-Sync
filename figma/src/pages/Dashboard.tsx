import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Enhanced Dashboard UI with Figma-like styling
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--neutral-50);
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--neutral-200);
  background-color: white;
  height: 64px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 20px;
  color: var(--neutral-900);
  
  svg {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    fill: var(--primary-500);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserProfile = styled.div`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-200);
  }
`;

const Navigation = styled.nav`
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid var(--neutral-200);
  background-color: white;
`;

const NavItem = styled.button<{ active?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--primary-500)' : 'var(--neutral-700)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-500)' : 'transparent'};
  transition: all var(--transition-fast);
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-900)'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--neutral-900);
`;

const CreateButton = styled.button`
  background-color: var(--primary-500);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color var(--transition-fast);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    background-color: var(--primary-600);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ProjectCard = styled.div`
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: white;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const ProjectThumbnail = styled.div`
  height: 160px;
  background-color: var(--neutral-100);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, var(--neutral-200), var(--neutral-100));
    opacity: 0.8;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 60%;
    height: 40%;
    top: 30%;
    left: 20%;
    background-color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }
`;

const ProjectInfo = styled.div`
  padding: 16px;
`;

const ProjectName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--neutral-900);
  margin-bottom: 4px;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--neutral-500);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--neutral-500);
  text-align: center;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    color: var(--neutral-300);
  }
  
  h2 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--neutral-700);
  }
  
  p {
    max-width: 400px;
    margin-bottom: 24px;
  }
`;

interface Project {
  id: string;
  name: string;
  lastModified: Date;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    // In a real app, fetch projects from the backend
    // For now, we'll use mock data
    setTimeout(() => {
      setProjects([
        { id: '1', name: 'Website Redesign', lastModified: new Date() },
        { id: '2', name: 'Mobile App UI', lastModified: new Date(Date.now() - 86400000) },
        { id: '3', name: 'Marketing Campaign', lastModified: new Date(Date.now() - 172800000) },
        { id: '4', name: 'Dashboard UI Kit', lastModified: new Date(Date.now() - 259200000) },
        { id: '5', name: 'E-commerce Prototype', lastModified: new Date(Date.now() - 345600000) },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const createNewProject = async () => {
    try {
      // In a real app, make an API call to create a new project
      const newProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: `New Project ${projects.length + 1}`,
        lastModified: new Date(),
      };
      
      setProjects([newProject, ...projects]);
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <Logo>
            <svg viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 28.5c5.247 0 9.5-4.253 9.5-9.5s-4.253-9.5-9.5-9.5-9.5 4.253-9.5 9.5 4.253 9.5 9.5 9.5z" />
              <path d="M19 0c-10.493 0-19 8.507-19 19 0 4.52 1.574 8.662 4.21 11.926L19 57l14.79-26.074A18.927 18.927 0 0038 19c0-10.493-8.507-19-19-19zm0 28.5c-5.247 0-9.5-4.253-9.5-9.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5-4.253 9.5-9.5 9.5z" />
            </svg>
            Figma
          </Logo>
          <HeaderActions>
            <UserProfile>U</UserProfile>
          </HeaderActions>
        </DashboardHeader>
        <Navigation>
          <NavItem active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>Recent</NavItem>
          <NavItem active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>Drafts</NavItem>
          <NavItem active={activeTab === 'shared'} onClick={() => setActiveTab('shared')}>Shared with me</NavItem>
          <NavItem active={activeTab === 'liked'} onClick={() => setActiveTab('liked')}>Liked</NavItem>
        </Navigation>
        <MainContent>
          <ContentHeader>
            <Title>Loading projects...</Title>
          </ContentHeader>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div className="loading-spinner" style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid var(--neutral-200)', 
              borderTop: '3px solid var(--primary-500)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Logo>
          <svg viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 28.5c5.247 0 9.5-4.253 9.5-9.5s-4.253-9.5-9.5-9.5-9.5 4.253-9.5 9.5 4.253 9.5 9.5 9.5z" />
            <path d="M19 0c-10.493 0-19 8.507-19 19 0 4.52 1.574 8.662 4.21 11.926L19 57l14.79-26.074A18.927 18.927 0 0038 19c0-10.493-8.507-19-19-19zm0 28.5c-5.247 0-9.5-4.253-9.5-9.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5-4.253 9.5-9.5 9.5z" />
          </svg>
          Figma
        </Logo>
        <HeaderActions>
          <UserProfile>U</UserProfile>
        </HeaderActions>
      </DashboardHeader>
      <Navigation>
        <NavItem active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>Recent</NavItem>
        <NavItem active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>Drafts</NavItem>
        <NavItem active={activeTab === 'shared'} onClick={() => setActiveTab('shared')}>Shared with me</NavItem>
        <NavItem active={activeTab === 'liked'} onClick={() => setActiveTab('liked')}>Liked</NavItem>
      </Navigation>
      <MainContent>
        <ContentHeader>
          <Title>Recent projects</Title>
          <CreateButton onClick={createNewProject}>
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Project
          </CreateButton>
        </ContentHeader>
        
        {projects.length === 0 ? (
          <EmptyState>
            <svg viewBox="0 0 24 24">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
            </svg>
            <h2>No projects yet</h2>
            <p>Create your first project to get started with Figma.</p>
            <CreateButton onClick={createNewProject}>
              <svg viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              New Project
            </CreateButton>
          </EmptyState>
        ) : (
          <ProjectsGrid>
            {projects.map((project) => (
              <ProjectCard 
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <ProjectThumbnail />
                <ProjectInfo>
                  <ProjectName>{project.name}</ProjectName>
                  <ProjectMeta>
                    <span>Edited {formatDate(project.lastModified)}</span>
                    <span>You</span>
                  </ProjectMeta>
                </ProjectInfo>
              </ProjectCard>
            ))}
          </ProjectsGrid>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;