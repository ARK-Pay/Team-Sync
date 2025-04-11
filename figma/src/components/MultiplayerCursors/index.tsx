import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import type { Socket } from 'socket.io-client';
import * as fabricJS from 'fabric';

// Styled components for the cursor
const CursorContainer = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 1000;
  transition: transform 0.05s linear;
`;

const CursorPointer = styled.div<{ color: string; active: boolean }>`
  width: 24px;
  height: 24px;
  position: relative;
  opacity: ${props => props.active ? 1 : 0.6};
  
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 16px solid ${props => props.color};
    transform: rotate(-45deg);
    top: 0;
    left: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#4ADE80' : '#94A3B8'};
    border: 2px solid white;
    right: 0;
    top: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const CursorLabel = styled.div<{ color: string; active: boolean }>`
  background-color: ${props => props.color};
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  position: absolute;
  top: 20px;
  left: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: ${props => props.active ? 1 : 0.8};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::after {
    content: '${props => props.active ? '• editing' : ''}';
    font-size: 10px;
    opacity: 0.8;
  }
`;

const UserAction = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  top: -20px;
  left: 10px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s ease;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Interface for cursor data
interface CursorData {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
  active: boolean;
  action?: string;
  lastActive: number;
}

interface MultiplayerCursorsProps {
  socket: any | null;
  canvas: fabricJS.Canvas | null;
  userId: string;
  userName: string;
  canvasContainer: HTMLElement | null;
}

const MultiplayerCursors: React.FC<MultiplayerCursorsProps> = ({
  socket,
  canvas,
  userId,
  userName,
  canvasContainer
}) => {
  const [cursors, setCursors] = useState<{ [key: string]: CursorData }>({});
  const cursorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const actionTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  // Generate a random color for this user
  const userColor = useRef(
    `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
  );
  
  useEffect(() => {
    if (!socket || !canvas || !canvasContainer) return;
    
    // Function to update cursor position
    const updateCursorPosition = (e: MouseEvent) => {
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      socket.emit('cursor:move', {
        userId,
        userName,
        position: { x, y },
        color: userColor.current,
        active: true,
        lastActive: Date.now()
      });
    };
    
    // Function to handle user actions
    const handleUserAction = (action: string) => {
      socket.emit('cursor:action', {
        userId,
        action
      });
    };
    
    // Listen for canvas events
    canvasContainer.addEventListener('mousemove', updateCursorPosition);
    
    // Listen for object modifications
    canvas.on('object:modified', () => handleUserAction('Modified an object'));
    canvas.on('object:added', () => handleUserAction('Added an object'));
    canvas.on('object:removed', () => handleUserAction('Removed an object'));
    
    // Set up socket listeners
    socket.on('cursor:update', (data: CursorData) => {
      if (data.userId === userId) return;
      
      setCursors(prev => ({
        ...prev,
        [data.userId]: data
      }));
    });
    
    socket.on('cursor:action', ({ userId, action }: { userId: string; action: string }) => {
      setCursors(prev => {
        if (!prev[userId]) return prev;
        
        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            action
          }
        };
      });
      
      // Clear previous timeout if exists
      if (actionTimeouts.current[userId]) {
        clearTimeout(actionTimeouts.current[userId]);
      }
      
      // Set timeout to clear action after 2 seconds
      actionTimeouts.current[userId] = setTimeout(() => {
        setCursors(prev => {
          if (!prev[userId]) return prev;
          
          return {
            ...prev,
            [userId]: {
              ...prev[userId],
              action: undefined
            }
          };
        });
      }, 2000);
    });
    
    socket.on('cursor:leave', (leftUserId: string) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[leftUserId];
        return newCursors;
      });
    });
    
    // Cleanup
    return () => {
      canvasContainer.removeEventListener('mousemove', updateCursorPosition);
      canvas.off('object:modified');
      canvas.off('object:added');
      canvas.off('object:removed');
      
      socket.off('cursor:update');
      socket.off('cursor:action');
      socket.off('cursor:leave');
      
      // Clear all timeouts
      Object.values(actionTimeouts.current).forEach(timeout => clearTimeout(timeout));
      
      // Notify others that this user is leaving
      socket.emit('cursor:leave', userId);
    };
  }, [socket, canvas, canvasContainer, userId, userName]);
  
  // Check for inactive cursors every 5 seconds
  useEffect(() => {
    const inactivityInterval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const newCursors = { ...prev };
        
        Object.entries(newCursors).forEach(([id, cursor]) => {
          // Mark cursor as inactive if no updates for 5 seconds
          if (now - cursor.lastActive > 5000) {
            newCursors[id] = {
              ...cursor,
              active: false
            };
          }
        });
        
        return newCursors;
      });
    }, 5000);
    
    return () => clearInterval(inactivityInterval);
  }, []);
  
  return (
    <>
      {Object.entries(cursors).map(([id, cursor]) => (
        <CursorContainer
          key={id}
          ref={el => (cursorRefs.current[id] = el)}
          style={{
            transform: `translate(${cursor.position.x}px, ${cursor.position.y}px)`
          }}
        >
          <CursorPointer color={cursor.color} active={cursor.active} />
          <CursorLabel color={cursor.color} active={cursor.active}>
            {cursor.userName}
          </CursorLabel>
          <UserAction className={cursor.action ? 'visible' : ''}>
            {cursor.action}
          </UserAction>
        </CursorContainer>
      ))}
    </>
  );
};

export default MultiplayerCursors;
