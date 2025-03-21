import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./VideoCallJoin.css";
import { 
  Video, 
  Plus, 
  Copy, 
  ArrowLeft, 
  Users, 
  Calendar, 
  Settings, 
  VideoOff, 
  MicOff, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X
} from "lucide-react";

const VideoCallJoin = () => {
  const [roomId, setRoomId] = useState("");
  const [generatedRoomId, setGeneratedRoomId] = useState(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [previewStream, setPreviewStream] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [userName, setUserName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const videoRef = React.useRef(null);

  // Get project name from localStorage
  useEffect(() => {
    const storedProjectName = localStorage.getItem("project_name") || "Team Meeting";
    setProjectName(storedProjectName);
    
    const storedUserName = localStorage.getItem("user_name") || "";
    setUserName(storedUserName);
    
    // Set up resize listener for responsive design
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up camera preview
  useEffect(() => {
    const setupPreviewStream = async () => {
      try {
        if (cameraOn) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: micOn 
          });
          setPreviewStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else if (previewStream) {
          previewStream.getTracks().forEach(track => track.stop());
          setPreviewStream(null);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setCameraOn(false);
      }
    };
    
    setupPreviewStream();
    
    // Cleanup function
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn, micOn]);

  // Generate a new room ID and store it
  const handleGenerateRoom = () => {
    const newRoomId = uuidv4();
    setGeneratedRoomId(newRoomId);
    setRoomId(newRoomId);
  };

  // Copy room ID to clipboard
  const copyToClipboard = () => {
    const roomLink = `${window.location.origin}/video-call/${generatedRoomId || roomId}`;
    navigator.clipboard.writeText(roomLink);
    
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 3000);
  };

  // Toggle camera
  const toggleCamera = () => {
    setCameraOn(!cameraOn);
  };

  // Toggle microphone
  const toggleMic = () => {
    setMicOn(!micOn);
  };

  // Join Video Call
  const joinRoom = () => {
    if (roomId.trim() !== "") {
      // Stop preview stream before navigating
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
      navigate(`/video-call/${roomId}`);
    } else {
      alert("Please enter or generate a Room ID.");
    }
  };

  // Go back to dashboard
  const goBack = () => {
    // Stop preview stream before navigating
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    
    // Navigate to the appropriate dashboard based on user type
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    navigate(isAdmin ? "/dashboard/admin" : "/dashboard/user");
  };

  return (
    <div className="video-join-container">
      {/* Header */}
      <header className="video-join-header">
        <button onClick={goBack} className="back-button" aria-label="Back to dashboard">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="project-title">
          <Video className="header-icon" />
          {projectName} - Video Meeting
        </h1>
        <div className="user-info">
          <span className="user-name">{userName}</span>
        </div>
      </header>

      <main className="video-join-content">
        <div className="join-card">
          {/* Left panel: Preview */}
          <div className="preview-container">
            <div className="video-preview">
              {cameraOn ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                />
              ) : (
                <div className="no-video">
                  <VideoOff size={48} />
                  <p>Camera is off</p>
                </div>
              )}
              
              {/* Media controls */}
              <div className="media-controls">
                <button 
                  className={`control-btn ${micOn ? 'active' : 'muted'}`}
                  onClick={toggleMic}
                  aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                >
                  {micOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                  ) : (
                    <MicOff size={20} />
                  )}
                </button>
                <button 
                  className={`control-btn ${cameraOn ? 'active' : 'muted'}`}
                  onClick={toggleCamera}
                  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  ) : (
                    <VideoOff size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Room settings */}
          <div className="room-settings">
            <h2>Join a Meeting</h2>
            <p className="settings-subtitle">Enter a code or create a new meeting</p>
            
            <div className="room-input-container">
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter meeting code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="room-input"
                />
              </div>
              <button 
                onClick={handleGenerateRoom}
                className="action-button generate-button"
                aria-label="Generate new meeting code"
              >
                <RefreshCw size={16} />
                <span>New Meeting</span>
              </button>
            </div>
            
            {/* Meeting info */}
            {(generatedRoomId || roomId) && (
              <div className="meeting-info">
                <h3>Meeting Information</h3>
                <div className="meeting-link-container">
                  <input 
                    type="text" 
                    value={`${window.location.origin}/video-call/${generatedRoomId || roomId}`} 
                    readOnly 
                    className="meeting-link"
                  />
                  <button 
                    onClick={copyToClipboard} 
                    className="copy-button"
                    aria-label="Copy meeting link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                {/* Share options */}
                <div className="share-options">
                  <button className="share-option">
                    <Users size={16} />
                    <span>Invite people</span>
                  </button>
                  <button className="share-option">
                    <Calendar size={16} />
                    <span>Add to calendar</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Join meeting button */}
            <button 
              className="join-meeting-button" 
              onClick={joinRoom}
              disabled={!roomId.trim()}
            >
              <Video size={18} />
              <span>Join Meeting</span>
            </button>
          </div>
        </div>
      </main>
      
      {/* Copied notification */}
      {showCopiedAlert && (
        <div className="copied-alert">
          <CheckCircle size={16} />
          <span>Meeting link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default VideoCallJoin;
