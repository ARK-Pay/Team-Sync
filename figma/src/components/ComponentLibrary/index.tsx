import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiFolder, FiSearch, FiGrid, FiList, FiMoreVertical, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';

// Styled components for the Component Library
const ComponentLibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--neutral-200);
  width: 300px;
`;

const LibraryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const LibraryTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-900);
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  padding: 12px 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-300);
  font-size: 13px;
  background-color: var(--neutral-100);
  
  &:focus {
    outline: none;
    border-color: var(--primary-400);
    background-color: white;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--neutral-500);
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-left: auto;
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-500)' : 'var(--neutral-600)'};
  box-shadow: ${props => props.active ? 'var(--shadow-xs)' : 'none'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ComponentsGrid = styled.div<{ viewMode: string }>`
  display: ${props => props.viewMode === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  flex-direction: ${props => props.viewMode === 'list' ? 'column' : 'row'};
  flex: 1;
  overflow-y: auto;
`;

const ComponentCard = styled.div<{ viewMode: string }>`
  display: flex;
  flex-direction: ${props => props.viewMode === 'grid' ? 'column' : 'row'};
  align-items: ${props => props.viewMode === 'list' ? 'center' : 'stretch'};
  background-color: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-300);
    box-shadow: var(--shadow-sm);
  }
`;

const ComponentPreview = styled.div<{ viewMode: string }>`
  background-color: var(--neutral-100);
  width: ${props => props.viewMode === 'list' ? '48px' : '100%'};
  height: ${props => props.viewMode === 'grid' ? '80px' : '48px'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-400);
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ComponentInfo = styled.div`
  padding: 8px;
  flex: 1;
`;

const ComponentName = styled.h4`
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--neutral-900);
`;

const ComponentMeta = styled.div`
  font-size: 12px;
  color: var(--neutral-500);
`;

const ComponentActions = styled.div`
  display: flex;
  opacity: 0;
  transition: opacity var(--transition-fast);
  
  ${ComponentCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  color: var(--neutral-600);
  
  &:hover {
    background-color: var(--neutral-100);
    color: var(--neutral-900);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--neutral-500);
  height: 100%;
`;

const EmptyStateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--neutral-400);
  }
`;

const EmptyStateTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: var(--neutral-700);
`;

const EmptyStateText = styled.p`
  font-size: 13px;
  margin: 0 0 16px 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--primary-500);
  color: white;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-600);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Types for components
interface ComponentItem {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  variants: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ComponentLibraryProps {
  onSelectComponent: (componentId: string) => void;
  onCreateComponent: () => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onSelectComponent,
  onCreateComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [components, setComponents] = useState<ComponentItem[]>([]);
  
  // Simulated components data - in a real app, this would come from an API
  useEffect(() => {
    // Simulated API call to fetch components
    const mockComponents: ComponentItem[] = [
      {
        id: '1',
        name: 'Button',
        description: 'Primary action button',
        variants: 4,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2023-04-02')
      },
      {
        id: '2',
        name: 'Card',
        description: 'Content container',
        variants: 2,
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-28')
      },
      {
        id: '3',
        name: 'Input Field',
        description: 'Text input with label',
        variants: 3,
        createdAt: new Date('2023-02-22'),
        updatedAt: new Date('2023-03-15')
      }
    ];
    
    setComponents(mockComponents);
  }, []);
  
  // Filter components based on search query
  const filteredComponents = components.filter(component => 
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <ComponentLibraryContainer>
      <LibraryHeader>
        <LibraryTitle>Components</LibraryTitle>
        <ActionButton onClick={onCreateComponent} title="Create Component">
          <FiPlus />
        </ActionButton>
      </LibraryHeader>
      
      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput 
          placeholder="Search components..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>
      
      <ToolbarActions>
        <ViewToggle>
          <ToggleButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <FiGrid />
          </ToggleButton>
          <ToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <FiList />
          </ToggleButton>
        </ViewToggle>
      </ToolbarActions>
      
      {filteredComponents.length > 0 ? (
        <ComponentsGrid viewMode={viewMode}>
          {filteredComponents.map(component => (
            <ComponentCard 
              key={component.id} 
              viewMode={viewMode}
              onClick={() => onSelectComponent(component.id)}
            >
              <ComponentPreview viewMode={viewMode}>
                <FiFolder />
              </ComponentPreview>
              <ComponentInfo>
                <ComponentName>{component.name}</ComponentName>
                <ComponentMeta>{component.variants} variants</ComponentMeta>
              </ComponentInfo>
              <ComponentActions>
                <ActionButton title="Edit">
                  <FiEdit2 />
                </ActionButton>
                <ActionButton title="Duplicate">
                  <FiCopy />
                </ActionButton>
                <ActionButton title="Delete">
                  <FiTrash2 />
                </ActionButton>
                <ActionButton title="More">
                  <FiMoreVertical />
                </ActionButton>
              </ComponentActions>
            </ComponentCard>
          ))}
        </ComponentsGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FiFolder />
          </EmptyStateIcon>
          <EmptyStateTitle>No components yet</EmptyStateTitle>
          <EmptyStateText>
            Create reusable components to share across your designs
          </EmptyStateText>
          <CreateButton onClick={onCreateComponent}>
            <FiPlus />
            Create Component
          </CreateButton>
        </EmptyState>
      )}
    </ComponentLibraryContainer>
  );
};

export default ComponentLibrary;
