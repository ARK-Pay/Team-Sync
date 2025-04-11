import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

const DimensionLine = styled.div<{ horizontal?: boolean; color?: string }>`
  position: absolute;
  background-color: ${props => props.color || '#FF5252'};
  ${props => props.horizontal 
    ? 'height: 1px; left: 0; right: 0;' 
    : 'width: 1px; top: 0; bottom: 0;'
  }
`;

const DimensionLabel = styled.div<{ color?: string }>`
  position: absolute;
  background-color: ${props => props.color || '#FF5252'};
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  font-family: 'Roboto Mono', monospace;
`;

const SpacingLine = styled.div<{ horizontal?: boolean }>`
  position: absolute;
  background-color: #2196F3;
  ${props => props.horizontal 
    ? 'height: 1px;' 
    : 'width: 1px;'
  }
`;

const SpacingArrow = styled.div<{ direction: 'left' | 'right' | 'up' | 'down' }>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  
  ${props => {
    switch(props.direction) {
      case 'left':
        return 'border-width: 4px 6px 4px 0; border-color: transparent #2196F3 transparent transparent;';
      case 'right':
        return 'border-width: 4px 0 4px 6px; border-color: transparent transparent transparent #2196F3;';
      case 'up':
        return 'border-width: 0 4px 6px 4px; border-color: transparent transparent #2196F3 transparent;';
      case 'down':
        return 'border-width: 6px 4px 0 4px; border-color: #2196F3 transparent transparent transparent;';
    }
  }}
