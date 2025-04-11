import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const LayerPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
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

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  
  svg {
    width: 16px;
    height: 16px;
    fill: #555;
  }
  
  &:hover svg {
    fill: #000;
  }
`;

const LayersList = styled.div`
  overflow-y: auto;
  max-height: 300px;
`;

const LayerItem = styled.div<{ isSelected: boolean; isDragging: boolean; isDropTarget: boolean }>`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${props => 
    props.isDropTarget ? '#e8f4fd' :
    props.isSelected ? '#e1f5fe' : 
    'transparent'};
  border-left: 3px solid ${props => 
    props.isDropTarget ? '#64b5f6' :
    props.isSelected ? '#0288d1' : 
    'transparent'};
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: background-color 0.1s ease;
  user-select: none;

  &:hover {
    background-color: ${props => 
      props.isDropTarget ? '#e8f4fd' :
      props.isSelected ? '#e1f5fe' : 
      '#f5f5f5'};
  }
`;

const DragHandle = styled.div`
  margin-right: 8px;
  cursor: move;
  display: flex;
  align-items: center;
  
  svg {
    width: 12px;
    height: 12px;
    fill: #888;
  }
  
  &:hover svg {
    fill: #555;
  }
`;

const LayerIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    fill: #555;
  }
`;

const LayerName = styled.div`
  font-size: 13px;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VisibilityToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  
  svg {
    width: 16px;
    height: 16px;
    fill: #555;
  }
  
  &:hover svg {
    fill: #000;
  }
`;

const LockToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  margin-left: 4px;
  
  svg {
    width: 16px;
    height: 16px;
    fill: #555;
  }
  
  &:hover svg {
    fill: #000;
  }
