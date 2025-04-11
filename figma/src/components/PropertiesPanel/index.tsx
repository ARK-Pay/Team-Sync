import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const PropertiesPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const PropertiesContent = styled.div`
  padding: 16px;
  overflow-y: auto;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

const PropertyGroupTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const PropertyLabel = styled.label`
  font-size: 13px;
  color: #333;
  width: 80px;
  flex-shrink: 0;
`;

const PropertyInput = styled.input`
  width: 100%;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 13px;
  color: #333;

  &:focus {
    outline: none;
    border-color: #0066ff;
  }
`;

const ColorInput = styled.input`
  width: 28px;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
`;

const NoSelectionMessage = styled.div`
  padding: 16px;
  color: #666;
  font-size: 13px;
  text-align: center;
`;

interface PropertiesPanelProps {
  selectedObject: fabric.Object | null;
  canvas: fabric.Canvas | null;
  onUpdateProperties?: (properties: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedObject, 
  canvas,
  onUpdateProperties 
}) => {
  const [properties, setProperties] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    fill: '#000000',
    angle: 0,
    opacity: 1,
    text: '',
    fontSize: 20,
    fontFamily: 'Arial',
  });

  // Update properties when selected object changes
  useEffect(() => {
    if (!selectedObject) return;

    const newProperties: any = {
      left: Math.round(selectedObject.left || 0),
      top: Math.round(selectedObject.top || 0),
      angle: Math.round(selectedObject.angle || 0),
      opacity: selectedObject.opacity || 1,
      fill: selectedObject.fill as string || '#000000',
    };

    // Add width and height for shapes
    if (selectedObject.width && selectedObject.height) {
      newProperties.width = Math.round(selectedObject.width);
      newProperties.height = Math.round(selectedObject.height);
    }

    // Add radius for circles
    if (selectedObject.type === 'circle' && 'radius' in selectedObject) {
      const circle = selectedObject as fabric.Circle;
      newProperties.width = Math.round(circle.radius! * 2);
      newProperties.height = Math.round(circle.radius! * 2);
    }

    // Add text properties for text objects
    if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
      const textObject = selectedObject as fabric.Textbox;
      newProperties.text = textObject.text || '';
      newProperties.fontSize = textObject.fontSize || 20;
      newProperties.fontFamily = textObject.fontFamily || 'Arial';
    }

    setProperties(newProperties);
  }, [selectedObject]);

  // Handle property change
  const handlePropertyChange = (property: string, value: any) => {
    const updatedProperties = { ...properties, [property]: value };
    setProperties(updatedProperties);

    // Prepare properties to update
    const propsToUpdate: any = { [property]: value };

    // Special handling for width/height of circles
    if (selectedObject?.type === 'circle' && (property === 'width' || property === 'height')) {
      const newRadius = Math.round(parseInt(value) / 2);
      propsToUpdate.radius = newRadius;
    }

    if (onUpdateProperties) {
      onUpdateProperties(propsToUpdate);
    }
  };

  if (!selectedObject) {
    return (
      <PropertiesPanelContainer>
        <PanelHeader>Properties</PanelHeader>
        <NoSelectionMessage>
          Select an object to edit its properties
        </NoSelectionMessage>
      </PropertiesPanelContainer>
    );
  }

  return (
    <PropertiesPanelContainer>
      <PanelHeader>Properties</PanelHeader>
      <PropertiesContent>
        <PropertyGroup>
          <PropertyGroupTitle>Position & Size</PropertyGroupTitle>
          <PropertyRow>
            <PropertyLabel>X</PropertyLabel>
            <PropertyInput
              type="number"
              value={properties.left}
              onChange={(e) => handlePropertyChange('left', parseInt(e.target.value))}
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Y</PropertyLabel>
            <PropertyInput
              type="number"
              value={properties.top}
              onChange={(e) => handlePropertyChange('top', parseInt(e.target.value))}
            />
          </PropertyRow>
          
          {(selectedObject.type !== 'i-text' && selectedObject.width !== undefined) && (
            <PropertyRow>
              <PropertyLabel>Width</PropertyLabel>
              <PropertyInput
                type="number"
                value={properties.width}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
              />
            </PropertyRow>
          )}
          
          {(selectedObject.type !== 'i-text' && selectedObject.height !== undefined) && (
            <PropertyRow>
              <PropertyLabel>Height</PropertyLabel>
              <PropertyInput
                type="number"
                value={properties.height}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
              />
            </PropertyRow>
          )}
          
          <PropertyRow>
            <PropertyLabel>Rotation</PropertyLabel>
            <PropertyInput
              type="number"
              value={properties.angle}
              onChange={(e) => handlePropertyChange('angle', parseInt(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyGroupTitle>Appearance</PropertyGroupTitle>
          <PropertyRow>
            <PropertyLabel>Color</PropertyLabel>
            <ColorInput
              type="color"
              value={properties.fill}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Opacity</PropertyLabel>
            <PropertyInput
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={properties.opacity}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        {(selectedObject.type === 'textbox' || selectedObject.type === 'i-text') && (
          <PropertyGroup>
            <PropertyGroupTitle>Text</PropertyGroupTitle>
            <PropertyRow>
              <PropertyLabel>Content</PropertyLabel>
              <PropertyInput
                type="text"
                value={properties.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Font Size</PropertyLabel>
              <PropertyInput
                type="number"
                value={properties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Font</PropertyLabel>
              <PropertyInput
                as="select"
                value={properties.fontFamily}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
              </PropertyInput>
            </PropertyRow>
          </PropertyGroup>
        )}
      </PropertiesContent>
    </PropertiesPanelContainer>
  );
};

export default PropertiesPanel;
