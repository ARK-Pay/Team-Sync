import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const ComponentsPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#f5f5f5' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#0066ff' : 'transparent'};
  color: ${props => props.active ? '#0066ff' : '#333'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ComponentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ComponentCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
`;

const ComponentItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ComponentPreview = styled.div`
  height: 100px;
  background-color: #f9f9f9;
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

const ComponentInfo = styled.div`
  padding: 8px 12px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
`;

const ComponentName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ComponentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ComponentButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 2px;
  
  &:hover {
    color: #2196F3;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ComponentDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: #666;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

const CreateComponentButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;

const ComponentModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 400px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #1976D2;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  margin-top: 24px;
  
  &:first-of-type {
    margin-top: 0;
  }
`;

interface Component {
  id: string;
  name: string;
  description: string;
  data: any;
  preview: string;
  category: string;
  type: 'component' | 'template';
  createdAt: Date;
  updatedAt: Date;
}

interface ComponentsPanelProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  onAddComponent: (component: Component) => void;
}

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const CreateComponentForm = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 24px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;

const ComponentsPanel: React.FC<ComponentsPanelProps> = ({
  canvas,
  selectedObject,
  onAddComponent
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'templates'>('components');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userComponents, setUserComponents] = useState<Component[]>([]);
  const [isCreatingComponent, setIsCreatingComponent] = useState<boolean>(false);
  const [newComponentName, setNewComponentName] = useState<string>('');
  const [newComponentDescription, setNewComponentDescription] = useState<string>('');

  // Load components from localStorage on mount
  useEffect(() => {
    const savedComponents = localStorage.getItem('figmaCloneComponents');
    if (savedComponents) {
      try {
        setUserComponents(JSON.parse(savedComponents));
      } catch (error) {
        console.error('Failed to parse saved components:', error);
      }
    }
  }, []);

  // Save components to localStorage when they change
  useEffect(() => {
    if (userComponents.length > 0) {
      localStorage.setItem('figmaCloneComponents', JSON.stringify(userComponents));
    }
  }, [userComponents]);

  // Built-in UI components
  const builtInComponents: Component[] = [
    {
      id: 'btn-primary',
      name: 'Primary Button',
      description: 'Standard primary action button',
      category: 'Buttons',
      type: 'component',
      preview: 'https://i.imgur.com/JR5aUaa.png',
      data: {
        type: 'rect',
        width: 120,
        height: 40,
        fill: '#0066ff',
        rx: 4,
        ry: 4,
        text: 'Button',
        textColor: '#ffffff',
        fontSize: 14
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'btn-secondary',
      name: 'Secondary Button',
      description: 'Secondary action button',
      category: 'Buttons',
      type: 'component',
      preview: 'https://i.imgur.com/8YNkIvS.png',
      data: {
        type: 'rect',
        width: 120,
        height: 40,
        fill: '#ffffff',
        stroke: '#0066ff',
        strokeWidth: 1,
        rx: 4,
        ry: 4,
        text: 'Button',
        textColor: '#0066ff',
        fontSize: 14
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'card-basic',
      name: 'Basic Card',
      description: 'Simple content card with shadow',
      category: 'Cards',
      type: 'component',
      preview: 'https://i.imgur.com/Y5TZbSN.png',
      data: {
        type: 'rect',
        width: 240,
        height: 160,
        fill: '#ffffff',
        rx: 8,
        ry: 8,
        shadow: {
          color: 'rgba(0,0,0,0.1)',
          blur: 10,
          offsetX: 0,
          offsetY: 4
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'input-text',
      name: 'Text Input',
      description: 'Standard text input field',
      category: 'Form Elements',
      type: 'component',
      preview: 'https://i.imgur.com/QJQzx0P.png',
      data: {
        type: 'rect',
        width: 240,
        height: 40,
        fill: '#ffffff',
        stroke: '#e0e0e0',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'nav-header',
      name: 'Navigation Bar',
      description: 'Standard website header with navigation',
      category: 'Navigation',
      type: 'component',
      preview: 'https://i.imgur.com/JcSREy5.png',
      data: {
        type: 'rect',
        width: 800,
        height: 64,
        fill: '#ffffff',
        shadow: {
          color: 'rgba(0,0,0,0.05)',
          blur: 4,
          offsetX: 0,
          offsetY: 2
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Website templates
  const websiteTemplates: Component[] = [
    {
      id: 'template-landing',
      name: 'Landing Page',
      description: 'Modern landing page template with hero section',
      category: 'Marketing',
      type: 'template',
      preview: 'https://i.imgur.com/Jf5QD7z.png',
      data: {
        type: 'group',
        width: 1200,
        height: 800,
        objects: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'template-portfolio',
      name: 'Portfolio',
      description: 'Clean portfolio template for showcasing work',
      category: 'Portfolio',
      type: 'template',
      preview: 'https://i.imgur.com/kJY7O2P.png',
      data: {
        type: 'group',
        width: 1200,
        height: 800,
        objects: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'template-ecommerce',
      name: 'E-Commerce',
      description: 'Online store template with product grid',
      category: 'E-Commerce',
      type: 'template',
      preview: 'https://i.imgur.com/L8Tw4Yk.png',
      data: {
        type: 'group',
        width: 1200,
        height: 800,
        objects: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'template-blog',
      name: 'Blog',
      description: 'Clean blog template with featured posts',
      category: 'Blog',
      type: 'template',
      preview: 'https://i.imgur.com/JvVQmjS.png',
      data: {
        type: 'group',
        width: 1200,
        height: 800,
        objects: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'template-dashboard',
      name: 'Dashboard',
      description: 'Admin dashboard template with statistics',
      category: 'Applications',
      type: 'template',
      preview: 'https://i.imgur.com/YQd8QRC.png',
      data: {
        type: 'group',
        width: 1200,
        height: 800,
        objects: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Handle creating a new component from the selected object
  const handleCreateComponent = () => {
    if (!canvas || !selectedObject || !newComponentName) return;

    // Create a clone of the selected object
    const clone = selectedObject.clone();

    // Generate a preview image
    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d');
    const boundingRect = selectedObject.getBoundingRect();

    previewCanvas.width = boundingRect.width;
    previewCanvas.height = boundingRect.height;

    if (ctx) {
      // Draw the object on the preview canvas
      ctx.save();
      ctx.translate(-boundingRect.left, -boundingRect.top);
      selectedObject.render(ctx);
      ctx.restore();
    }

    // Create the new component
    const newComponent: Component = {
      id: `component-${Date.now()}`,
      name: newComponentName,
      description: newComponentDescription,
      category: 'My Components',
      type: 'component',
      data: selectedObject.toObject(),
      preview: previewCanvas.toDataURL(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to components list
    setUserComponents(prev => [...prev, newComponent]);

    // Reset form
    setNewComponentName('');
    setNewComponentDescription('');
    setIsCreatingComponent(false);
  };

// Handle adding a component to the canvas
const handleAddComponentToCanvas = (component: Component) => {
  if (!canvas) return;
  
  // For built-in components, we need to create the objects based on the data
  if (component.id.startsWith('btn-') || component.id.startsWith('card-') || component.id.startsWith('input-') || component.id.startsWith('nav-')) {
  // Create the appropriate fabric object based on component type
  let fabricObject: fabric.Object | undefined;

  if (component.data.type === 'rect') {
    const rect = new fabric.Rect({
      width: component.data.width,
      height: component.data.height,
      fill: component.data.fill,
      stroke: component.data.stroke,
      strokeWidth: component.data.strokeWidth,
      rx: component.data.rx,
      ry: component.data.ry,
      shadow: component.data.shadow ? new fabric.Shadow(component.data.shadow) : undefined
    });

    fabricObject = rect;

    // If there's text, add it as a text object and group them
    if (component.data.text) {
      const text = new fabric.Text(component.data.text, {
        fontSize: component.data.fontSize,
        fill: component.data.textColor,
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center'
      });

      // Group the rectangle and text
      fabricObject = new fabric.Group([rect, text], {
        left: 100,
        top: 100
      });
    }
  }

  if (fabricObject) {
    // Position the object in the center of the visible canvas
    const canvasCenter = canvas.getCenter();
    fabricObject.set({
      left: canvasCenter.left,
      top: canvasCenter.top,
      originX: 'center',
      originY: 'center'
    });

    // Add to canvas
    canvas.add(fabricObject);
    canvas.setActiveObject(fabricObject);
    canvas.renderAll();
  }
} else {
  // For user-created components and templates, use the saved JSON data
  // @ts-ignore - fabric.js typings issue with enlivenObjects
  fabric.util.enlivenObjects([component.data], function(objects: fabric.Object[]) {
    if (objects.length > 0) {
      const object = objects[0];

      // Position the object in the center of the visible canvas
      const canvasCenter = canvas.getCenter();
      object.set({
        left: canvasCenter.left,
        top: canvasCenter.top,
        originX: 'center',
        originY: 'center'
      });

      // Add to canvas
      canvas.add(object);
      canvas.setActiveObject(object);
      canvas.renderAll();
    }
  });
}

// Notify parent
onAddComponent(component);
};

// Delete a component
const handleDeleteComponent = (id: string) => {
  setUserComponents(prev => prev.filter(component => component.id !== id));
};

// Filter components based on active tab and search query
const getFilteredComponents = () => {
  const allComponents = [
    ...userComponents,
    ...(activeTab === 'components' ? builtInComponents : []),
    ...(activeTab === 'templates' ? websiteTemplates : [])
  ];
  
  if (!searchQuery) return allComponents;
  
  return allComponents.filter(component => 
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// Group components by category
const getComponentsByCategory = () => {
  const filteredComponents = getFilteredComponents();
  const categorized: Record<string, Component[]> = {};
  
  filteredComponents.forEach(component => {
    if (!categorized[component.category]) {
      categorized[component.category] = [];
    }
    categorized[component.category].push(component);
  });
  
  return categorized;
};

const componentsByCategory = getComponentsByCategory();
const categories = Object.keys(componentsByCategory);

return (
<ComponentsPanelContainer>
  <PanelHeader>
    <span>{activeTab === 'components' ? 'Components' : 'Templates'}</span>
    {activeTab === 'components' && (
      <CreateComponentButton 
        onClick={() => setIsCreatingComponent(true)}
        disabled={!selectedObject}
        title={!selectedObject ? 'Select an object to create a component' : 'Create component from selection'}
      >
        Create Component
      </CreateComponentButton>
    )}
  </PanelHeader>
  
  <PanelContent>
    {/* Tabs */}
    <TabsContainer>
      <Tab 
        active={activeTab === 'components'}
        onClick={() => setActiveTab('components')}
      >
        Components
      </Tab>
      <Tab 
        active={activeTab === 'templates'}
        onClick={() => setActiveTab('templates')}
      >
        Templates
      </Tab>
    </TabsContainer>
    
    {/* Search */}
    <SearchInput 
      type="text"
      placeholder={`Search ${activeTab}...`}
      value={searchQuery}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
    />
    
    {isCreatingComponent ? (
      <CreateComponentForm>
        <FormGroup>
          <FormLabel>Component Name</FormLabel>
          <FormInput
            type="text"
            value={newComponentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComponentName(e.target.value)}
            placeholder="Enter component name"
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Description</FormLabel>
          <FormTextarea
            value={newComponentDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComponentDescription(e.target.value)}
            placeholder="Enter component description"
          />
        </FormGroup>
        
        <FormActions>
          <CancelButton onClick={() => setIsCreatingComponent(false)}>
            Cancel
          </CancelButton>
          <SaveButton 
            onClick={handleCreateComponent}
            disabled={!newComponentName}
          >
            Save Component
          </SaveButton>
        </FormActions>
      </CreateComponentForm>
    ) : categories.length > 0 ? (
      <>
        {categories.map(category => (
          <div key={category}>
            <CategoryTitle>{category}</CategoryTitle>
            <ComponentsList>
              {componentsByCategory[category].map((component) => (
                <ComponentItem 
                  key={component.id}
                  onClick={() => handleAddComponentToCanvas(component)}
                >
                  <ComponentPreview>
                    <img src={component.preview} alt={component.name} />
                  </ComponentPreview>
                  <ComponentInfo>
                    <ComponentName>
                      {component.name}
                    </ComponentName>
                    <ComponentDescription>
                      {component.description}
                    </ComponentDescription>
                  </ComponentInfo>
                </ComponentItem>
              ))}
            </ComponentsList>
          </div>
        ))}
      </>
    ) : (
      <EmptyState>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
        </svg>
        <p>
          {searchQuery 
            ? `No ${activeTab} found matching "${searchQuery}".` 
            : activeTab === 'components' 
              ? "You haven't created any components yet." 
              : "No templates available."}
        </p>
        {activeTab === 'components' && (
          <ActionButton 
            onClick={() => setIsCreatingComponent(true)}
            disabled={!selectedObject}
          >
            Create Your First Component
          </ActionButton>
        )}
      </EmptyState>
    )}
  </PanelContent>
</ComponentsPanelContainer>
);
};

export default ComponentsPanel;