`;

interface RedlineOverlayProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  zoom?: number;
  canvasContainerRef?: React.RefObject<HTMLDivElement>;
}

const RedlineOverlay: React.FC<RedlineOverlayProps> = ({
  canvas,
  selectedObject,
  zoom = 1,
  canvasContainerRef
}) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null>(null);
  
  const [spacing, setSpacing] = useState<{
    nearestObjects: {
      left: fabric.Object | null;
      right: fabric.Object | null;
      top: fabric.Object | null;
      bottom: fabric.Object | null;
    };
    distances: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  } | null>(null);

  useEffect(() => {
    if (!canvas || !selectedObject || !canvasContainerRef?.current) return;
    
    // Get the bounding box of the selected object
    const boundingBox = selectedObject.getBoundingRect();
    
    // Calculate dimensions
    const boundingRect = selectedObject.getBoundingRect();
    const containerRect = canvasContainerRef?.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const canvasRect = canvas.getElement().getBoundingClientRect();
    
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;
    
    // Apply zoom factor
    const scaledLeft = boundingBox.left * zoom + offsetX;
    const scaledTop = boundingBox.top * zoom + offsetY;
    const scaledWidth = boundingBox.width * zoom;
    const scaledHeight = boundingBox.height * zoom;
    
    setDimensions({
      width: scaledWidth,
      height: scaledHeight,
      left: scaledLeft,
      top: scaledTop,
      right: scaledLeft + scaledWidth,
      bottom: scaledTop + scaledHeight
    });
    
    // Find nearest objects for spacing measurements
    const objects = canvas.getObjects().filter(obj => obj !== selectedObject);
    
    let nearestLeft: fabric.Object | null = null;
    let nearestRight: fabric.Object | null = null;
    let nearestTop: fabric.Object | null = null;
    let nearestBottom: fabric.Object | null = null;
    
    let distanceLeft = Infinity;
    let distanceRight = Infinity;
    let distanceTop = Infinity;
    let distanceBottom = Infinity;
    
    objects.forEach(obj => {
      const objBoundingBox = obj.getBoundingRect();
      
      // Check if object is to the left
      if (objBoundingBox.left + objBoundingBox.width <= boundingBox.left) {
        const distance = boundingBox.left - (objBoundingBox.left + objBoundingBox.width);
        if (distance < distanceLeft) {
          distanceLeft = distance;
          nearestLeft = obj;
        }
      }
      
      // Check if object is to the right
      if (objBoundingBox.left >= boundingBox.left + boundingBox.width) {
        const distance = objBoundingBox.left - (boundingBox.left + boundingBox.width);
        if (distance < distanceRight) {
          distanceRight = distance;
          nearestRight = obj;
        }
      }
      
      // Check if object is above
      if (objBoundingBox.top + objBoundingBox.height <= boundingBox.top) {
        const distance = boundingBox.top - (objBoundingBox.top + objBoundingBox.height);
        if (distance < distanceTop) {
          distanceTop = distance;
          nearestTop = obj;
        }
      }
      
      // Check if object is below
      if (objBoundingBox.top >= boundingBox.top + boundingBox.height) {
        const distance = objBoundingBox.top - (boundingBox.top + boundingBox.height);
        if (distance < distanceBottom) {
          distanceBottom = distance;
          nearestBottom = obj;
        }
      }
    });
    
    setSpacing({
      nearestObjects: {
        left: nearestLeft,
        right: nearestRight,
        top: nearestTop,
        bottom: nearestBottom
      },
      distances: {
        left: distanceLeft,
        right: distanceRight,
        top: distanceTop,
        bottom: distanceBottom
      }
    });
    
  }, [canvas, selectedObject, zoom, canvasContainerRef]);

  if (!dimensions) return null;

  return (
    <OverlayContainer>
      {/* Width dimension */}
      <DimensionLine 
        horizontal 
        style={{ 
          top: `${dimensions.top - 20}px`,
          width: `${dimensions.width}px`,
          left: `${dimensions.left}px`
        }} 
      />
      <DimensionLabel 
        style={{ 
          top: `${dimensions.top - 30}px`,
          left: `${dimensions.left + dimensions.width / 2 - 15}px`
        }}
      >
        {Math.round(dimensions.width / zoom)}px
      </DimensionLabel>
      
      {/* Height dimension */}
      <DimensionLine 
        style={{ 
          left: `${dimensions.right + 20}px`,
          height: `${dimensions.height}px`,
          top: `${dimensions.top}px`
        }} 
      />
      <DimensionLabel 
        style={{ 
          left: `${dimensions.right + 30}px`,
          top: `${dimensions.top + dimensions.height / 2 - 10}px`
        }}
      >
        {Math.round(dimensions.height / zoom)}px
      </DimensionLabel>
      
      {/* Position coordinates */}
      <DimensionLabel 
        style={{
          left: dimensions.left + dimensions.width / 2,
          top: dimensions.top - 20,
        }}
      >
        x: {Math.round(dimensions.left / zoom - (canvasContainerRef?.current?.getBoundingClientRect().left || 0))}
      </DimensionLabel>
      <DimensionLabel 
        style={{
          left: dimensions.left - 30,
          top: dimensions.top + dimensions.height / 2,
        }}
      >
        y: {Math.round(dimensions.top / zoom - (canvasContainerRef?.current?.getBoundingClientRect().top || 0))}
      </DimensionLabel>
      
      {/* Spacing measurements */}
      {spacing && spacing.nearestObjects.left && (
        <>
          <SpacingLine 
            style={{ 
              left: `${dimensions.left - spacing.distances.left * zoom}px`,
              top: `${dimensions.top + dimensions.height / 2}px`,
              width: `${spacing.distances.left * zoom}px`
            }} 
          />
          <DimensionLabel 
            color="#2196F3"
            style={{ 
              left: `${dimensions.left - spacing.distances.left * zoom / 2 - 15}px`,
              top: `${dimensions.top + dimensions.height / 2 - 20}px`
            }}
          >
            {Math.round(spacing.distances.left)}px
          </DimensionLabel>
          <SpacingArrow 
            direction="right" 
            style={{ 
              left: `${dimensions.left - 6}px`,
              top: `${dimensions.top + dimensions.height / 2 - 4}px`
            }} 
          />
          <SpacingArrow 
            direction="left" 
            style={{ 
              left: `${dimensions.left - spacing.distances.left * zoom}px`,
              top: `${dimensions.top + dimensions.height / 2 - 4}px`
            }} 
          />
        </>
      )}
      
      {spacing && spacing.nearestObjects.right && (
        <>
          <SpacingLine 
            style={{ 
              left: `${dimensions.right}px`,
              top: `${dimensions.top + dimensions.height / 2}px`,
              width: `${spacing.distances.right * zoom}px`
            }} 
          />
          <DimensionLabel 
            color="#2196F3"
            style={{ 
              left: `${dimensions.right + spacing.distances.right * zoom / 2 - 15}px`,
              top: `${dimensions.top + dimensions.height / 2 - 20}px`
            }}
          >
            {Math.round(spacing.distances.right)}px
          </DimensionLabel>
          <SpacingArrow 
            direction="right" 
            style={{ 
              left: `${dimensions.right + spacing.distances.right * zoom - 6}px`,
              top: `${dimensions.top + dimensions.height / 2 - 4}px`
            }} 
          />
          <SpacingArrow 
            direction="left" 
            style={{ 
              left: `${dimensions.right}px`,
              top: `${dimensions.top + dimensions.height / 2 - 4}px`
            }} 
          />
        </>
      )}
      
      {spacing && spacing.nearestObjects.top && (
        <>
          <SpacingLine 
            horizontal
            style={{ 
              top: `${dimensions.top - spacing.distances.top * zoom}px`,
              left: `${dimensions.left + dimensions.width / 2}px`,
              height: `${spacing.distances.top * zoom}px`
            }} 
          />
          <DimensionLabel 
            color="#2196F3"
            style={{ 
              top: `${dimensions.top - spacing.distances.top * zoom / 2 - 10}px`,
              left: `${dimensions.left + dimensions.width / 2 + 10}px`
            }}
          >
            {Math.round(spacing.distances.top)}px
          </DimensionLabel>
          <SpacingArrow 
            direction="down" 
            style={{ 
              top: `${dimensions.top - 6}px`,
              left: `${dimensions.left + dimensions.width / 2 - 4}px`
            }} 
          />
          <SpacingArrow 
            direction="up" 
            style={{ 
              top: `${dimensions.top - spacing.distances.top * zoom}px`,
              left: `${dimensions.left + dimensions.width / 2 - 4}px`
            }} 
          />
        </>
      )}
      
      {spacing && spacing.nearestObjects.bottom && (
        <>
          <SpacingLine 
            horizontal
            style={{ 
              top: `${dimensions.bottom}px`,
              left: `${dimensions.left + dimensions.width / 2}px`,
              height: `${spacing.distances.bottom * zoom}px`
            }} 
          />
          <DimensionLabel 
            color="#2196F3"
            style={{ 
              top: `${dimensions.bottom + spacing.distances.bottom * zoom / 2 - 10}px`,
              left: `${dimensions.left + dimensions.width / 2 + 10}px`
            }}
          >
            {Math.round(spacing.distances.bottom)}px
          </DimensionLabel>
          <SpacingArrow 
            direction="down" 
            style={{ 
              top: `${dimensions.bottom + spacing.distances.bottom * zoom - 6}px`,
              left: `${dimensions.left + dimensions.width / 2 - 4}px`
            }} 
          />
          <SpacingArrow 
            direction="up" 
            style={{ 
              top: `${dimensions.bottom}px`,
              left: `${dimensions.left + dimensions.width / 2 - 4}px`
            }} 
          />
        </>
      )}
    </OverlayContainer>
  );
};

export default RedlineOverlay;
