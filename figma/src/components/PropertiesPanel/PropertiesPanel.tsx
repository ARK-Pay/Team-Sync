import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  width: 240px;
  border-left: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
`;

const PropertiesSection = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const PropertyGroup = styled.div`
  margin-bottom: 15px;
`;

const PropertyLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const PropertyRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
`;

const PropertyInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ColorInput = styled.input`
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const PropertiesPanel: React.FC = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 200, height: 150 });
  const [fill, setFill] = useState('#0d99ff');
  const [borderRadius, setBorderRadius] = useState(10);

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    setPosition({ ...position, [axis]: numValue });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    setSize({ ...size, [dimension]: numValue });
  };

  return (
    <PanelContainer>
      <PanelHeader>Properties</PanelHeader>
      
      <PropertiesSection>
        <PropertyGroup>
          <PropertyLabel>Position</PropertyLabel>
          <PropertyRow>
            <PropertyInput 
              type="number" 
              placeholder="X" 
              value={position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
            />
            <PropertyInput 
              type="number" 
              placeholder="Y" 
              value={position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
            />
          </PropertyRow>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Size</PropertyLabel>
          <PropertyRow>
            <PropertyInput 
              type="number" 
              placeholder="W" 
              value={size.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
            />
            <PropertyInput 
              type="number" 
              placeholder="H" 
              value={size.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
            />
          </PropertyRow>
        </PropertyGroup>
      </PropertiesSection>
      
      <PropertiesSection>
        <PropertyGroup>
          <PropertyLabel>Fill</PropertyLabel>
          <PropertyRow>
            <ColorInput 
              type="color" 
              value={fill}
              onChange={(e) => setFill(e.target.value)}
            />
            <PropertyInput 
              type="text" 
              value={fill}
              onChange={(e) => setFill(e.target.value)}
            />
          </PropertyRow>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Border Radius</PropertyLabel>
          <PropertyRow>
            <PropertyInput 
              type="number" 
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)}
            />
          </PropertyRow>
        </PropertyGroup>
      </PropertiesSection>
    </PanelContainer>
  );
};

export default PropertiesPanel;