import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  width: 240px;
  border-right: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
`;

const LayersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const LayerItem = styled.div<{ selected?: boolean }>`
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#e6f7ff' : 'transparent'};
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.selected ? '#e6f7ff' : '#f5f5f5'};
  }
`;

const LayerIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LayerName = styled.div`
  flex: 1;
`;

const VisibilityToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
  }
`;

interface Layer {
  id: string;
  name: string;
  type: 'rectangle' | 'ellipse' | 'text';
  visible: boolean;
}

const LayerPanel: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Rectangle 1', type: 'rectangle', visible: true },
    { id: '2', name: 'Ellipse 1', type: 'ellipse', visible: true },
    { id: '3', name: 'Text 1', type: 'text', visible: true },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('1');

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible } 
        : layer
    ));
  };

  return (
    <PanelContainer>
      <PanelHeader>Layers</PanelHeader>
      <LayersList>
        {layers.map(layer => (
          <LayerItem 
            key={layer.id} 
            selected={layer.id === selectedLayerId}
            onClick={() => setSelectedLayerId(layer.id)}
          >
            <LayerIcon>
              {layer.type === 'rectangle' && '□'}
              {layer.type === 'ellipse' && '○'}
              {layer.type === 'text' && 'T'}
            </LayerIcon>
            <LayerName>{layer.name}</LayerName>
            <VisibilityToggle 
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
            >
              {layer.visible ? '👁️' : '👁️‍🗨️'}
            </VisibilityToggle>
          </LayerItem>
        ))}
      </LayersList>
    </PanelContainer>
  );
};

export default LayerPanel;