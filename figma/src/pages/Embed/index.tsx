import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import * as fabric from 'fabric';

const EmbedContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CanvasContainer = styled.div`
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const LoadingMessage = styled.div`
  color: #666;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 14px;
`;

const Embed: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view-only';
  
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize canvas and load design
  useEffect(() => {
    if (!canvasRef.current || !projectId) return;
    
    // Create canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: 'white',
      selection: mode === 'interactive', // Only allow selection in interactive mode
      interactive: mode === 'interactive' // Only allow interaction in interactive mode
    });
    
    setCanvas(fabricCanvas);
    
    // Fetch design data
    const fetchDesign = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the design data from your backend
        // For now, we'll simulate loading a design
        const response = await fetch(`/api/designs/${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load design');
        }
        
        const designData = await response.json();
        
        // Load design into canvas
        fabricCanvas.loadFromJSON(designData.canvas, () => {
          fabricCanvas.renderAll();
          setLoading(false);
        });
      } catch (err) {
        console.error('Error loading design:', err);
        setError('Failed to load design. Please try again later.');
        setLoading(false);
      }
    };
    
    // For demo purposes, simulate loading a design with some basic shapes
    const simulateDesignLoad = () => {
      setTimeout(() => {
        // Create a sample design
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 200,
          height: 150,
          fill: '#4285F4',
          rx: 8,
          ry: 8
        });
        
        const circle = new fabric.Circle({
          left: 400,
          top: 150,
          radius: 75,
          fill: '#EA4335'
        });
        
        const text = new fabric.Text('Embedded Design', {
          left: 250,
          top: 300,
          fontFamily: 'Arial',
          fontSize: 24,
          fill: '#333'
        });
        
        fabricCanvas.add(rect, circle, text);
        fabricCanvas.renderAll();
        
        setLoading(false);
      }, 1000);
    };
    
    // In a real app, call fetchDesign()
    // For demo, use simulateDesignLoad()
    simulateDesignLoad();
    
    return () => {
      fabricCanvas.dispose();
    };
  }, [projectId, mode]);
  
  return (
    <EmbedContainer>
      {loading ? (
        <LoadingMessage>Loading design...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <CanvasContainer>
          <canvas ref={canvasRef} />
        </CanvasContainer>
      )}
    </EmbedContainer>
  );
};

export default Embed;
