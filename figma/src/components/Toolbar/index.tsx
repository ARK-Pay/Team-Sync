import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSquare, FiCircle, FiTriangle, FiType, FiMove, FiMousePointer, FiImage, FiGrid, FiLayers, FiEye, FiCopy, FiSliders, FiUsers, FiMessageSquare, FiPlay, FiDownload, FiCode, FiLayout, FiBox, FiFramer, FiPenTool, FiCrop } from 'react-icons/fi';

// Enhanced Toolbar with professional Figma-like styling
const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-right: 1px solid var(--neutral-200);
  height: 100%;
  width: 56px;
  position: relative;
  z-index: 10;
  box-shadow: var(--shadow-sm);
  overflow: hidden; /* Prevent overall container from scrolling */
`;

const ToolbarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto; /* Make content scrollable */
  scrollbar-width: thin;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--neutral-300);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--neutral-400);
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--neutral-200);
  }
`;

const ToolButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  margin: 2px 0;
  color: ${props => props.active ? 'var(--primary-500)' : 'var(--neutral-700)'};
  background-color: ${props => props.active ? 'var(--primary-50)' : 'transparent'};
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-100)' : 'var(--neutral-100)'};
    color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-900)'};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50px;
    top: 50%;
    transform: translateY(-50%);
    background-color: var(--neutral-800);
    color: white;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
    pointer-events: none;
    z-index: 100;
  }
  
  &:hover::after {
    opacity: 1;
    visibility: visible;
  }
`;

const ToggleButton = styled(ToolButton)<{ toggled?: boolean }>`
  color: ${props => props.toggled ? 'var(--primary-500)' : 'var(--neutral-700)'};
  background-color: ${props => props.toggled ? 'var(--primary-50)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.toggled ? 'var(--primary-100)' : 'var(--neutral-100)'};
    color: ${props => props.toggled ? 'var(--primary-600)' : 'var(--neutral-900)'};
  }
`;

const Divider = styled.div`
  width: 24px;
  height: 1px;
  background-color: var(--neutral-200);
  margin: 4px 0;
`;

const ToolbarFooter = styled.div`
  margin-top: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const KeyboardShortcut = styled.span`
  position: absolute;
  right: 8px;
  bottom: 3px;
  font-size: 9px;
  color: var(--neutral-500);
  background-color: var(--neutral-100);
  border-radius: 3px;
  padding: 1px 3px;
  opacity: 0.8;
`;

const ToolTip = styled.div`
  position: absolute;
  left: 58px;
  background-color: var(--neutral-800);
  color: white;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  pointer-events: none;
`;

