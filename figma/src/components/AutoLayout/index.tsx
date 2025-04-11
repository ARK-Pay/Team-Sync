import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const AutoLayoutContainer = styled.div`
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
`;

const ControlGroup = styled.div`
  margin-bottom: 16px;
`;

const ControlLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Select = styled.select`
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Button = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
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

const DirectionToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const DirectionButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 6px 12px;
  background-color: ${props => props.active ? '#e3f2fd' : 'white'};
  border: none;
  color: ${props => props.active ? '#2196F3' : '#666'};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const PaddingInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const PaddingInput = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaddingLabel = styled.label`
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 16px 0;
`;

interface AutoLayoutProps {
  canvas: fabric.Canvas | null;
  selectedObjects: fabric.Object[];
  onApplyAutoLayout: (layoutConfig: AutoLayoutConfig) => void;
}

export interface AutoLayoutConfig {
  direction: 'horizontal' | 'vertical';
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
  alignment: 'start' | 'center' | 'end' | 'space-between';
  distribution: 'start' | 'center' | 'end' | 'space-between';
  resizing: 'hug' | 'fill';
  responsive: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  breakpoints?: BreakpointConfig[];
}

interface BreakpointConfig {
  width: number;
  columns: number;
  gap: number;
}

const AutoLayout: React.FC<AutoLayoutProps> = ({
  canvas,
  selectedObjects,
  onApplyAutoLayout
}) => {
  const [layoutConfig, setLayoutConfig] = useState<AutoLayoutConfig>({
    direction: 'horizontal',
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    gap: 8,
    alignment: 'start',
    distribution: 'start',
    resizing: 'hug',
    responsive: false
  });
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [breakpoints, setBreakpoints] = useState<BreakpointConfig[]>([
    { width: 768, columns: 2, gap: 16 },
    { width: 480, columns: 1, gap: 8 }
  ]);
  
  // Check if we can apply auto layout
  const canApplyAutoLayout = selectedObjects.length > 1;
  
  // Update a specific property in the layout config
  const updateLayoutConfig = (property: keyof AutoLayoutConfig, value: any) => {
    setLayoutConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  // Apply auto layout to the selected objects
  const applyAutoLayout = () => {
    if (!canvas || selectedObjects.length < 2) return;
    
    // Create a group to hold the objects with responsive behavior
    const group = new fabric.Group(selectedObjects, {
      // @ts-ignore - Adding custom properties to the fabric object
      autoLayout: layoutConfig,
      // @ts-ignore - Adding custom properties for the responsive behavior
      isResponsive: layoutConfig.responsive
    });
    
    // Apply initial layout based on configuration
    applyLayoutToGroup(group);
    
    // Add event listeners for responsive behavior
    if (layoutConfig.responsive) {
      // Set up listeners for resize
      group.on('scaling', handleGroupResizing as fabric.AnyEventCallback);
      
      // Store original properties for responsive calculations
      group.set('originalWidth', group.width);
      group.set('originalHeight', group.height);
      group.set('originalObjects', selectedObjects.map(obj => obj.toObject()));
    }
    
    // Remove the original objects
    selectedObjects.forEach(obj => {
      canvas.remove(obj);
    });
    
    // Add the group to the canvas
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    
    // Notify parent component
    onApplyAutoLayout(layoutConfig);
  };
  
  // Handle resizing of auto layout groups
  const handleGroupResizing = (e: fabric.TEvent<MouseEvent>) => {
    const group = e.target as fabric.Group;
    if (!group || !group.isResponsive) return;
    
    const autoLayout = group.autoLayout as AutoLayoutConfig;
    if (!autoLayout) return;
    
    // Recalculate layout based on new size
    const newWidth = group.width! * group.scaleX!;
    const newHeight = group.height! * group.scaleY!;
    
    // Check which breakpoint to apply
    let activeBreakpoint = null;
    if (autoLayout.breakpoints) {
      for (const bp of autoLayout.breakpoints) {
        if (newWidth <= bp.width) {
          activeBreakpoint = bp;
          break;
        }
      }
    }
    
    // Apply breakpoint-specific layout if available
    if (activeBreakpoint) {
      const { columns, gap } = activeBreakpoint;
      
      // Adjust objects based on breakpoint
      const childObjects = group._objects || [];
      const originalObjects = group.originalObjects || [];
      
      // Reset scale to 1
      group.set({
        scaleX: 1,
        scaleY: 1,
        width: newWidth,
        height: newHeight
      });
      
      // Rearrange child objects based on columns
      if (columns === 1) {
        // Stack vertically
        let yOffset = autoLayout.paddingTop;
        childObjects.forEach((obj, index) => {
          obj.set({
            left: autoLayout.paddingLeft,
            top: yOffset,
            scaleX: 1,
            scaleY: 1
          });
          yOffset += obj.height! + gap;
        });
      } else {
        // Arrange in columns
        const columnWidth = (newWidth - autoLayout.paddingLeft - autoLayout.paddingRight - (gap * (columns - 1))) / columns;
        childObjects.forEach((obj, index) => {
          const colIndex = index % columns;
          const rowIndex = Math.floor(index / columns);
          obj.set({
            left: autoLayout.paddingLeft + (colIndex * (columnWidth + gap)),
            top: autoLayout.paddingTop + (rowIndex * (obj.height! + gap)),
            scaleX: 1,
            scaleY: 1,
            width: columnWidth
          });
        });
      }
    } else {
      // Apply default layout
      applyLayoutToGroup(group);
    }
    
    if (canvas) {
      canvas.renderAll();
    }
  };
  
  // Apply layout to an existing group based on config
  const applyLayoutToGroup = (group: fabric.Group) => {
    if (!group) return;
    
    const childObjects = group._objects || [];
    if (childObjects.length === 0) return;
    
    const autoLayout = group.autoLayout as AutoLayoutConfig;
    if (!autoLayout) return;
    
    const { direction, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, alignment, distribution } = autoLayout;
    
    // Get total available space
    const containerWidth = group.width!;
    const containerHeight = group.height!;
    
    // Calculate usable dimensions
    const usableWidth = containerWidth - paddingLeft - paddingRight;
    const usableHeight = containerHeight - paddingTop - paddingBottom;
    
    // Position objects based on direction
    if (direction === 'horizontal') {
      // Horizontal layout
      let xOffset = paddingLeft;
      
      // Calculate total content width for distribution
      const totalObjectWidth = childObjects.reduce((total, obj) => total + obj.width! * obj.scaleX!, 0);
      const totalGapWidth = gap * (childObjects.length - 1);
      const remainingSpace = usableWidth - totalObjectWidth - totalGapWidth;
      
      // Apply distribution
      let spacing = gap;
      if (distribution === 'space-between' && childObjects.length > 1) {
        spacing = gap + (remainingSpace / (childObjects.length - 1));
      }
      
      // Handle non-space-between alignment
      if (distribution !== 'space-between') {
        // Adjust starting position based on alignment
        if (alignment === 'center') {
          xOffset += remainingSpace / 2;
        } else if (alignment === 'end') {
          xOffset += remainingSpace;
        }
      }
      
      // Position each object
      childObjects.forEach((obj) => {
        const objectWidth = obj.width! * obj.scaleX!;
        const objectHeight = obj.height! * obj.scaleY!;
        
        // Set horizontal position
        obj.set({ left: xOffset });
        
        // Set vertical position based on alignment
        if (alignment === 'center') {
          obj.set({ top: paddingTop + (usableHeight - objectHeight) / 2 });
        } else if (alignment === 'end') {
          obj.set({ top: paddingTop + usableHeight - objectHeight });
        } else {
          obj.set({ top: paddingTop });
        }
        
        // Move to next position
        xOffset += objectWidth + spacing;
      });
    } else {
      // Vertical layout
      let yOffset = paddingTop;
      
      // Calculate total content height for distribution
      const totalObjectHeight = childObjects.reduce((total, obj) => total + obj.height! * obj.scaleY!, 0);
      const totalGapHeight = gap * (childObjects.length - 1);
      const remainingSpace = usableHeight - totalObjectHeight - totalGapHeight;
      
      // Apply distribution
      let spacing = gap;
      if (distribution === 'space-between' && childObjects.length > 1) {
        spacing = gap + (remainingSpace / (childObjects.length - 1));
      }
      
      // Handle non-space-between alignment
      if (distribution !== 'space-between') {
        // Adjust starting position based on alignment
        if (alignment === 'center') {
          yOffset += remainingSpace / 2;
        } else if (alignment === 'end') {
          yOffset += remainingSpace;
        }
      }
      
      // Position each object
      childObjects.forEach((obj) => {
        const objectWidth = obj.width! * obj.scaleX!;
        const objectHeight = obj.height! * obj.scaleY!;
        
        // Set vertical position
        obj.set({ top: yOffset });
        
        // Set horizontal position based on alignment
        if (alignment === 'center') {
          obj.set({ left: paddingLeft + (usableWidth - objectWidth) / 2 });
        } else if (alignment === 'end') {
          obj.set({ left: paddingLeft + usableWidth - objectWidth });
        } else {
          obj.set({ left: paddingLeft });
        }
        
        // Move to next position
        yOffset += objectHeight + spacing;
      });
    }
    
    // If resizing is set to fill, adjust object sizes
    if (autoLayout.resizing === 'fill') {
      childObjects.forEach((obj) => {
        if (direction === 'horizontal') {
          // In horizontal layout, objects expand vertically
          obj.set({ 
            height: usableHeight / obj.scaleY!,
            scaleY: 1
          });
        } else {
          // In vertical layout, objects expand horizontally
          obj.set({ 
            width: usableWidth / obj.scaleX!,
            scaleX: 1
          });
        }
      });
    }
    
    // Update group dimensions
    group.setCoords();
  };
  
  // Handle adding a new object to an auto layout group
  const handleAddObjectToGroup = () => {
    if (!canvas || !selectedObjects || selectedObjects.length === 0) return;
    
    // Get selected auto layout group
    const selectedGroup = canvas.getActiveObject() as fabric.Group;
    if (!selectedGroup || !selectedGroup.autoLayout) return;
    
    // Clone the object to add
    const selectedObject = selectedObjects[0]; // Get the first selected object
    const newObject = fabric.util.object.clone(selectedObject);
    
    // Add to group
    selectedGroup.addWithUpdate(newObject);
    
    // Reapply auto layout
    applyLayoutToGroup(selectedGroup);
    
    canvas.renderAll();
  };
  
  // Handle removing an object from an auto layout group
  const handleRemoveObjectFromGroup = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    // Check if we have a selection within a group
    if (activeObject.type === 'group' && canvas.getActiveObjects().length > 0) {
      const group = activeObject as fabric.Group;
      if (!group.autoLayout) return;
      
      // Get the objects to remove
      const objectsToRemove = canvas.getActiveObjects();
      
      // Remove objects from the group
      objectsToRemove.forEach(obj => {
        group.remove(obj);
      });
      
      // Reapply auto layout
      applyLayoutToGroup(group);
      
      canvas.renderAll();
    }
  };
  
  return (
    <AutoLayoutContainer>
      <SectionTitle>Auto Layout</SectionTitle>
      
      <ControlGroup>
        <ControlLabel>Direction</ControlLabel>
        <DirectionToggle>
          <DirectionButton 
            active={layoutConfig.direction === 'horizontal'}
            onClick={() => updateLayoutConfig('direction', 'horizontal')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M8 16H4V8h4V3l8 9-8 9v-5z" />
            </svg>
            Horizontal
          </DirectionButton>
          <DirectionButton 
            active={layoutConfig.direction === 'vertical'}
            onClick={() => updateLayoutConfig('direction', 'vertical')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M16 8V4H8v4H3l9 8 9-8h-5z" />
            </svg>
            Vertical
          </DirectionButton>
        </DirectionToggle>
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>Padding</ControlLabel>
        <PaddingInputs>
          <PaddingInput>
            <PaddingLabel>Top</PaddingLabel>
            <Input 
              type="number" 
              value={layoutConfig.paddingTop}
              onChange={(e) => updateLayoutConfig('paddingTop', parseInt(e.target.value) || 0)}
            />
          </PaddingInput>
          <PaddingInput>
            <PaddingLabel>Right</PaddingLabel>
            <Input 
              type="number" 
              value={layoutConfig.paddingRight}
              onChange={(e) => updateLayoutConfig('paddingRight', parseInt(e.target.value) || 0)}
            />
          </PaddingInput>
          <PaddingInput>
            <PaddingLabel>Bottom</PaddingLabel>
            <Input 
              type="number" 
              value={layoutConfig.paddingBottom}
              onChange={(e) => updateLayoutConfig('paddingBottom', parseInt(e.target.value) || 0)}
            />
          </PaddingInput>
          <PaddingInput>
            <PaddingLabel>Left</PaddingLabel>
            <Input 
              type="number" 
              value={layoutConfig.paddingLeft}
              onChange={(e) => updateLayoutConfig('paddingLeft', parseInt(e.target.value) || 0)}
            />
          </PaddingInput>
        </PaddingInputs>
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>Gap Between Items</ControlLabel>
        <Input 
          type="number" 
          value={layoutConfig.gap}
          onChange={(e) => updateLayoutConfig('gap', parseInt(e.target.value) || 0)}
        />
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>Alignment</ControlLabel>
        <Select
          value={layoutConfig.alignment}
          onChange={(e) => updateLayoutConfig('alignment', e.target.value)}
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
          <option value="space-between">Space Between</option>
        </Select>
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>Item Sizing</ControlLabel>
        <Select
          value={layoutConfig.resizing}
          onChange={(e) => updateLayoutConfig('resizing', e.target.value)}
        >
          <option value="hug">Hug Contents</option>
          <option value="fill">Fill Container</option>
        </Select>
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>
          <input 
            type="checkbox" 
            checked={layoutConfig.responsive}
            onChange={(e) => updateLayoutConfig('responsive', e.target.checked)}
          />
          Responsive Layout
        </ControlLabel>
      </ControlGroup>
      
      {layoutConfig.responsive && (
        <>
          <ControlGroup>
            <ControlLabel style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Advanced Options</span>
              <span 
                style={{ cursor: 'pointer', color: '#2196F3' }}
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? 'Hide' : 'Show'}
              </span>
            </ControlLabel>
          </ControlGroup>
          
          {showAdvancedOptions && (
            <>
              <ControlGroup>
                <ControlLabel>Breakpoints</ControlLabel>
                
                {breakpoints.map((bp, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '11px' }}>Width</label>
                      <Input 
                        type="number" 
                        value={bp.width}
                        onChange={(e) => {
                          const newBreakpoints = [...breakpoints];
                          newBreakpoints[index].width = parseInt(e.target.value) || 0;
                          setBreakpoints(newBreakpoints);
                          updateLayoutConfig('breakpoints', newBreakpoints);
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Cols</label>
                      <Input 
                        type="number" 
                        value={bp.columns}
                        onChange={(e) => {
                          const newBreakpoints = [...breakpoints];
                          newBreakpoints[index].columns = parseInt(e.target.value) || 1;
                          setBreakpoints(newBreakpoints);
                          updateLayoutConfig('breakpoints', newBreakpoints);
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Gap</label>
                      <Input 
                        type="number" 
                        value={bp.gap}
                        onChange={(e) => {
                          const newBreakpoints = [...breakpoints];
                          newBreakpoints[index].gap = parseInt(e.target.value) || 0;
                          setBreakpoints(newBreakpoints);
                          updateLayoutConfig('breakpoints', newBreakpoints);
                        }}
                      />
                    </div>
                    <button
                      style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#F44336',
                        cursor: 'pointer',
                        marginTop: '14px'
                      }}
                      onClick={() => {
                        const newBreakpoints = breakpoints.filter((_, i) => i !== index);
                        setBreakpoints(newBreakpoints);
                        updateLayoutConfig('breakpoints', newBreakpoints);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {breakpoints.length < 5 && (
                  <button
                    style={{ 
                      background: 'none',
                      border: '1px dashed #ccc',
                      padding: '6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    onClick={() => {
                      const newBreakpoint = { width: 320, columns: 1, gap: 8 };
                      const newBreakpoints = [...breakpoints, newBreakpoint];
                      setBreakpoints(newBreakpoints);
                      updateLayoutConfig('breakpoints', newBreakpoints);
                    }}
                  >
                    Add Breakpoint
                  </button>
                )}
              </ControlGroup>
              
              <ControlGroup>
                <ControlLabel>Size Constraints</ControlLabel>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px' }}>Min Width</label>
                    <Input 
                      type="number" 
                      value={layoutConfig.minWidth || ''}
                      onChange={(e) => updateLayoutConfig('minWidth', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px' }}>Max Width</label>
                    <Input 
                      type="number" 
                      value={layoutConfig.maxWidth || ''}
                      onChange={(e) => updateLayoutConfig('maxWidth', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px' }}>Min Height</label>
                    <Input 
                      type="number" 
                      value={layoutConfig.minHeight || ''}
                      onChange={(e) => updateLayoutConfig('minHeight', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px' }}>Max Height</label>
                    <Input 
                      type="number" 
                      value={layoutConfig.maxHeight || ''}
                      onChange={(e) => updateLayoutConfig('maxHeight', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
              </ControlGroup>
            </>
          )}
        </>
      )}
      
      <Divider />
      
      <Button 
        onClick={applyAutoLayout}
        disabled={!canApplyAutoLayout}
      >
        Apply Auto Layout
      </Button>
      
      {selectedObjects && selectedObjects.length > 0 && selectedObjects[0].type === 'group' && (selectedObjects[0] as fabric.Group).autoLayout && (
        <>
          <Divider />
          <ControlGroup>
            <ControlLabel>Manage Group</ControlLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                style={{ flex: 1 }}
                onClick={handleAddObjectToGroup}
                disabled={!selectedObjects || selectedObjects.length === 0}
              >
                Add Object
              </Button>
              <Button 
                style={{ flex: 1 }}
                onClick={handleRemoveObjectFromGroup}
                disabled={!selectedObjects || selectedObjects.length === 0}
              >
                Remove Object
              </Button>
            </div>
          </ControlGroup>
        </>
      )}
    </AutoLayoutContainer>
  );
};

export default AutoLayout;
