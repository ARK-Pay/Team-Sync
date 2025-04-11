import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiX, FiCheck, FiChevronDown, FiChevronRight, FiEye, FiEyeOff } from 'react-icons/fi';

// Styled components for the Component Variant Editor
const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--neutral-200);
  width: 300px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const EditorTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-900);
  margin: 0;
`;

const CloseButton = styled.button`
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
    width: 16px;
    height: 16px;
  }
`;

const EditorContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--neutral-700);
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-300);
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-400);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-300);
  font-size: 13px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-400);
  }
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-800);
  margin: 24px 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const VariantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VariantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
  background-color: white;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-300);
    background-color: var(--neutral-50);
  }
`;

const VariantPreview = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--neutral-100);
  border-radius: var(--radius-sm);
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-500);
  font-size: 10px;
`;

const VariantName = styled.div`
  font-size: 13px;
  color: var(--neutral-800);
  flex: 1;
`;

const VariantActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
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

const AddVariantButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--neutral-300);
  background-color: var(--neutral-50);
  color: var(--neutral-700);
  font-size: 13px;
  width: 100%;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-400);
    background-color: var(--neutral-100);
    color: var(--primary-600);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PropertySection = styled.div`
  margin-top: 16px;
`;

const PropertyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PropertyItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-200);
  background-color: white;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-300);
    background-color: var(--neutral-50);
  }
`;

const PropertyName = styled.div`
  font-size: 13px;
  color: var(--neutral-800);
  flex: 1;
`;

const PropertyType = styled.div`
  font-size: 12px;
  color: var(--neutral-500);
  padding: 2px 6px;
  background-color: var(--neutral-100);
  border-radius: var(--radius-sm);
  margin-right: 8px;
`;

const AddPropertyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--neutral-300);
  background-color: var(--neutral-50);
  color: var(--neutral-700);
  font-size: 13px;
  width: 100%;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-400);
    background-color: var(--neutral-100);
    color: var(--primary-600);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--neutral-200);
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background-color: ${props => props.primary ? 'var(--primary-500)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--neutral-700)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--neutral-300)'};
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-600)' : 'var(--neutral-100)'};
    color: ${props => props.primary ? 'white' : 'var(--neutral-900)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Types for component variants
interface Variant {
  id: string;
  name: string;
  visible: boolean;
}

interface Property {
  id: string;
  name: string;
  type: 'boolean' | 'string' | 'number' | 'color';
}

interface ComponentVariantEditorProps {
  componentId?: string;
  onClose: () => void;
  onSave: (componentData: any) => void;
}

const ComponentVariantEditor: React.FC<ComponentVariantEditorProps> = ({
  componentId,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(componentId ? 'Button' : '');
  const [description, setDescription] = useState(componentId ? 'Primary action button' : '');
  const [variants, setVariants] = useState<Variant[]>(componentId ? [
    { id: '1', name: 'Primary', visible: true },
    { id: '2', name: 'Secondary', visible: true },
    { id: '3', name: 'Tertiary', visible: true },
    { id: '4', name: 'Disabled', visible: true }
  ] : []);
  const [properties, setProperties] = useState<Property[]>(componentId ? [
    { id: '1', name: 'Size', type: 'string' },
    { id: '2', name: 'Disabled', type: 'boolean' },
    { id: '3', name: 'Icon', type: 'boolean' }
  ] : []);
  
  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: `Variant ${variants.length + 1}`,
      visible: true
    };
    setVariants([...variants, newVariant]);
  };
  
  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(variant => variant.id !== id));
  };
  
  const handleToggleVariantVisibility = (id: string) => {
    setVariants(variants.map(variant => 
      variant.id === id ? { ...variant, visible: !variant.visible } : variant
    ));
  };
  
  const handleAddProperty = () => {
    const newProperty: Property = {
      id: Date.now().toString(),
      name: `Property ${properties.length + 1}`,
      type: 'string'
    };
    setProperties([...properties, newProperty]);
  };
  
  const handleRemoveProperty = (id: string) => {
    setProperties(properties.filter(property => property.id !== id));
  };
  
  const handleSave = () => {
    const componentData = {
      id: componentId || Date.now().toString(),
      name,
      description,
      variants,
      properties
    };
    onSave(componentData);
  };
  
  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>{componentId ? 'Edit Component' : 'New Component'}</EditorTitle>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
      </EditorHeader>
      
      <EditorContent>
        <FormGroup>
          <Label htmlFor="component-name">Component Name</Label>
          <Input 
            id="component-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Button, Card, Input"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="component-description">Description</Label>
          <TextArea 
            id="component-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose and usage of this component"
          />
        </FormGroup>
        
        <SectionTitle>
          Variants
          <span>{variants.length}</span>
        </SectionTitle>
        
        <VariantsList>
          {variants.map(variant => (
            <VariantItem key={variant.id}>
              <VariantPreview>{variant.name.charAt(0)}</VariantPreview>
              <VariantName>{variant.name}</VariantName>
              <VariantActions>
                <ActionButton 
                  onClick={() => handleToggleVariantVisibility(variant.id)}
                  title={variant.visible ? 'Hide Variant' : 'Show Variant'}
                >
                  {variant.visible ? <FiEye /> : <FiEyeOff />}
                </ActionButton>
                <ActionButton 
                  onClick={() => handleRemoveVariant(variant.id)}
                  title="Delete Variant"
                >
                  <FiTrash2 />
                </ActionButton>
              </VariantActions>
            </VariantItem>
          ))}
        </VariantsList>
        
        <AddVariantButton onClick={handleAddVariant}>
          <FiPlus />
          Add Variant
        </AddVariantButton>
        
        <PropertySection>
          <SectionTitle>
            Properties
            <span>{properties.length}</span>
          </SectionTitle>
          
          <PropertyList>
            {properties.map(property => (
              <PropertyItem key={property.id}>
                <PropertyName>{property.name}</PropertyName>
                <PropertyType>{property.type}</PropertyType>
                <ActionButton 
                  onClick={() => handleRemoveProperty(property.id)}
                  title="Delete Property"
                >
                  <FiTrash2 />
                </ActionButton>
              </PropertyItem>
            ))}
          </PropertyList>
          
          <AddPropertyButton onClick={handleAddProperty} style={{ marginTop: '8px' }}>
            <FiPlus />
            Add Property
          </AddPropertyButton>
        </PropertySection>
      </EditorContent>
      
      <EditorFooter>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button primary onClick={handleSave}>
          <FiCheck />
          {componentId ? 'Save Changes' : 'Create Component'}
        </Button>
      </EditorFooter>
    </EditorContainer>
  );
};

export default ComponentVariantEditor;
