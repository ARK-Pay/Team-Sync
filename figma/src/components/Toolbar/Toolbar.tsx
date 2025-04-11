import React, { useState } from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
`;

const ToolGroup = styled.div`
  display: flex;
  margin-right: 20px;
`;

const Tool = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.active ? '#e6f7ff' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e0e0e0;
  margin: 0 10px;
`;

type ToolType = 'select' | 'rectangle' | 'ellipse' | 'text' | 'pen' | 'hand' | 'zoom';

const Toolbar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    // In a real app, you would dispatch an action to update the global state
  };

  return (
    <ToolbarContainer>
      <ToolGroup>
        <Tool 
          title="Select" 
          active={activeTool === 'select'}
          onClick={() => handleToolClick('select')}
        >
          <span>▢</span>
        </Tool>
        <Tool 
          title="Rectangle" 
          active={activeTool === 'rectangle'}
          onClick={() => handleToolClick('rectangle')}
        >
          <span>□</span>
        </Tool>
        <Tool 
          title="Ellipse" 
          active={activeTool === 'ellipse'}
          onClick={() => handleToolClick('ellipse')}
        >
          <span>○</span>
        </Tool>
        <Tool 
          title="Text" 
          active={activeTool === 'text'}
          onClick={() => handleToolClick('text')}
        >
          <span>T</span>
        </Tool>
        <Tool 
          title="Pen" 
          active={activeTool === 'pen'}
          onClick={() => handleToolClick('pen')}
        >
          <span>✏️</span>
        </Tool>
      </ToolGroup>
      
      <Divider />
      
      <ToolGroup>
        <Tool 
          title="Hand Tool" 
          active={activeTool === 'hand'}
          onClick={() => handleToolClick('hand')}
        >
          <span>✋</span>
        </Tool>
        <Tool 
          title="Zoom" 
          active={activeTool === 'zoom'}
          onClick={() => handleToolClick('zoom')}
        >
          <span>🔍</span>
        </Tool>
      </ToolGroup>
    </ToolbarContainer>
  );
};

export default Toolbar;