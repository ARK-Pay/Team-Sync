import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import * as fabricJS from 'fabric';
const fabric = fabricJS;
import Toolbar from '../../components/Toolbar';
import { FiLayers, FiGrid, FiSliders, FiCopy, FiBox, FiLayout, FiCode, FiPlay, FiEye, FiMessageSquare, FiUsers, FiChevronLeft, FiChevronRight, FiHome, FiZoomIn, FiZoomOut, FiMaximize2, FiSave, FiShare2 } from 'react-icons/fi';
import CommentingSystem from '../../components/CommentingMode/CommentingSystem';
import DesignSystem from '../../components/StylesPanel/DesignSystem';

// Simple function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Types for the commenting system
interface CommentUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

interface CommentReply {
  id: string;
  author: CommentUser;
  content: string;
  timestamp: Date;
}

interface Comment {
  id: string;
  author: CommentUser;
  content: string;
  position: { x: number; y: number };
  timestamp: Date;
  replies: CommentReply[];
  isResolved: boolean;
}

// Enhanced Editor UI with professional Figma-like styling
const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--neutral-100);
`;

const EditorHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  padding: 0 16px;
  background-color: white;
  border-bottom: 1px solid var(--neutral-200);
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProjectTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: var(--neutral-900);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 16px;
    height: 16px;
    color: var(--neutral-500);
  }
`;

const EditorName = styled.div`
  font-size: 13px;
  color: var(--neutral-500);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background-color: var(--neutral-100);
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${props => props.primary ? '6px 12px' : '6px 10px'};
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background-color: ${props => props.primary ? 'var(--primary-500)' : 'transparent'};
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

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
`;

const ZoomButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--neutral-700);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--neutral-100);
    color: var(--neutral-900);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ZoomLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--neutral-700);
  min-width: 60px;
  cursor: pointer;
  
  &:hover {
    color: var(--neutral-900);
  }
`;

const EditorContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const CanvasContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--neutral-100);
`;

const Canvas = styled.canvas`
  position: absolute;
`;