`;

interface LayerPanelProps {
  layers: fabric.Object[];
  selectedObject: fabric.Object | null;
  canvas: fabric.Canvas | null;
  onSelectLayer?: (object: fabric.Object) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ 
  layers, 
  selectedObject, 
  canvas,
  onSelectLayer 
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  
  // Get layer type icon based on object type
  const getLayerIcon = (object: fabric.Object) => {
    if (object.type === 'rect') {
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" />
        </svg>
      );
    } else if (object.type === 'circle') {
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    } else if (object.type === 'triangle') {
      return (
        <svg viewBox="0 0 24 24">
          <polygon points="12,3 21,21 3,21" />
        </svg>
      );
    } else if (object.type === 'textbox' || object.type === 'i-text') {
      return (
        <svg viewBox="0 0 24 24">
          <text x="6" y="16" style={{ font: 'bold 16px sans-serif' }}>T</text>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" />
        </svg>
      );
    }
  };

  // Get layer name based on object type
  const getLayerName = (object: fabric.Object, index: number) => {
    // Check if the object has a custom name property
    const customName = (object as any).name;
    
    if (customName) {
      return customName;
    }
    
    if (object.type === 'rect') {
      return `Rectangle ${index + 1}`;
    } else if (object.type === 'circle') {
      return `Circle ${index + 1}`;
    } else if (object.type === 'triangle') {
      return `Triangle ${index + 1}`;
    } else if (object.type === 'textbox' || object.type === 'i-text') {
      const textObject = object as fabric.Textbox;
      return textObject.text?.substring(0, 15) || `Text ${index + 1}`;
    } else {
      return `Layer ${index + 1}`;
    }
  };

  // Toggle layer visibility
  const toggleVisibility = (e: React.MouseEvent, object: fabric.Object) => {
    e.stopPropagation();
    object.set('visible', !object.visible);
    object.canvas?.requestRenderAll();
  };
  
  // Toggle layer lock
  const toggleLock = (e: React.MouseEvent, object: fabric.Object) => {
    e.stopPropagation();
    object.set('selectable', !object.selectable);
    object.set('evented', !object.evented);
    object.canvas?.requestRenderAll();
  };
  
  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    dragItem.current = index;
  };
  
  // Handle drag over
  const handleDragOver = (index: number) => {
    setDropTargetIndex(index);
  };
  
  // Handle drop to reorder layers
  const handleDrop = () => {
    if (draggedIndex === null || dragItem.current === null || !canvas) return;
    
    const draggedLayer = layers[layers.length - 1 - draggedIndex];
    const targetIndex = layers.length - 1 - (dropTargetIndex !== null ? dropTargetIndex : 0);
    
    // Reorder canvas objects
    if (draggedIndex !== dropTargetIndex) {
      // Just add the object to the canvas and adjust its position
      // This is a simplified approach to avoid type errors
      canvas.remove(draggedLayer);
      canvas.add(draggedLayer);
      
      // Adjust the object's position in the stack
      const currentIndex = canvas.getObjects().indexOf(draggedLayer);
      const diff = targetIndex - currentIndex;
      
      if (diff > 0) {
        // Move forward
        for (let i = 0; i < diff; i++) {
          canvas.bringObjectForward(draggedLayer);
        }
      } else if (diff < 0) {
        // Move backward
        for (let i = 0; i < Math.abs(diff); i++) {
          canvas.sendObjectBackwards(draggedLayer);
        }
      }
      
      canvas.requestRenderAll();
    }
    
    // Reset drag state
    setDraggedIndex(null);
    setDropTargetIndex(null);
    dragItem.current = null;
  };
  
  // Group all objects in selection
  const groupSelected = () => {
    if (!canvas) return;
    
    if (canvas.getActiveObjects().length > 1) {
      const activeSelection = canvas.getActiveObject();
      if (activeSelection && activeSelection.type === 'activeSelection') {
        // Create a group from the active selection
        // @ts-ignore - fabric.js types are incomplete
        canvas.getActiveObject().toGroup();
        canvas.requestRenderAll();
      }
    }
  };
  
  // Ungroup the selected group
  const ungroupSelected = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'group') {
      // Ungroup the active group
      // @ts-ignore - fabric.js types are incomplete
      canvas.getActiveObject().toActiveSelection();
      canvas.requestRenderAll();
    }
  };

  return (
    <LayerPanelContainer>
      <PanelHeader>
        Layers
        <HeaderActions>
          <ActionButton onClick={groupSelected} title="Group selected objects">
            <svg viewBox="0 0 24 24">
              <path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,13V15H7V13H5M3,11H9V17H3V11Z" />
            </svg>
          </ActionButton>
          <ActionButton onClick={ungroupSelected} title="Ungroup selected group">
            <svg viewBox="0 0 24 24">
              <path d="M11,7H15V9H11V11H13V13H11V15H15V17H11A2,2 0 0,1 9,15V9A2,2 0 0,1 11,7M3,5H9V11H3V5M5,7V9H7V7H5M3,13H9V19H3V13M5,15V17H7V15H5Z" />
            </svg>
          </ActionButton>
        </HeaderActions>
      </PanelHeader>
      <LayersList>
        {layers.slice().reverse().map((object, index) => (
          <LayerItem 
            key={index}
            isSelected={selectedObject === object}
            isDragging={draggedIndex === index}
            isDropTarget={dropTargetIndex === index}
            onClick={() => onSelectLayer && onSelectLayer(object)}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(index);
            }}
            onDragEnd={handleDrop}
          >
            <DragHandle>
              <svg viewBox="0 0 24 24">
                <path d="M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z" />
              </svg>
            </DragHandle>
            <LayerIcon>
              {getLayerIcon(object)}
            </LayerIcon>
            <LayerName>
              {getLayerName(object, layers.length - index - 1)}
            </LayerName>
            <VisibilityToggle onClick={(e) => toggleVisibility(e, object)} title="Toggle visibility">
              <svg viewBox="0 0 24 24">
                {object.visible !== false ? (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                ) : (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                )}
              </svg>
            </VisibilityToggle>
            <LockToggle onClick={(e) => toggleLock(e, object)} title="Toggle lock">
              <svg viewBox="0 0 24 24">
                {object.selectable !== false ? (
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                ) : (
                  <path d="M20 8h-3V6.21c0-2.61-1.91-4.94-4.51-5.19C9.51.74 7 3.08 7 6v2H4v14h16V8zm-8.3-2c0-1.31.99-2.4 2.3-2.4s2.3 1.08 2.3 2.4v2h-4.6V6zm6.5 14H5.8V9.7h12.4v10.3z" />
                )}
              </svg>
            </LockToggle>
          </LayerItem>
        ))}
      </LayersList>
    </LayerPanelContainer>
  );
};

export default LayerPanel;
