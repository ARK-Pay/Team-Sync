import React, { useRef, useState, useEffect } from "react";
import "./Whiteboard.css";

const Whiteboard = ({ isVisible, onClose }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ text: "", x: 0, y: 0, color: "#FFEB3B", id: null });
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [backgrounds] = useState([
    { name: "Grid", value: "grid" },
    { name: "Dots", value: "dots" },
    { name: "Lines", value: "lines" },
    { name: "None", value: "none" }
  ]);
  const [currentBackground, setCurrentBackground] = useState("none");
  const fileInputRef = useRef(null);

  // Preset colors similar to Jamboard
  const presetColors = [
    "#000000", "#FFFFFF", "#F44336", "#E91E63", "#9C27B0", 
    "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", 
    "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", 
    "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E"
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    
    // Initial history state
    saveHistory();
    
    // Apply background pattern
    drawBackground();
    
    // Handle window resize
    const handleResize = () => {
      // Save current drawing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Resize canvas (could be made responsive here)
      // canvas.width = window.innerWidth * 0.8;
      // canvas.height = window.innerHeight * 0.7;
      
      // Restore drawing
      ctx.putImageData(imageData, 0, 0);
      drawBackground();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Update background when changed
  useEffect(() => {
    drawBackground();
  }, [currentBackground]);

  // Draw background pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas first
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    
    // If we have content in history, restore it
    if (history.length > 0) {
      ctx.putImageData(history[history.length - 1], 0, 0);
      return;
    }
    
    // Draw patterns
    ctx.save();
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    
    if (currentBackground === "grid") {
      const gridSize = 20;
      
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (currentBackground === "dots") {
      const dotSpacing = 20;
      
      for (let x = dotSpacing; x < w; x += dotSpacing) {
        for (let y = dotSpacing; y < h; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (currentBackground === "lines") {
      const lineSpacing = 20;
      
      for (let y = lineSpacing; y < h; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const imageData = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory(prev => [...prev, imageData]);
    setRedoStack([]);
  };

  // Convert event coordinates to canvas coordinates
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.type.includes('touch')) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) / zoom - canvasOffset.x,
      y: (clientY - rect.top) / zoom - canvasOffset.y
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    
    // Check if we're clicking on a note
    const clickedNoteIndex = notes.findIndex(note => {
      return coords.x >= note.x && 
             coords.x <= note.x + 200 && 
             coords.y >= note.y && 
             coords.y <= note.y + 40;
    });
    
    if (clickedNoteIndex >= 0 && tool !== "eraser") {
      // Start dragging the note
      setIsDragging(true);
      setDragTarget({type: 'note', index: clickedNoteIndex});
      setDragOffset({
        x: coords.x - notes[clickedNoteIndex].x,
        y: coords.y - notes[clickedNoteIndex].y
      });
      return;
    }
    
    // Check if we're clicking on an image
    const clickedImageIndex = imageList.findIndex(img => {
      return coords.x >= img.x && 
             coords.x <= img.x + img.width && 
             coords.y >= img.y && 
             coords.y <= img.y + img.height;
    });
    
    if (clickedImageIndex >= 0 && tool !== "eraser") {
      // Start dragging the image
      setIsDragging(true);
      setDragTarget({type: 'image', index: clickedImageIndex});
      setDragOffset({
        x: coords.x - imageList[clickedImageIndex].x,
        y: coords.y - imageList[clickedImageIndex].y
      });
      return;
    }
    
    // Handle drawing tools
    setStartPos(coords);
    
    if (tool === "note") {
      setCurrentNote(prev => ({
        ...prev,
        x: coords.x,
        y: coords.y,
        id: Date.now()
      }));
      setShowNoteInput(true);
      return;
    }
    
    if (tool === "text") return;
    
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(coords.x, coords.y);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) {
      // Handle dragging
      if (isDragging && dragTarget) {
        const coords = getCanvasCoordinates(e);
        
        if (dragTarget.type === 'note') {
          const updatedNotes = [...notes];
          updatedNotes[dragTarget.index] = {
            ...updatedNotes[dragTarget.index],
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y
          };
          setNotes(updatedNotes);
        }
        
        if (dragTarget.type === 'image') {
          const updatedImages = [...imageList];
          updatedImages[dragTarget.index] = {
            ...updatedImages[dragTarget.index],
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y
          };
          setImageList(updatedImages);
        }
      }
      return;
    }
    
    const coords = getCanvasCoordinates(e);
    ctxRef.current.strokeStyle = tool === "eraser" ? "rgba(0,0,0,0)" : color;
    ctxRef.current.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctxRef.current.lineWidth = size;

    if (tool === "pen" || tool === "highlighter") {
      if (tool === "highlighter") {
        ctxRef.current.globalAlpha = 0.3;
        ctxRef.current.lineWidth = size * 2;
      } else {
        ctxRef.current.globalAlpha = 1.0;
      }
      
      ctxRef.current.lineTo(coords.x, coords.y);
      ctxRef.current.stroke();
    } else if (tool === "line") {
      // For line preview during drawing
      const canvas = canvasRef.current;
      // Redraw the canvas from history to clear previous preview
      if (history.length > 0) {
        ctxRef.current.putImageData(history[history.length - 1], 0, 0);
      } else {
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
      }
      
      // Draw the preview line
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(startPos.x, startPos.y);
      ctxRef.current.lineTo(coords.x, coords.y);
      ctxRef.current.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (isDragging) {
      setIsDragging(false);
      setDragTarget(null);
      saveHistory();
      return;
    }
    
    if (!drawing) return;
    
    const coords = getCanvasCoordinates(e);
    setDrawing(false);
    ctxRef.current.globalAlpha = 1.0;

    if (tool === "rectangle") {
      ctxRef.current.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
      ctxRef.current.beginPath();
      ctxRef.current.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctxRef.current.stroke();
    } else if (tool === "line") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(startPos.x, startPos.y);
      ctxRef.current.lineTo(coords.x, coords.y);
      ctxRef.current.stroke();
    }
    
    saveHistory();
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Two finger touch - handle pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    } else {
      // Single touch - handle as mouse
      startDrawing(e);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      // Handle pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const delta = distance - lastTouchDistance;
      const newZoom = Math.max(0.5, Math.min(3, zoom + delta * 0.01));
      
      setZoom(newZoom);
      setLastTouchDistance(distance);
    } else {
      // Handle as mouse move
      draw(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (lastTouchDistance !== null) {
      setLastTouchDistance(null);
    }
    stopDrawing(e);
  };

  const undo = () => {
    if (history.length <= 1) return;
    
    const currentState = history[history.length - 1];
    setRedoStack([...redoStack, currentState]);
    
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    if (newHistory.length > 0) {
      ctxRef.current.putImageData(newHistory[newHistory.length - 1], 0, 0);
    } else {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawBackground();
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const lastRedo = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    setHistory([...history, lastRedo]);
    setRedoStack(newRedoStack);
    
    ctxRef.current.putImageData(lastRedo, 0, 0);
  };

  const clearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the entire board?")) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawBackground();
      setNotes([]);
      setImageList([]);
      setHistory([]);
      setRedoStack([]);
      saveHistory();
    }
  };

  const downloadCanvas = () => {
    // Create a temporary canvas to composite everything
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    
    // Draw the main canvas
    tempCtx.drawImage(canvasRef.current, 0, 0);
    
    // Draw all notes
    notes.forEach(note => {
      tempCtx.fillStyle = note.color;
      tempCtx.fillRect(note.x, note.y, 200, 40);
      tempCtx.fillStyle = "#000";
      tempCtx.font = "14px Arial";
      tempCtx.fillText(note.text, note.x + 5, note.y + 25);
    });
    
    // Draw all images
    imageList.forEach(img => {
      tempCtx.drawImage(img.element, img.x, img.y, img.width, img.height);
    });
    
    // Create download link
    const link = document.createElement("a");
    link.download = "jamboard-" + new Date().toISOString().slice(0, 10) + ".png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  const addText = (e) => {
    if (tool === "text" && text.trim() !== "") {
      ctxRef.current.fillStyle = color;
      ctxRef.current.font = `${size * 5}px Arial`;
      ctxRef.current.fillText(text, startPos.x, startPos.y);
      saveHistory();
      setText("");
    }
  };

  const addNote = () => {
    if (currentNote.text.trim() !== "") {
      setNotes([...notes, { ...currentNote }]);
      setCurrentNote({ text: "", x: 0, y: 0, color: "#FFEB3B", id: null });
      setShowNoteInput(false);
      renderNotesToCanvas();
    } else {
      setShowNoteInput(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    renderNotesToCanvas();
  };

  const renderNotesToCanvas = () => {
    // We actually don't draw notes directly to canvas
    // We keep them as React components for easier interaction
    // They are only drawn to canvas when exporting
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 300;
          
          if (width > height && width > maxDimension) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else if (height > width && height > maxDimension) {
            width = (width / height) * maxDimension;
            height = maxDimension;
          } else if (width > maxDimension && height > maxDimension) {
            width = maxDimension;
            height = maxDimension;
          }
          
          // Add to image list
          setImageList(prev => [
            ...prev, 
            {
              element: img,
              x: 100,
              y: 100,
              width,
              height,
              id: Date.now() + i
            }
          ]);
        };
        img.src = event.target.result;
      };
      
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`whiteboard-container ${isVisible ? "visible" : "hidden"}`}>
      <div className="whiteboard-toolbar">
        <div className="toolbar-section tools">
          <button className={`tool-btn ${tool === "pen" ? "active" : ""}`} onClick={() => setTool("pen")}>
            <span role="img" aria-label="Pen">✏️</span>
          </button>
          <button className={`tool-btn ${tool === "highlighter" ? "active" : ""}`} onClick={() => setTool("highlighter")}>
            <span role="img" aria-label="Highlighter">🖌️</span>
          </button>
          <button className={`tool-btn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")}>
            <span role="img" aria-label="Eraser">🧽</span>
          </button>
          <button className={`tool-btn ${tool === "line" ? "active" : ""}`} onClick={() => setTool("line")}>
            <span role="img" aria-label="Line">📏</span>
          </button>
          <button className={`tool-btn ${tool === "rectangle" ? "active" : ""}`} onClick={() => setTool("rectangle")}>
            <span role="img" aria-label="Rectangle">⬜</span>
          </button>
          <button className={`tool-btn ${tool === "circle" ? "active" : ""}`} onClick={() => setTool("circle")}>
            <span role="img" aria-label="Circle">⚪</span>
          </button>
          <button className={`tool-btn ${tool === "text" ? "active" : ""}`} onClick={() => setTool("text")}>
            <span role="img" aria-label="Text">🔤</span>
          </button>
          <button className={`tool-btn ${tool === "note" ? "active" : ""}`} onClick={() => setTool("note")}>
            <span role="img" aria-label="Note">📝</span>
          </button>
          <button className="tool-btn" onClick={() => fileInputRef.current.click()}>
            <span role="img" aria-label="Image">🖼️</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: "none" }} 
              multiple
            />
          </button>
        </div>

        <div className="toolbar-section colors">
          <div className="color-palette">
            {presetColors.map((presetColor, index) => (
              <div 
                key={index}
                className={`color-swatch ${color === presetColor ? "active" : ""}`} 
                style={{ backgroundColor: presetColor }}
                onClick={() => setColor(presetColor)}
              />
            ))}
          </div>
          <div className="custom-color">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              title="Choose custom color"
            />
          </div>
        </div>

        <div className="toolbar-section size">
          <span>Size: </span>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={size} 
            onChange={(e) => setSize(parseInt(e.target.value))} 
            className="size-slider"
          />
        </div>

        <div className="toolbar-section backgrounds">
          <select 
            value={currentBackground}
            onChange={(e) => setCurrentBackground(e.target.value)}
            className="background-select"
          >
            {backgrounds.map(bg => (
              <option key={bg.value} value={bg.value}>{bg.name}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-section actions">
          <button onClick={undo} className="action-btn" disabled={history.length <= 1}>
            <span role="img" aria-label="Undo">↩️</span>
          </button>
          <button onClick={redo} className="action-btn" disabled={redoStack.length === 0}>
            <span role="img" aria-label="Redo">↪️</span>
          </button>
          <button onClick={clearCanvas} className="action-btn">
            <span role="img" aria-label="Clear">🗑️</span>
          </button>
          <button onClick={downloadCanvas} className="action-btn">
            <span role="img" aria-label="Download">💾</span>
          </button>
          <div className="zoom-controls">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="zoom-btn">
              <span role="img" aria-label="Zoom Out">➖</span>
            </button>
            <button onClick={resetZoom} className="zoom-btn">
              {(zoom * 100).toFixed(0)}%
            </button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="zoom-btn">
              <span role="img" aria-label="Zoom In">➕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button className="close-whiteboard-btn" onClick={handleClose}>
        <span role="img" aria-label="Close">✖</span>
      </button>

      {tool === "text" && (
        <div className="text-input-container">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={addText}
            onKeyDown={(e) => e.key === 'Enter' && addText()}
            placeholder="Type text and click on the canvas"
            className="text-input"
          />
        </div>
      )}

      {showNoteInput && (
        <div className="note-input-container" style={{ 
          position: 'absolute', 
          left: currentNote.x + 'px', 
          top: currentNote.y + 'px',
          zIndex: 1000
        }}>
          <textarea
            value={currentNote.text}
            onChange={(e) => setCurrentNote({...currentNote, text: e.target.value})}
            placeholder="Type your note here..."
            className="note-textarea"
            autoFocus
          />
          <div className="note-color-picker">
            {["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"].map(noteColor => (
              <div 
                key={noteColor}
                className={`note-color ${currentNote.color === noteColor ? "active" : ""}`}
                style={{ backgroundColor: noteColor }}
                onClick={() => setCurrentNote({...currentNote, color: noteColor})}
              />
            ))}
          </div>
          <div className="note-actions">
            <button onClick={addNote} className="note-btn save">Save</button>
            <button onClick={() => setShowNoteInput(false)} className="note-btn cancel">Cancel</button>
          </div>
        </div>
      )}

      <div 
        className="canvas-container"
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top left',
          cursor: tool === 'eraser' ? 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>\') 10 10, auto' : 
                  tool === 'pen' ? 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>\') 0 24, auto' :
                  'default'
        }}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 70} // Adjust for toolbar height
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Render notes as HTML elements for better interaction */}
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="sticky-note"
            style={{
              position: 'absolute',
              left: note.x + 'px',
              top: note.y + 'px',
              backgroundColor: note.color,
              zIndex: tool === 'eraser' ? -1 : 5
            }}
          >
            <div className="note-header">
              <div className="note-drag-handle"></div>
              <button 
                className="note-delete-btn"
                onClick={() => deleteNote(note.id)}
              >×</button>
            </div>
            <div className="note-content">{note.text}</div>
          </div>
        ))}
        
        {/* Render images */}
        {imageList.map((img) => (
          <div
            key={img.id}
            className="image-container"
            style={{
              position: 'absolute',
              left: img.x + 'px',
              top: img.y + 'px',
              width: img.width + 'px',
              height: img.height + 'px',
              zIndex: tool === 'eraser' ? -1 : 3
            }}
          >
            <img 
              src={img.element.src} 
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
              alt="User uploaded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;