const SidePanel = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '300px' : '0'};
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--neutral-200);
  transition: width var(--transition-normal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const PanelTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-900);
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const PanelCloseButton = styled.button`
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
    width: 16px;
    height: 16px;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  padding: 0 16px;
  background-color: white;
  border-top: 1px solid var(--neutral-200);
  font-size: 12px;
  color: var(--neutral-600);
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

interface EditorProps {}

const Editor: React.FC<EditorProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabricJS.Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [fillColor, setFillColor] = useState('#4299e1');
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showInspectPanel, setShowInspectPanel] = useState(false);
  const [showRedlines, setShowRedlines] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showComponentsPanel, setShowComponentsPanel] = useState(false);
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [showAutoLayoutPanel, setShowAutoLayoutPanel] = useState(false);
  const [isCommentingMode, setIsCommentingMode] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showPrototypingPanel, setShowPrototypingPanel] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CommentUser>({
    id: generateId(),
    name: 'You',
    color: '#4361ee'
  });
  const [activeSidePanel, setActiveSidePanel] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled');
  
  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabricJS.Canvas(canvasRef.current, {
        width: window.innerWidth - 56, // Toolbar width
        height: window.innerHeight - 76, // Header + status bar height
        backgroundColor: '#f0f2f5',
        selection: true,
        preserveObjectStacking: true,
      });
      
      fabricCanvasRef.current = canvas;
      
      // Save initial state to history
      saveCanvasState();
      
      // Handle window resize
      const handleResize = () => {
        canvas.setWidth(window.innerWidth - 56);
        canvas.setHeight(window.innerHeight - 76);
        canvas.renderAll();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }
  }, []);
  
  // Fetch project data
  useEffect(() => {
    if (projectId) {
      // In a real app, fetch project data from API
      setProjectName(`Project ${projectId}`);
    }
  }, [projectId]);
  
  // Save canvas state to history
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    
    // If we're not at the end of the history, remove everything after current index
    if (historyIndex < history.length - 1) {
      setHistory(prevHistory => prevHistory.slice(0, historyIndex + 1));
    }
    
    setHistory(prevHistory => [...prevHistory, json]);
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [history, historyIndex]);
  
  // Get content bounds for zoom to fit
  const getContentBounds = useCallback(() => {
    if (!fabricCanvasRef.current) return null;
    
    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length === 0) return null;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    objects.forEach((obj: fabricJS.Object) => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });
    
    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, []);
  
  // Handle zoom
  const handleZoom = useCallback((direction: 'in' | 'out' | 'fit' | 'reset') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    switch (direction) {
      case 'in':
        // Limit max zoom
        if (zoom < 5) {
          const newZoom = Math.min(zoom * 1.2, 5);
          canvas.zoomToPoint(new fabricJS.Point(canvas.width! / 2, canvas.height! / 2), newZoom);
          setZoom(newZoom);
        }
        break;
      case 'out':
        // Limit min zoom
        if (zoom > 0.1) {
          const newZoom = Math.max(zoom / 1.2, 0.1);
          canvas.zoomToPoint(new fabricJS.Point(canvas.width! / 2, canvas.height! / 2), newZoom);
          setZoom(newZoom);
        }
        break;
      case 'fit':
        const bounds = getContentBounds();
        if (bounds) {
          const canvasWidth = canvas.width!;
          const canvasHeight = canvas.height!;
          
          // Add padding
          const padding = 50;
          bounds.width += padding * 2;
          bounds.height += padding * 2;
          bounds.left -= padding;
          bounds.top -= padding;
          
          const scaleX = canvasWidth / bounds.width;
          const scaleY = canvasHeight / bounds.height;
          const scale = Math.min(scaleX, scaleY);
          
          canvas.setViewportTransform([scale, 0, 0, scale, 
            (canvasWidth - bounds.width * scale) / 2 - bounds.left * scale,
            (canvasHeight - bounds.height * scale) / 2 - bounds.top * scale
          ]);
          
          setZoom(scale);
        }
        break;
      case 'reset':
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        setZoom(1);
        break;
    }
    
    canvas.renderAll();
  }, [zoom, getContentBounds]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvasState = history[newIndex];
      
      if (fabricCanvasRef.current && canvasState) {
        fabricCanvasRef.current.loadFromJSON(JSON.parse(canvasState), () => {
          fabricCanvasRef.current?.renderAll();
        });
        
        setHistoryIndex(newIndex);
      }
    }
  }, [history, historyIndex]);
  
  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvasState = history[newIndex];
      
      if (fabricCanvasRef.current && canvasState) {
        fabricCanvasRef.current.loadFromJSON(JSON.parse(canvasState), () => {
          fabricCanvasRef.current?.renderAll();
        });
        
        setHistoryIndex(newIndex);
      }
    }
  }, [history, historyIndex]);
  
  // Add frame to canvas
  const addFrame = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const frame = new fabricJS.Rect({
      left: 100,
      top: 100,
      width: 300,
      height: 200,
      fill: 'white',
      stroke: '#000000',
      strokeWidth: 1,
      rx: 0,
      ry: 0,
      selectable: true,
      hasControls: true,
    });
    
    canvas.add(frame);
    canvas.setActiveObject(frame);
    canvas.renderAll();
    saveCanvasState();
  }, [saveCanvasState]);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: string) => {
    setSelectedTool(tool);
    
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Set selection mode based on tool
      switch (tool) {
        case 'select':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.forEachObject((obj: fabricJS.Object) => {
            obj.selectable = true;
          });
          break;
        case 'move':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.forEachObject((obj: fabricJS.Object) => {
            obj.selectable = false;
          });
          // Enable panning mode
          canvas.defaultCursor = 'grab';
          canvas.hoverCursor = 'grab';
          // TODO: Implement full panning functionality
          break;
        case 'pen':
          canvas.isDrawingMode = true;
          if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = fillColor;
          }
          canvas.selection = false;
          break;
        case 'crop':
          // Implement crop functionality
          canvas.isDrawingMode = false;
          canvas.selection = true;
          // TODO: Implement full crop functionality
          break;
        case 'frame':
          // Create a frame (similar to addFrame but called directly)
          addFrame();
          // Reset to select tool after creating frame
          setSelectedTool('select');
          break;
        default:
          canvas.isDrawingMode = false;
          canvas.selection = false;
      }
    }
  }, [fillColor, addFrame]);
  
  // Add shape to canvas
  const addShape = useCallback((type: string) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    let object: fabricJS.Object;
    
    switch (type) {
      case 'rectangle':
        object = new fabricJS.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: '#000000',
          strokeWidth: 1,
          rx: 0,
          ry: 0,
          selectable: true,
          hasControls: true,
        });
        break;
      case 'circle':
        object = new fabricJS.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: fillColor,
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true,
          hasControls: true,
        });
        break;
      case 'triangle':
        object = new fabricJS.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true,
          hasControls: true,
        });
        break;
      case 'text':
        object = new fabricJS.Textbox('Text', {
          left: 100,
          top: 100,
          width: 200,
          fontSize: 24,
          fontFamily: 'Inter',
          fill: fillColor,
          selectable: true,
          hasControls: true,
        });
        break;
      case 'image':
        // Open file dialog to select an image
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imgObj = new Image();
              imgObj.src = event.target?.result as string;
              imgObj.onload = () => {
                const image = new fabricJS.Image(imgObj);
                // Scale down large images
                if (image.width && image.width > 300) {
                  const scale = 300 / image.width;
                  image.scale(scale);
                }
                image.set({
                  left: 100,
                  top: 100,
                  selectable: true,
                  hasControls: true,
                });
                canvas.add(image);
                canvas.setActiveObject(image);
                canvas.renderAll();
                saveCanvasState();
              };
            };
            reader.readAsDataURL(target.files[0]);
          }
        };
        input.click();
        return; // Early return as we're handling the image asynchronously
      case 'autolayout':
        // Create a container with auto layout
        const container = new fabricJS.Rect({
          left: 100,
          top: 100,
          width: 300,
          height: 200,
          fill: 'white',
          stroke: '#4361ee',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          rx: 8,
          ry: 8,
          selectable: true,
          hasControls: true,
        });
        
        // Add metadata for auto layout
        container.set('data', {
          type: 'autolayout',
          direction: 'vertical',
          padding: 16,
          spacing: 8
        });
        
        canvas.add(container);
        canvas.setActiveObject(container);
        canvas.renderAll();
        saveCanvasState();
        return;
      default:
        return;
    }
    
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.renderAll();
    saveCanvasState();
  }, [fillColor, saveCanvasState]);
  
  // Toggle side panel
  const toggleSidePanel = useCallback((panelName: string) => {
    if (activeSidePanel === panelName) {
      setActiveSidePanel(null);
    } else {
      setActiveSidePanel(panelName);
    }
  }, [activeSidePanel]);
  
  // Toggle inspect panel
  const onToggleInspect = useCallback(() => {
    setShowInspectPanel(!showInspectPanel);
    toggleSidePanel('inspect');
  }, [showInspectPanel, toggleSidePanel]);
  
  // Export template
  const onExportTemplate = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    try {
      // Get canvas data
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      
      // Create a download link for the PNG
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also create a JSON file with the canvas data
      const jsonBlob = new Blob([json], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      
      // Show success message
      alert('Design exported successfully as PNG and JSON!');
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Failed to export design. Please try again.');
    }
  }, [fabricCanvasRef, projectName]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          handleToolSelect('select');
          break;
        case 'h':
          handleToolSelect('move');
          break;
        case 'r':
          handleToolSelect('rectangle');
          break;
        case 'o':
          handleToolSelect('circle');
          break;
        case 'y':
          handleToolSelect('triangle');
          break;
        case 't':
          handleToolSelect('text');
          break;
        case 'f':
          handleToolSelect('frame');
          break;
        case 'p':
          handleToolSelect('pen');
          break;
        case 'c':
          handleToolSelect('crop');
          break;
        case 'i':
          handleToolSelect('image');
          break;
      }
      
      // Alt key shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'i':
            onToggleInspect();
            break;
          case 'r':
            setShowRedlines(!showRedlines);
            break;
          case 'l':
            toggleSidePanel('layers');
            break;
          case 'c':
            toggleSidePanel('components');
            break;
          case 's':
            toggleSidePanel('styles');
            break;
          case 'm':
            setIsCollaborating(!isCollaborating);
            break;
          case 'd':
            setIsCommentingMode(!isCommentingMode);
            break;
          case 'p':
            setShowPrototypingPanel(!showPrototypingPanel);
            toggleSidePanel('prototyping');
            break;
          case 'x':
            toggleSidePanel('code');
            break;
        }
      }
      
      // Shift key shortcuts
      if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            handleToolSelect('autolayout');
            break;
        }
      }
      
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          e.preventDefault();
        } else if (e.key === 'e') {
          // Export
          onExportTemplate();
          e.preventDefault();
        }
      }
      
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (fabricCanvasRef.current) {
          const activeObject = fabricCanvasRef.current.getActiveObject();
          if (activeObject) {
            fabricCanvasRef.current.remove(activeObject);
            fabricCanvasRef.current.renderAll();
            saveCanvasState();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleToolSelect, 
    handleUndo, 
    handleRedo, 
    saveCanvasState, 
    onToggleInspect, 
    toggleSidePanel, 
    showRedlines, 
    setShowRedlines, 
    isCollaborating, 
    setIsCollaborating, 
    isCommentingMode, 
    setIsCommentingMode, 
    showPrototypingPanel, 
    setShowPrototypingPanel,
    onExportTemplate
  ]);
  
  return (
    <EditorContainer>
      <EditorHeader>
        <HeaderLeft>
          <ActionButton>
            <FiChevronLeft />
          </ActionButton>
          <ProjectTitle>
            <FiHome />
            {projectName}
          </ProjectTitle>
        </HeaderLeft>
        
        <HeaderCenter>
          <ZoomControls>
            <ZoomButton onClick={() => handleZoom('out')}>
              <FiZoomOut />
            </ZoomButton>
            <ZoomLevel onClick={() => handleZoom('reset')}>
              {Math.round(zoom * 100)}%
            </ZoomLevel>
            <ZoomButton onClick={() => handleZoom('in')}>
              <FiZoomIn />
            </ZoomButton>
            <ZoomButton onClick={() => handleZoom('fit')}>
              <FiMaximize2 />
            </ZoomButton>
          </ZoomControls>
        </HeaderCenter>
        
        <HeaderRight>
          <EditorName>
            You
          </EditorName>
          <ActionButton>
            <FiSave />
            Save
          </ActionButton>
          <ActionButton primary>
            <FiShare2 />
            Share
          </ActionButton>
        </HeaderRight>
      </EditorHeader>
      
      <EditorContent>
        <Toolbar 
          selectedTool={selectedTool}
          onToolSelect={(tool) => {
            handleToolSelect(tool);
            if (['rectangle', 'circle', 'triangle', 'text', 'image', 'autolayout'].includes(tool)) {
              addShape(tool);
            } else if (tool === 'layers') {
              toggleSidePanel('layers');
            } else if (tool === 'components') {
              toggleSidePanel('components');
            } else if (tool === 'styles') {
              toggleSidePanel('styles');
            } else if (tool === 'code') {
              toggleSidePanel('code');
            }
          }}
          onToggleInspect={onToggleInspect}
          onToggleRedlines={() => setShowRedlines(!showRedlines)}
          isInspectMode={showInspectPanel}
          showRedlines={showRedlines}
          onToggleMultiplayer={() => setIsCollaborating(!isCollaborating)}
          onToggleComments={() => setIsCommentingMode(!isCommentingMode)}
          isMultiplayerActive={isCollaborating}
          showComments={isCommentingMode}
          onTogglePrototyping={() => {
            setShowPrototypingPanel(!showPrototypingPanel);
            toggleSidePanel('prototyping');
          }}
          onExportTemplate={onExportTemplate}
          isPrototypingActive={showPrototypingPanel}
        />
        
        <CanvasContainer ref={canvasContainerRef}>
          <Canvas ref={canvasRef} />
          
          {/* Commenting System */}
          {isCommentingMode && (
            <CommentingSystem
              canvas={fabricCanvasRef.current}
              canvasContainer={canvasContainerRef.current}
              currentUser={currentUser}
              isCommentingMode={isCommentingMode}
              comments={comments}
              onAddComment={(comment) => {
                const newComment: Comment = {
                  ...comment,
                  id: generateId(),
                  replies: []
                };
                setComments([...comments, newComment]);
              }}
              onAddReply={(commentId, reply) => {
                const updatedComments = comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      replies: [...comment.replies, { ...reply, id: generateId() }]
                    };
                  }
                  return comment;
                });
                setComments(updatedComments);
              }}
              onResolveComment={(commentId, isResolved) => {
                const updatedComments = comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      isResolved
                    };
                  }
                  return comment;
                });
                setComments(updatedComments);
              }}
              onDeleteComment={(commentId) => {
                const updatedComments = comments.filter(comment => comment.id !== commentId);
                setComments(updatedComments);
              }}
              onDeleteReply={(commentId, replyId) => {
                const updatedComments = comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      replies: comment.replies.filter(reply => reply.id !== replyId)
                    };
                  }
                  return comment;
                });
                setComments(updatedComments);
              }}
            />
          )}
        </CanvasContainer>
        
        <SidePanel isOpen={!!activeSidePanel}>
          {activeSidePanel && (
            <>
              <PanelHeader>
                <PanelTitle>
                  {activeSidePanel === 'layers' && 'Layers'}
                  {activeSidePanel === 'components' && 'Components'}
                  {activeSidePanel === 'styles' && 'Design System'}
                  {activeSidePanel === 'inspect' && 'Inspect'}
                  {activeSidePanel === 'prototyping' && 'Prototyping'}
                  {activeSidePanel === 'code' && 'Code'}
                </PanelTitle>
                <PanelCloseButton onClick={() => setActiveSidePanel(null)}>
                  <FiChevronRight />
                </PanelCloseButton>
              </PanelHeader>
              
              <PanelContent>
                {activeSidePanel === 'layers' && (
                  <div>
                    <p>Layers panel content</p>
                    {/* Layer list would go here */}
                  </div>
                )}
                
                {activeSidePanel === 'components' && (
                  <div>
                    <p>Components panel content</p>
                    {/* Component library would go here */}
                  </div>
                )}
                
                {activeSidePanel === 'styles' && (
                  <DesignSystem
                    onApplyStyle={(type, style) => {
                      // Handle applying styles to selected objects
                      if (fabricCanvasRef.current) {
                        const activeObject = fabricCanvasRef.current.getActiveObject();
                        if (activeObject) {
                          if (type === 'color') {
                            activeObject.set('fill', style.value);
                          } else if (type === 'text' && activeObject.type === 'textbox') {
                            activeObject.set({
                              fontFamily: style.fontFamily,
                              fontSize: parseInt(style.fontSize),
                              fontWeight: style.fontWeight,
                              lineHeight: parseFloat(style.lineHeight)
                            });
                          } else if (type === 'effect' && style.type === 'shadow') {
                            activeObject.set('shadow', new fabric.Shadow({
                              color: 'rgba(0,0,0,0.3)',
                              blur: 10,
                              offsetX: 5,
                              offsetY: 5
                            }));
                          }
                          
                          fabricCanvasRef.current.renderAll();
                          saveCanvasState();
                        }
                      }
                    }}
                    onCreateStyle={(type) => {
                      // Handle creating new styles
                      alert(`Creating new ${type} style`);
                    }}
                  />
                )}
                
                {activeSidePanel === 'inspect' && (
                  <div>
                    <p>Inspect panel content</p>
                    {/* Property inspector would go here */}
                  </div>
                )}
                
                {activeSidePanel === 'prototyping' && (
                  <div>
                    <p>Prototyping panel content</p>
                    {/* Interaction controls would go here */}
                  </div>
                )}
                
                {activeSidePanel === 'code' && (
                  <div>
                    <p>Code panel content</p>
                    {/* Generated code would go here */}
                  </div>
                )}
              </PanelContent>
            </>
          )}
        </SidePanel>
      </EditorContent>
      
      <StatusBar>
        <StatusItem>
          <StatusDot color={isCollaborating ? 'var(--success)' : 'var(--neutral-400)'} />
          {isCollaborating ? 'Collaborating' : 'Offline'}
        </StatusItem>
        
        <StatusItem>
          {showRedlines ? 'Redlines: On' : 'Redlines: Off'}
        </StatusItem>
        
        <StatusItem>
          <FiEye />
          {showInspectPanel ? 'Inspect Mode: On' : 'Inspect Mode: Off'}
        </StatusItem>
      </StatusBar>
    </EditorContainer>
  );
};

export default Editor;
