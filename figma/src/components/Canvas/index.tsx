import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9e9e9;
`;

const CanvasContainer = styled.div`
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

interface CanvasProps {
  width: number;
  height: number;
  onCanvasInitialized: (canvas: fabric.Canvas) => void;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, onCanvasInitialized }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: 'white',
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;
      onCanvasInitialized(canvas);

      // Add grid background (optional)
      const gridSize = 20;
      const gridLines = [];

      // Create vertical grid lines
      for (let i = 1; i < width / gridSize; i++) {
        gridLines.push(
          new fabric.Line([i * gridSize, 0, i * gridSize, height], {
            stroke: '#f0f0f0',
            selectable: false,
            evented: false,
          })
        );
      }

      // Create horizontal grid lines
      for (let i = 1; i < height / gridSize; i++) {
        gridLines.push(
          new fabric.Line([0, i * gridSize, width, i * gridSize], {
            stroke: '#f0f0f0',
            selectable: false,
            evented: false,
          })
        );
      }

      // Add grid lines to canvas
      canvas.add(...gridLines);
      
      // Send grid lines to back
      gridLines.forEach(line => {
        canvas.sendObjectToBack(line);
      });

      // Handle keyboard events for delete
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [width, height, onCanvasInitialized]);

  // Update canvas size if dimensions change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.requestRenderAll();
    }
  }, [width, height]);

  return (
    <CanvasWrapper>
      <CanvasContainer>
        <canvas ref={canvasRef} />
      </CanvasContainer>
    </CanvasWrapper>
  );
};

export default Canvas;
