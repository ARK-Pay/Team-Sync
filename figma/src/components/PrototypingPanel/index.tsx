import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const PrototypingContainer = styled.div`
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

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    fill: #666;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
`;

const TargetFrameSelection = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const InteractionType = styled.div`
  margin-bottom: 16px;
`;

const InteractionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const InteractionOption = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.active ? '#2196F3' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.active ? '#e3f2fd' : 'white'};
  color: ${props => props.active ? '#2196F3' : '#666'};
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const TransitionOptions = styled.div`
  margin-bottom: 16px;
`;

const TransitionItem = styled.div`
  margin-bottom: 12px;
`;

const TransitionPreview = styled.div`
  height: 40px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  background-color: #f9f9f9;
`;

const Button = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;

const PreviewModeButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const ConnectionsList = styled.div`
  margin-top: 16px;
`;

const ConnectionItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
`;

const ConnectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const ConnectionTitle = styled.div`
  font-weight: 500;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #F44336;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ConnectionDetails = styled.div`
  color: #666;
`;

interface Frame {
  id: string;
  name: string;
}

interface Connection {
  id: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  trigger: string;
  animation: string;
  duration: number;
}

interface PrototypingPanelProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
}

const PrototypingPanel: React.FC<PrototypingPanelProps> = ({
  canvas,
  selectedObject
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [interactionTrigger, setInteractionTrigger] = useState<string>('click');
  const [transitionAnimation, setTransitionAnimation] = useState<string>('none');
  const [transitionDuration, setTransitionDuration] = useState<number>(300);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Get all available frames (top-level objects with certain attributes)
  useEffect(() => {
    if (!canvas) return;
    
    const allObjects = canvas.getObjects();
    const frameObjects = allObjects.filter(obj => {
      // Consider objects that are rectangles with certain dimensions as frames
      return obj.type === 'rect' && obj.width! > 200 && obj.height! > 200;
    });
    
    const framesList = frameObjects.map(obj => ({
      id: obj.id || `frame-${Math.random().toString(36).substr(2, 9)}`,
      name: obj.name || `Frame ${frameObjects.indexOf(obj) + 1}`
    }));
    
    setFrames(framesList);
  }, [canvas]);
  
  // Add a connection between the selected object and target frame
  const addConnection = () => {
    if (!selectedObject || !selectedTargetId) return;
    
    const sourceId = selectedObject.id || '';
    const sourceName = selectedObject.name || 'Unnamed Object';
    const targetFrame = frames.find(frame => frame.id === selectedTargetId);
    
    if (!targetFrame) return;
    
    const newConnection: Connection = {
      id: `connection-${Date.now()}`,
      sourceId,
      sourceName,
      targetId: selectedTargetId,
      targetName: targetFrame.name,
      trigger: interactionTrigger,
      animation: transitionAnimation,
      duration: transitionDuration
    };
    
    // Store the connection
    setConnections(prev => [...prev, newConnection]);
    
    // Store prototype data on the object for later use
    selectedObject.set('prototypeTarget', {
      targetId: selectedTargetId,
      trigger: interactionTrigger,
      animation: transitionAnimation,
      duration: transitionDuration
    });
    
    // Mark the object as interactive
    selectedObject.set('isInteractive', true);
    
    if (canvas) {
      canvas.renderAll();
    }
  };
  
  const deleteConnection = (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    
    if (!connection) return;
    
    // Find the source object and remove prototype data
    if (canvas) {
      const sourceObject = canvas.getObjects().find(obj => obj.id === connection.sourceId);
      
      if (sourceObject) {
        sourceObject.set('prototypeTarget', null);
        sourceObject.set('isInteractive', false);
        canvas.renderAll();
      }
    }
    
    // Remove the connection
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };
  
  const enterPreviewMode = () => {
    // This would typically save the current state and switch to an interactive preview mode
    // For now, we'll just add a class to the canvas container and disable editing
    if (canvas) {
      canvas.set('interactive', false);
      canvas.hoverCursor = 'pointer';
      canvas.defaultCursor = 'default';
      
      // Add event listeners for interactions
      canvas.on('mouse:down', handlePreviewClick as fabric.AnyEventCallback);
      
      // Visual indication that we're in preview mode
      const canvasContainer = canvas.wrapperEl?.parentNode as HTMLElement;
      if (canvasContainer) {
        canvasContainer.classList.add('preview-mode');
      }
    }
  };
  
  const handlePreviewClick = (options: fabric.TEvent<MouseEvent>) => {
    if (!canvas) return;
    
    const target = options.target;
    
    if (!target || !target.isInteractive) return;
    
    const prototypeTarget = target.prototypeTarget;
    
    if (!prototypeTarget) return;
    
    // Find the target frame
    const targetFrame = canvas.getObjects().find(obj => obj.id === prototypeTarget.targetId);
    
    if (!targetFrame) return;
    
    // Perform the transition animation
    switch (prototypeTarget.animation) {
      case 'fade':
        // Implement fade transition
        break;
      case 'slide-left':
        // Implement slide transition
        break;
      case 'slide-right':
        // Implement slide transition
        break;
      default:
        // No animation, just scroll to the target
        canvas.setViewportTransform([1, 0, 0, 1, -targetFrame.left!, -targetFrame.top!]);
        break;
    }
  };
  
  return (
    <PrototypingContainer>
      <PanelHeader>
        <HeaderTitle>
          <svg viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
          </svg>
          Prototyping
        </HeaderTitle>
        <CloseButton onClick={() => {}}>✕</CloseButton>
      </PanelHeader>
      
      <PanelContent>
        {selectedObject ? (
          <>
            <Section>
              <SectionTitle>Create Interaction</SectionTitle>
              
              <TargetFrameSelection>
                <Label>Navigate To</Label>
                <Select 
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                >
                  <option value="">Select a frame</option>
                  {frames.map(frame => (
                    <option key={frame.id} value={frame.id}>
                      {frame.name}
                    </option>
                  ))}
                </Select>
              </TargetFrameSelection>
              
              <InteractionType>
                <Label>On</Label>
                <InteractionOptions>
                  <InteractionOption 
                    active={interactionTrigger === 'click'}
                    onClick={() => setInteractionTrigger('click')}
                  >
                    Click
                  </InteractionOption>
                  <InteractionOption 
                    active={interactionTrigger === 'hover'}
                    onClick={() => setInteractionTrigger('hover')}
                  >
                    Hover
                  </InteractionOption>
                  <InteractionOption 
                    active={interactionTrigger === 'drag'}
                    onClick={() => setInteractionTrigger('drag')}
                  >
                    Drag
                  </InteractionOption>
                </InteractionOptions>
              </InteractionType>
              
              <TransitionOptions>
                <Label>Animation</Label>
                <Select 
                  value={transitionAnimation}
                  onChange={(e) => setTransitionAnimation(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide-left">Slide Left</option>
                  <option value="slide-right">Slide Right</option>
                  <option value="slide-up">Slide Up</option>
                  <option value="slide-down">Slide Down</option>
                  <option value="dissolve">Dissolve</option>
                  <option value="smart-animate">Smart Animate</option>
                </Select>
                
                {transitionAnimation !== 'none' && (
                  <TransitionItem>
                    <Label>Duration (ms)</Label>
                    <Select 
                      value={transitionDuration}
                      onChange={(e) => setTransitionDuration(Number(e.target.value))}
                    >
                      <option value="150">150ms (Fast)</option>
                      <option value="300">300ms (Medium)</option>
                      <option value="500">500ms (Slow)</option>
                      <option value="800">800ms (Very Slow)</option>
                    </Select>
                    <TransitionPreview>
                      Preview animation
                    </TransitionPreview>
                  </TransitionItem>
                )}
              </TransitionOptions>
              
              <Button 
                onClick={addConnection}
                disabled={!selectedTargetId}
              >
                Add Interaction
              </Button>
            </Section>
            
            {connections.length > 0 && (
              <Section>
                <SectionTitle>Existing Interactions</SectionTitle>
                <ConnectionsList>
                  {connections.map(connection => (
                    <ConnectionItem key={connection.id}>
                      <ConnectionHeader>
                        <ConnectionTitle>{connection.sourceName}</ConnectionTitle>
                        <DeleteButton onClick={() => deleteConnection(connection.id)}>
                          Remove
                        </DeleteButton>
                      </ConnectionHeader>
                      <ConnectionDetails>
                        On {connection.trigger} → {connection.targetName}
                        {connection.animation !== 'none' && (
                          <span> ({connection.animation}, {connection.duration}ms)</span>
                        )}
                      </ConnectionDetails>
                    </ConnectionItem>
                  ))}
                </ConnectionsList>
              </Section>
            )}
            
            <PreviewModeButton onClick={enterPreviewMode}>
              Test Prototype
            </PreviewModeButton>
          </>
        ) : (
          <div>Select an object to create interactions</div>
        )}
      </PanelContent>
    </PrototypingContainer>
  );
};

export default PrototypingPanel; 