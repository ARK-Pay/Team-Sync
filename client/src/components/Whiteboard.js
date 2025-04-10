import React, { useRef, useEffect, useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const Whiteboard = ({ roomId, userId }) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Ensure the component is properly mounted before rendering Tldraw
    if (containerRef.current) {
      console.log('Whiteboard container mounted successfully');
      setMounted(true);
      
      // Force a resize event to ensure proper rendering
      const resizeEvent = window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      
      return () => clearTimeout(resizeEvent);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="whiteboard-wrapper"
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        aspectRatio: '16/9',
        minHeight: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {mounted && (
        <Tldraw
          showMenu={false}
          showPages={false}
          showTools={true}
          showZoom={true}
          showStyles={true}
          showUI={true}
          persistenceKey={roomId || 'default-room'} // Use roomId for persistence with fallback
          userId={userId || 'anonymous-user'} // Provide fallback for userId
        />
      )}
    </div>
  );
};

export default Whiteboard;