interface ToolbarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onToggleInspect: () => void;
  onToggleRedlines: () => void;
  isInspectMode: boolean;
  showRedlines: boolean;
  onToggleMultiplayer: () => void;
  onToggleComments: () => void;
  isMultiplayerActive: boolean;
  showComments: boolean;
  onTogglePrototyping: () => void;
  onExportTemplate: () => void;
  isPrototypingActive: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onToggleInspect,
  onToggleRedlines,
  isInspectMode,
  showRedlines,
  onToggleMultiplayer,
  onToggleComments,
  isMultiplayerActive,
  showComments,
  onTogglePrototyping,
  onExportTemplate,
  isPrototypingActive
}) => {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    onToolSelect(tool);
  };

  return (
    <ToolbarContainer>
      <ToolbarContent>
        {/* Main Tools Section */}
        <ToolbarSection>
          <ToolButton 
            active={selectedTool === 'select'} 
            onClick={() => handleToolSelect('select')}
            data-tooltip="Select (V)"
            onMouseEnter={() => setHoveredTool('select')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiMousePointer />
            <KeyboardShortcut>V</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'move'} 
            onClick={() => handleToolSelect('move')}
            data-tooltip="Move Tool (H)"
            onMouseEnter={() => setHoveredTool('move')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiMove />
            <KeyboardShortcut>H</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'frame'} 
            onClick={() => handleToolSelect('frame')}
            data-tooltip="Frame Tool (F)"
            onMouseEnter={() => setHoveredTool('frame')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiFramer />
            <KeyboardShortcut>F</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'crop'} 
            onClick={() => handleToolSelect('crop')}
            data-tooltip="Crop Tool (C)"
            onMouseEnter={() => setHoveredTool('crop')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiCrop />
            <KeyboardShortcut>C</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'pen'} 
            onClick={() => handleToolSelect('pen')}
            data-tooltip="Pen Tool (P)"
            onMouseEnter={() => setHoveredTool('pen')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiPenTool />
            <KeyboardShortcut>P</KeyboardShortcut>
          </ToolButton>
        </ToolbarSection>
        
        {/* Shape Tools Section */}
        <ToolbarSection>
          <ToolButton 
            active={selectedTool === 'rectangle'} 
            onClick={() => handleToolSelect('rectangle')}
            data-tooltip="Rectangle (R)"
            onMouseEnter={() => setHoveredTool('rectangle')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiSquare />
            <KeyboardShortcut>R</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'circle'} 
            onClick={() => handleToolSelect('circle')}
            data-tooltip="Ellipse (O)"
            onMouseEnter={() => setHoveredTool('circle')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiCircle />
            <KeyboardShortcut>O</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'triangle'} 
            onClick={() => handleToolSelect('triangle')}
            data-tooltip="Triangle (Y)"
            onMouseEnter={() => setHoveredTool('triangle')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiTriangle />
            <KeyboardShortcut>Y</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'text'} 
            onClick={() => handleToolSelect('text')}
            data-tooltip="Text (T)"
            onMouseEnter={() => setHoveredTool('text')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiType />
            <KeyboardShortcut>T</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'image'} 
            onClick={() => handleToolSelect('image')}
            data-tooltip="Place Image (I)"
            onMouseEnter={() => setHoveredTool('image')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiImage />
            <KeyboardShortcut>I</KeyboardShortcut>
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'autolayout'} 
            onClick={() => handleToolSelect('autolayout')}
            data-tooltip="Auto Layout (Shift+A)"
            onMouseEnter={() => setHoveredTool('autolayout')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiLayout />
          </ToolButton>
        </ToolbarSection>
        
        {/* Advanced Tools Section */}
        <ToolbarSection>
          <ToggleButton 
            toggled={isInspectMode} 
            onClick={onToggleInspect}
            data-tooltip="Inspect Mode (Alt+I)"
            onMouseEnter={() => setHoveredTool('inspect')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiEye />
          </ToggleButton>
          <ToggleButton 
            toggled={showRedlines} 
            onClick={onToggleRedlines}
            data-tooltip="Show Redlines (Alt+R)"
            onMouseEnter={() => setHoveredTool('redlines')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiGrid />
          </ToggleButton>
          <ToolButton 
            active={selectedTool === 'layers'} 
            onClick={() => handleToolSelect('layers')}
            data-tooltip="Layers Panel (Alt+L)"
            onMouseEnter={() => setHoveredTool('layers')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiLayers />
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'components'} 
            onClick={() => handleToolSelect('components')}
            data-tooltip="Components (Alt+C)"
            onMouseEnter={() => setHoveredTool('components')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiCopy />
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'styles'} 
            onClick={() => handleToolSelect('styles')}
            data-tooltip="Design System (Alt+S)"
            onMouseEnter={() => setHoveredTool('styles')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiSliders />
          </ToolButton>
        </ToolbarSection>
        
        {/* Collaboration Section */}
        <ToolbarSection>
          <ToggleButton 
            toggled={isMultiplayerActive} 
            onClick={onToggleMultiplayer}
            data-tooltip="Multiplayer Mode (Alt+M)"
            onMouseEnter={() => setHoveredTool('multiplayer')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiUsers />
          </ToggleButton>
          <ToggleButton 
            toggled={showComments} 
            onClick={onToggleComments}
            data-tooltip="Comments (Alt+D)"
            onMouseEnter={() => setHoveredTool('comments')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiMessageSquare />
          </ToggleButton>
        </ToolbarSection>
        
        {/* Prototyping & Export Section */}
        <ToolbarFooter>
          <ToggleButton 
            toggled={isPrototypingActive} 
            onClick={onTogglePrototyping}
            data-tooltip="Prototyping (Alt+P)"
            onMouseEnter={() => setHoveredTool('prototyping')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiPlay />
          </ToggleButton>
          <Divider />
          <ToolButton 
            onClick={onExportTemplate}
            data-tooltip="Export (Ctrl+E)"
            onMouseEnter={() => setHoveredTool('export')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiDownload />
          </ToolButton>
          <ToolButton 
            active={selectedTool === 'code'}
            onClick={() => handleToolSelect('code')}
            data-tooltip="Code (Alt+X)"
            onMouseEnter={() => setHoveredTool('code')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <FiCode />
          </ToolButton>
        </ToolbarFooter>
      </ToolbarContent>
    </ToolbarContainer>
  );
};

export default Toolbar;
