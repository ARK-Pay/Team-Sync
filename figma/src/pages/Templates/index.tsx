import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for the Templates page
const TemplatesContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #999;
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  margin-right: 10px;
  border: 1px solid ${props => props.active ? '#2196F3' : '#e0e0e0'};
  border-radius: 20px;
  background-color: ${props => props.active ? '#e3f2fd' : 'white'};
  color: ${props => props.active ? '#2196F3' : '#666'};
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const TemplateCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateImage = styled.div<{ bgImage: string }>`
  height: 180px;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  background-color: #f5f5f5;
`;

const TemplateInfo = styled.div`
  padding: 16px;
`;

const TemplateName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
`;

const TemplateDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const TemplateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TemplateCategory = styled.span`
  font-size: 12px;
  color: #888;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
`;

const TemplateButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976D2;
  }
`;

// Template interface
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  data: any; // This will hold the canvas data
}

// Mock templates data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Landing Page',
    description: 'A modern landing page template with hero section, features, and call to action.',
    category: 'Web',
    thumbnail: 'https://assets.materialup.com/uploads/4d01b156-e3c4-4d02-b354-0a3d570a1c8e/preview.jpg',
    data: {
      // This would be the canvas JSON data
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '2',
    name: 'Mobile App UI Kit',
    description: 'Complete UI kit for mobile apps with navigation, cards, and form elements.',
    category: 'Mobile',
    thumbnail: 'https://assets.materialup.com/uploads/a9398a6e-5a89-4f17-b8b3-d8d8a31526be/preview.png',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '3',
    name: 'Dashboard',
    description: 'Analytics dashboard with charts, tables, and navigation components.',
    category: 'Web',
    thumbnail: 'https://assets.materialup.com/uploads/c3e46b8d-7da8-4a60-8c77-2b941d4f1bbe/preview.jpg',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '4',
    name: 'E-commerce Product Page',
    description: 'Product detail page with image gallery, description, and purchase options.',
    category: 'Web',
    thumbnail: 'https://assets.materialup.com/uploads/cf2b8efd-3a0f-4c2b-9f5c-0782f9bbd92c/preview.png',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '5',
    name: 'Social Media App',
    description: 'Social media app template with feed, profile, and messaging screens.',
    category: 'Mobile',
    thumbnail: 'https://assets.materialup.com/uploads/1a4a8da9-3af8-4987-9d6c-d7d8a3073b6c/preview.jpg',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '6',
    name: 'Blog Layout',
    description: 'Clean blog layout with featured posts, categories, and article previews.',
    category: 'Web',
    thumbnail: 'https://assets.materialup.com/uploads/3c1a0207-f2d9-4d33-9eda-f2d92d2f9888/preview.jpg',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '7',
    name: 'Wireframe Kit',
    description: 'Low-fidelity wireframe components for rapid prototyping.',
    category: 'UI Kit',
    thumbnail: 'https://assets.materialup.com/uploads/8e6ded42-0527-4f2e-b49a-311457a7c8d5/preview.png',
    data: {
      objects: [],
      background: '#ffffff'
    }
  },
  {
    id: '8',
    name: 'Presentation Deck',
    description: 'Professional presentation slides with various layouts and elements.',
    category: 'Presentation',
    thumbnail: 'https://assets.materialup.com/uploads/5daac97e-c7a8-4e9f-9d64-f1c1047e8e67/preview.jpg',
    data: {
      objects: [],
      background: '#ffffff'
    }
  }
];

// Categories for filtering
const categories = ['All', 'Web', 'Mobile', 'UI Kit', 'Presentation'];

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates);
  
  // Filter templates based on search term and category
  useEffect(() => {
    let result = mockTemplates;
    
    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(template => template.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        template => 
          template.name.toLowerCase().includes(term) || 
          template.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTemplates(result);
  }, [searchTerm, activeCategory]);
  
  // Handle using a template
  const handleUseTemplate = (template: Template) => {
    // In a real app, we would create a new project with the template data
    // For now, we'll just navigate to the editor with the template ID
    navigate(`/editor/template-${template.id}`);
  };
  
  return (
    <TemplatesContainer>
      <Header>
        <Title>Templates Gallery</Title>
        <SearchBar>
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#999"/>
            </svg>
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search templates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>
      
      <FilterContainer>
        {categories.map(category => (
          <FilterButton 
            key={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </FilterButton>
        ))}
      </FilterContainer>
      
      <TemplatesGrid>
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id}>
            <TemplateImage bgImage={template.thumbnail} />
            <TemplateInfo>
              <TemplateName>{template.name}</TemplateName>
              <TemplateDescription>{template.description}</TemplateDescription>
              <TemplateFooter>
                <TemplateCategory>{template.category}</TemplateCategory>
                <TemplateButton onClick={() => handleUseTemplate(template)}>
                  Use Template
                </TemplateButton>
              </TemplateFooter>
            </TemplateInfo>
          </TemplateCard>
        ))}
      </TemplatesGrid>
    </TemplatesContainer>
  );
};

export default Templates;
