import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import styled from 'styled-components';
import socketIOClient from 'socket.io-client';

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

interface CanvasProps {
  projectId?: string;
}

const Canvas: React.FC<CanvasProps> = ({ projectId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const socketRef = useRef<any | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize Fabric.js canvas
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 480, // Adjust for panels
        height: window.innerHeight - 100, // Adjust for header and toolbar
        backgroundColor: '#f5f5f5',
        preserveObjectStacking: true,
      });

      // Connect to Socket.io server
      socketRef.current = socketIOClient('http://localhost:5000');
      
      // Handle canvas events
      fabricCanvasRef.current.on('object:modified', handleCanvasChange);
      fabricCanvasRef.current.on('object:added', handleCanvasChange);
      fabricCanvasRef.current.on('object:removed', handleCanvasChange);
      
      // Handle socket events
      socketRef.current?.on('canvas-update', (data: any) => {
        if (data.projectId === projectId && fabricCanvasRef.current) {
          fabricCanvasRef.current.loadFromJSON(data.canvasData, () => {
            fabricCanvasRef.current?.renderAll();
          });
        }
      });

      // Handle window resize
      const handleResize = () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.setDimensions({
            width: window.innerWidth - 480,
            height: window.innerHeight - 100,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        fabricCanvasRef.current?.dispose();
        socketRef.current?.disconnect();
      };
    }
  }, [projectId]);

  const handleCanvasChange = () => {
    if (fabricCanvasRef.current && socketRef.current && projectId) {
      const canvasData = fabricCanvasRef.current.toJSON();
      socketRef.current.emit('canvas-update', {
        projectId,
        canvasData,
      });
    }
  };

  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
};

export default Canvas;