import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./VideoConference.css";
import { Edit3, Maximize2, Minimize2 } from 'lucide-react';
import Whiteboard from './Whiteboard';
import './Whiteboard.css';
import BreakoutRoom from './BreakoutRoom';
import axios from "axios";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Share2, 
  StopCircle, 
  Users, 
  MessageSquare, 
  Settings, 
  MoreVertical, 
  ArrowLeft,
  Download,
  Layout,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Copy,
  FileSpreadsheet,
  X,
  Info,
  Loader,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Update the socket.io connection to use proper options
const socket = io("http://127.0.0.1:3001", {
  transports: ["websocket", "polling"], // Try websocket first, fallback to polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  withCredentials: true,
});

// Add connection status monitoring
socket.on("connect", () => {
  console.log("Socket connected successfully with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

const VideoConference = ({ roomId }) => {
  // Main state variables
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [meetingSummary, setMeetingSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [meetingTranscript, setMeetingTranscript] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [layoutMode, setLayoutMode] = useState("grid"); // grid, spotlight, sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [projectName, setProjectName] = useState("Meeting");
  const [recording, setRecording] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info"); // info, success, error, warning
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [summarySource, setSummarySource] = useState("ai"); // "ai", "local", "basic"
  const [summaryJustCopied, setSummaryJustCopied] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState(null);
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [actionItems, setActionItems] = useState([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [meetingTimer, setMeetingTimer] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('excellent'); // 'excellent', 'good', 'poor'
  
  // Breakout room state
  const [showBreakoutRoom, setShowBreakoutRoom] = useState(false);
  
  // Speech recognition state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [meetingHighlights, setMeetingHighlights] = useState([]);
  const [transcriptionStartTime, setTranscriptionStartTime] = useState(null);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Refs for components
  const myVideo = useRef();
  const screenVideoRef = useRef();
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const chatContainerRef = useRef(null);
  const meetingTimerRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const combinedStreamRef = useRef(null);
  const peerConnections = useRef({});
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);
  
  // Retrieve project name from localStorage
  useEffect(() => {
    const storedProjectName = localStorage.getItem("project_name");
    if (storedProjectName) {
      setProjectName(storedProjectName);
    }

    // Set up meeting timer
    meetingTimerRef.current = setInterval(() => {
      setMeetingTime(prevTime => prevTime + 1);
    }, 1000);

    // Set up resize listener for responsive design
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(meetingTimerRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const startMedia = async () => {
      try {
        console.log("[VideoDebug] Starting media stream initialization");
        
        // First check if camera and microphone permissions are available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          console.warn("[VideoDebug] No video devices found");
          showNotificationMessage("No camera detected on your device", "warning");
        }
        
        // Get user media with constraints
        const constraints = {
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        };
        
        console.log("[VideoDebug] Requesting media with constraints:", constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Check if we actually got video tracks
        const videoTracks = mediaStream.getVideoTracks();
        if (videoTracks.length === 0) {
          console.warn("[VideoDebug] No video tracks in the media stream");
          showNotificationMessage("Camera access granted but no video detected", "warning");
        } else {
          console.log("[VideoDebug] Video tracks obtained:", videoTracks.length);
          videoTracks.forEach(track => {
            console.log("[VideoDebug] Video track:", track.label, "enabled:", track.enabled);
          });
        }
        
        // Set the stream state
        setStream(mediaStream);
        
        // Attach stream to video element
        if (myVideo.current) {
          console.log("[VideoDebug] Setting local video stream");
          myVideo.current.srcObject = mediaStream;
          
          // Add event listener to ensure video plays
          myVideo.current.onloadedmetadata = () => {
            console.log("[VideoDebug] Video metadata loaded");
            myVideo.current.play()
              .then(() => console.log("[VideoDebug] Local video playback started"))
              .catch(err => console.error("[VideoDebug] Error playing local video:", err));
          };
          
          console.log("[VideoDebug] Local video:", myVideo.current);
        } else {
          console.error("[VideoDebug] Video ref is null");
        }

        // Add yourself to participants list
        const userName = localStorage.getItem("user_name") || "You";
        setParticipants(prev => [
          ...prev.filter(p => p.id !== socket.id),
          { id: socket.id, name: userName, micOn: true, cameraOn: true, isLocal: true }
        ]);

        // Join the room
        socket.emit("join-room", roomId, socket.id, userName);
        
        // Show notification
        showNotificationMessage("Connected to meeting", "success");
      } catch (error) {
        console.error("[VideoDebug] Error accessing media devices:", error);
        
        // Provide more specific error messages based on the error
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          showNotificationMessage("Camera/microphone access denied. Please check your permissions.", "error");
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          showNotificationMessage("Camera or microphone not found on your device.", "error");
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          showNotificationMessage("Camera or microphone is already in use by another application.", "error");
        } else {
          showNotificationMessage("Failed to access camera/microphone: " + error.message, "error");
        }
      }
    };

    startMedia();

    // Listen for remote participants
    socket.on("user-joined", (user) => {
      setParticipants(prev => [...prev, { id: user.id, name: user.name || "Guest", micOn: true, cameraOn: true }]);
      showNotificationMessage(`${user.name || "A participant"} joined the meeting`, "info");
    });
    
    socket.on("user-left", (userId) => {
      const leavingUser = participants.find(p => p.id === userId);
      setParticipants(prev => prev.filter(p => p.id !== userId));
      showNotificationMessage(`${leavingUser?.name || "A participant"} left the meeting`, "info");
    });
    
    socket.on("new-producer", ({ producerId, userId }) => {
      socket.emit("consume", { producerId, rtpCapabilities: {} }, (consumer) => {
        if (!consumer) return;
        
        const newStream = new MediaStream();
        newStream.addTrack(consumer.track);
        newStream.userId = userId;
        setRemoteStreams(prev => [...prev, newStream]);
      });
    });

    // Updates for mic and camera states
    socket.on("mic-toggle", ({ userId, micOn }) => {
      updateParticipant(userId, { micOn });
    });
    
    socket.on("camera-toggle", ({ userId, cameraOn }) => {
      updateParticipant(userId, { cameraOn });
    });

    // Chat messages
    socket.on("chat-message", (message) => {
      setChatMessages(prev => [...prev, message]);
      if (!showChat) {
        showNotificationMessage(`New message from ${message.sender}`, "info");
      }
    });

    // Handle screen sharing events
    socket.on('screen-share-started', (userId) => {
      console.log(`User ${userId} started screen sharing`);
      // Update the participant's screen sharing status
      setParticipants(prev => 
        prev.map(p => p.id === userId ? {...p, isScreenSharing: true} : p)
      );
    });
    
    socket.on('screen-share-stopped', (userId) => {
      console.log(`User ${userId} stopped screen sharing`);
      // Update the participant's screen sharing status
      setParticipants(prev => 
        prev.map(p => p.id === userId ? {...p, isScreenSharing: false} : p)
      );
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (screenStream) screenStream.getTracks().forEach(track => track.stop());
      
      // Clear all socket listeners
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("new-producer");
      socket.off("mic-toggle");
      socket.off("camera-toggle");
      socket.off("chat-message");
      socket.off('screen-share-started');
      socket.off('screen-share-stopped');
    };
  }, [roomId]);

  // Active speaker detection
  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    analyser.current = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser.current);
    analyser.current.fftSize = 256;

    const bufferLength = analyser.current.frequencyBinCount;
    dataArray.current = new Uint8Array(bufferLength);

    const detectSpeaking = () => {
      if (!analyser.current || !dataArray.current) return;

      analyser.current.getByteFrequencyData(dataArray.current);
      const volume = dataArray.current.reduce((sum, val) => sum + val, 0) / bufferLength;

      if (volume > 10 && micOn) {
        setActiveSpeaker(socket.id);
      } else {
        setActiveSpeaker(null);
      }

      requestAnimationFrame(detectSpeaking);
    };

    detectSpeaking();

    return () => {
      audioContext.close();
    };
  }, [stream, micOn]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Helper function to update participant state
  const updateParticipant = (userId, changes) => {
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, ...changes } : p)
    );
  };

  // Toggle mic on/off
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
      
      // Update yourself in participants list
      updateParticipant(socket.id, { micOn: audioTrack.enabled });
      
      // Notify others of change
      socket.emit("mic-toggle", { userId: socket.id, micOn: audioTrack.enabled });
      
      // Show notification
      showNotificationMessage(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`, "info");
    }
  };

  // Toggle camera function with completely new implementation to fix camera issues
  const toggleCamera = async () => {
    try {
      console.log("[VideoDebug] Toggle camera called, current state:", cameraOn);
      
      if (cameraOn) {
        // Turn camera off
        console.log("[VideoDebug] Turning camera off");
        
        if (stream) {
          const videoTracks = stream.getVideoTracks();
          console.log("[VideoDebug] Found video tracks:", videoTracks.length);
          
          // Instead of just disabling tracks, we'll stop them completely
          videoTracks.forEach(track => {
            console.log("[VideoDebug] Stopping track:", track.label);
            track.stop(); // Stop the track completely
          });
          
          // Keep only audio tracks in the stream
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            const audioOnlyStream = new MediaStream(audioTracks);
            setStream(audioOnlyStream);
            
            // Update local video element with audio-only stream
            if (myVideo.current) {
              console.log("[VideoDebug] Updating video element with audio-only stream");
              myVideo.current.srcObject = audioOnlyStream;
            }
          }
        }
        
        // Update UI state
        setCameraOn(false);
        
        // Notify other participants
        socket.emit('toggle-camera', { roomId, cameraOn: false });
        
        console.log("[VideoDebug] Camera turned off successfully");
        showNotificationMessage("Camera turned off", "success");
      } else {
        // Turn camera on
        console.log("[VideoDebug] Turning camera on");
        
        try {
          // Always get a fresh video stream with specific constraints
          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }
          };
          
          console.log("[VideoDebug] Requesting video with constraints:", constraints);
          const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          const videoTracks = videoStream.getVideoTracks();
          if (videoTracks.length === 0) {
            throw new Error("No video tracks obtained from getUserMedia");
          }
          
          const videoTrack = videoTracks[0];
          console.log("[VideoDebug] Got new video track:", videoTrack.label);
          
          // Get audio tracks from existing stream or request new ones
          let audioTracks = [];
          if (stream && stream.getAudioTracks().length > 0) {
            audioTracks = stream.getAudioTracks();
            console.log("[VideoDebug] Using existing audio tracks:", audioTracks.length);
          } else {
            try {
              console.log("[VideoDebug] Requesting new audio");
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              audioTracks = audioStream.getAudioTracks();
              console.log("[VideoDebug] Got new audio tracks:", audioTracks.length);
            } catch (audioError) {
              console.error("[VideoDebug] Could not get audio:", audioError);
              // Continue without audio if we can't get it
            }
          }
          
          // Create a new combined stream with both audio and video
          const combinedStream = new MediaStream([...audioTracks, videoTrack]);
          console.log("[VideoDebug] Created combined stream with tracks:", combinedStream.getTracks().length);
          
          // Update the stream state
          setStream(combinedStream);
          
          // Update the video element with the new stream
          if (myVideo.current) {
            console.log("[VideoDebug] Updating video element with new stream");
            myVideo.current.srcObject = combinedStream;
            
            // Make sure the video plays
            myVideo.current.onloadedmetadata = () => {
              console.log("[VideoDebug] Video metadata loaded, playing video");
              myVideo.current.play()
                .then(() => console.log("[VideoDebug] Video playback started"))
                .catch(err => console.error("[VideoDebug] Error playing video:", err));
            };
          } else {
            console.error("[VideoDebug] Video ref is null");
          }
          
          // Handle WebRTC peer connections if they exist
          if (peerConnections && peerConnections.current) {
            const pcs = peerConnections.current;
            console.log("[VideoDebug] Updating peer connections with new video track");
            
            Object.values(pcs).forEach(pc => {
              try {
                // Find existing video sender
                const senders = pc.getSenders();
                const videoSender = senders.find(sender => 
                  sender.track && sender.track.kind === 'video'
                );
                
                if (videoSender) {
                  // Replace existing track
                  console.log("[VideoDebug] Replacing video track in peer connection");
                  videoSender.replaceTrack(videoTrack).catch(err => {
                    console.error("[VideoDebug] Error replacing track:", err);
                  });
                } else {
                  // Add new track
                  console.log("[VideoDebug] Adding new video track to peer connection");
                  pc.addTrack(videoTrack, combinedStream);
                }
              } catch (peerError) {
                console.error("[VideoDebug] Error updating peer connection:", peerError);
              }
            });
          } else {
            console.log("[VideoDebug] No peer connections to update");
          }
          
          // Update UI state
          setCameraOn(true);
          
          // Notify other participants
          socket.emit('toggle-camera', { roomId, cameraOn: true });
          
          console.log("[VideoDebug] Camera turned on successfully");
          showNotificationMessage("Camera turned on", "success");
        } catch (error) {
          console.error("[VideoDebug] Error turning on camera:", error);
          
          // Provide specific error messages based on the error type
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            showNotificationMessage("Camera access denied. Please check your browser permissions.", "error");
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            showNotificationMessage("No camera found on your device.", "error");
          } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            showNotificationMessage("Camera is already in use by another application.", "error");
          } else if (error.name === 'OverconstrainedError') {
            showNotificationMessage("Camera doesn't support requested resolution.", "error");
          } else {
            showNotificationMessage("Failed to turn on camera: " + error.message, "error");
          }
          
          toast.error("Camera error: " + error.message);
        }
      }
    } catch (error) {
      console.error("[VideoDebug] Unexpected error toggling camera:", error);
      toast.error("Failed to toggle camera: " + error.message);
      showNotificationMessage("Camera operation failed", "error");
    }
  };

  // Debug function to help troubleshoot video issues
  const logVideoState = useCallback((type, element, stream) => {
    console.log(`[VideoDebug] ${type} video:`, {
      element: element,
      hasStream: !!stream,
      streamTracks: stream ? stream.getTracks().map(t => ({ 
        kind: t.kind, 
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })) : 'No tracks'
    });
  }, []);

  // Effect for local video (camera)
  useEffect(() => {
    if (stream && myVideo.current) {
      // For local video
      console.log("[VideoDebug] Setting local video stream");
      try {
        myVideo.current.srcObject = stream;
        logVideoState('Local', myVideo.current, stream);
      } catch (err) {
        console.error("Error setting local video stream:", err);
      }
    }
  }, [stream, logVideoState]);

  // Effect for screen sharing
  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      // For screen sharing
      console.log("[VideoDebug] Setting screen sharing stream");
      try {
        screenVideoRef.current.srcObject = screenStream;
        logVideoState('Screen', screenVideoRef.current, screenStream);
      } catch (err) {
        console.error("Error setting screen sharing stream:", err);
      }
    }
  }, [screenStream, logVideoState]);

  // Screen sharing functionality with fixed camera handling
  const toggleScreenShare = async () => {
    try {
      if (screenSharing) {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
        }
        setScreenSharing(false);
        
        // Notify other participants
        socket.emit('screen-share-stopped', socket.id);
        
        // Ensure camera stays on after stopping screen share
        if (cameraOn) {
          // If camera should be on, use our improved restart camera function
          console.log("Restarting camera after screen share");
          await restartCamera();
        } else {
          console.log("Camera was off before screen share, keeping it off");
          // If camera was off, make sure it stays off
          if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
              if (!track.stopped) {
                track.stop();
              }
            });
          }
        }
      } else {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor",
            frameRate: 30
          },
          audio: false // Don't capture audio from screen to avoid echo
        });
        
        // Store screen stream separately from camera stream
        setScreenStream(displayStream);
        setScreenSharing(true);
        
        // Set up screen video
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = displayStream;
        }
        
        // Handle stream ending (user stops sharing)
        displayStream.getVideoTracks()[0].onended = async () => {
          setScreenSharing(false);
          setScreenStream(null);
          socket.emit('screen-share-stopped', socket.id);
          
          // Ensure camera state is properly restored
          if (cameraOn) {
            // If camera should be on, use our improved restart camera function
            console.log("Restarting camera after screen share ended");
            await restartCamera();
          } else {
            console.log("Camera was off before screen share, keeping it off");
            // If camera was off, make sure it stays off
            if (stream) {
              const videoTracks = stream.getVideoTracks();
              videoTracks.forEach(track => {
                if (!track.stopped) {
                  track.stop();
                }
              });
            }
          }
        };
        
        // Notify other participants
        socket.emit('screen-share-started', socket.id);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Failed to share screen");
    }
  };

  // Helper function to restart camera
  const restartCamera = async () => {
    try {
      // Stop any existing video tracks first
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => track.stop());
      }
      
      // Get fresh video stream
      const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      
      // Get audio from existing stream
      let audioTracks = [];
      if (stream) {
        audioTracks = stream.getAudioTracks();
      } else {
        // If no stream exists, also get audio permission
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioTracks = audioStream.getAudioTracks();
        } catch (audioError) {
          console.error("Could not get audio:", audioError);
        }
      }
      
      // Create a new combined stream
      const newStream = new MediaStream([...audioTracks, newVideoTrack]);
      setStream(newStream);
      
      // Update video element
      if (myVideo.current) {
        myVideo.current.srcObject = newStream;
        
        // Ensure video plays after metadata is loaded
        myVideo.current.onloadedmetadata = () => {
          myVideo.current.play().catch(err => {
            console.error("Error playing restarted camera:", err);
          });
        };
      }
      
      // Update peer connections with new track
      if (peerConnections.current) {
        Object.values(peerConnections.current).forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender) {
            console.log("Replacing video track in peer connection");
            videoSender.replaceTrack(newVideoTrack);
          } else {
            console.log("Adding new video track to peer connection");
            pc.addTrack(newVideoTrack, newStream);
          }
        });
      }
      
      setCameraOn(true);
      socket.emit('toggle-camera', roomId, true);
      
      console.log("Camera restarted successfully");
      return true;
    } catch (error) {
      console.error("Error restarting camera:", error);
      toast.error("Failed to restart camera");
      return false;
    }
  };

  // Effect to ensure camera stays visible during screen sharing
  useEffect(() => {
    // When screen sharing starts, make sure local video is visible
    if (screenSharing && myVideo.current && stream) {
      // Ensure the video element has the correct stream
      myVideo.current.srcObject = stream;
      
      // Make sure it's playing
      myVideo.current.play().catch(err => {
        console.error("Error playing local video during screen sharing:", err);
      });
    }
  }, [screenSharing, stream]);

  // Effect to handle camera state when screen sharing changes
  useEffect(() => {
    // When screen sharing stops, ensure camera is properly restored
    if (!screenSharing && cameraOn && stream) {
      // Small delay to ensure proper transition
      const timer = setTimeout(() => {
        // Check if video tracks are enabled
        const videoTracks = stream.getVideoTracks();
        
        if (videoTracks.length === 0 || !videoTracks[0].enabled) {
          // If camera should be on but tracks are disabled or missing, restart camera
          restartCamera();
        } else if (myVideo.current) {
          // Ensure video element is properly connected to stream
          myVideo.current.srcObject = stream;
          myVideo.current.play().catch(err => {
            console.error("Error playing video after screen share stopped:", err);
          });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [screenSharing, cameraOn, stream]);

  // Toggle participants sidebar
  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
    if (showChat && !showParticipants) setShowChat(false);
  };

  // Toggle chat sidebar
  const toggleChat = () => {
    setShowChat(!showChat);
    if (showParticipants && !showChat) setShowParticipants(false);
  };

  // Send chat message
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        sender: participants.find(p => p.id === socket.id)?.name || "You",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isLocal: true
      };
      
      socket.emit("chat-message", {
        room: roomId,
        message: messageData
      });
      
      setChatMessages(prev => [...prev, messageData]);
      setNewMessage("");
    }
  };

  // Toggle layout mode
  const toggleLayout = () => {
    const layouts = ["grid", "spotlight", "sidebar"];
    const currentIndex = layouts.indexOf(layoutMode);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setLayoutMode(layouts[nextIndex]);
    showNotificationMessage(`Layout changed to ${layouts[nextIndex]}`, "info");
  };

  // Implement proper recording functionality with download
  const toggleRecording = () => {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Set up recording of the meeting
  const startRecording = async () => {
    try {
      // Create a combined stream of video and screen share if available
      const streams = [];
      
      // Add camera and audio
      if (stream) {
        streams.push(stream);
      }
      
      // Add screen sharing if active
      if (screenSharing && screenStream) {
        streams.push(screenStream);
      }
      
      // If no streams available, show error
      if (streams.length === 0) {
        showNotificationMessage("No streams available to record", "error");
        return;
      }
      
      // Combine all tracks into one stream
      const videoTracks = streams.flatMap(s => s.getVideoTracks());
      const audioTracks = streams.flatMap(s => s.getAudioTracks());
      
      if (videoTracks.length === 0) {
        showNotificationMessage("No video available to record", "warning");
      }
      
      const combinedStream = new MediaStream([
        ...videoTracks,
        ...audioTracks
      ]);
      
      combinedStreamRef.current = combinedStream;
      
      // Set up MediaRecorder with optimal settings
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: getSupportedMimeType(),
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setRecordedChunks(prevChunks => [...prevChunks, e.data]);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: getSupportedMimeType() });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setRecordingReady(true);
        showNotificationMessage("Recording is ready to download", "success");
      };
      
      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setRecording(true);
      
      showNotificationMessage("Meeting recording started", "success");
    } catch (error) {
      console.error("Error starting recording:", error);
      showNotificationMessage(`Recording failed: ${error.message}`, "error");
    }
  };

  // Update stopRecording function to auto-download the file
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: getSupportedMimeType() });
        const url = URL.createObjectURL(blob);
        
        // Auto-download the recording
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        setRecordingUrl(url);
        setRecordingReady(true);
        showNotificationMessage("Recording downloaded", "success");
      };
      
      mediaRecorder.stop();
      showNotificationMessage("Processing recording...", "info");
    }
    
    setRecording(false);
    
    // Clean up combined stream
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach(track => {
        // Only stop tracks that are not from the main stream or screen share
        if (!stream?.getTracks().includes(track) && 
            !screenStream?.getTracks().includes(track)) {
          track.stop();
        }
      });
    }
  };

  // Download the recorded video
  const downloadRecording = () => {
    if (recordingReady && recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }
  };

  // Get supported MIME type for recording
  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using recording MIME type: ${type}`);
        return type;
      }
    }
    
    return 'video/webm'; // Fallback
  };

  // Toggle AI summarizer
  const toggleAISummarizer = () => {
    if (isTranscribing) {
      // Stop transcription and generate summary
      stopTranscription();
    } else {
      // Clear any previous transcript text before starting
      setTranscriptText('');
      // Start transcription
      startTranscription();
    }
  };

  // Start voice transcription
  const startTranscription = () => {
    // Reset transcript text when starting new recording
    setTranscriptText('');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    try {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsTranscribing(true);
        setTranscriptionStartTime(new Date());
        toast.success('AI Meeting Summarizer started');
      };
      
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (final) {
          console.log("Captured final text:", final);
          setTranscriptText(prev => prev + final);
        }
        
        setInterimTranscript(interim);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          // This is a common error, don't show to user
          return;
        }
        toast.error(`Speech recognition error: ${event.error}`);
      };
      
      recognition.onend = () => {
        // Restart recognition if we're still in transcribing mode
        if (isTranscribing) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
          }
        }
      };
      
      recognition.start();
      setRecognitionInstance(recognition);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  };

  // Stop voice transcription
  const stopTranscription = () => {
    console.log("Stopping transcription, transcript length:", transcriptText.length);
    
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    
    setIsTranscribing(false);
    setInterimTranscript('');
    
    // Generate summary if we have transcript text
    if (transcriptText && transcriptText.trim() && transcriptText.trim().length > 10) {
      console.log("Generating summary from transcript:", transcriptText);
      setLoadingSummary(true);
      generateMeetingSummary();
    } else {
      console.log("No transcript text to summarize");
      toast.error('No speech detected - please speak during recording');
      // Clear any existing summary
      setMeetingSummary('');
      setMeetingHighlights([]);
      setActionItems([]);
    }
  };

  // Helper function to extract highlights from transcript
  const extractHighlights = (text) => {
    const highlights = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Look for sentences with key phrases
    const keyPhrases = [
      'important', 'key', 'critical', 'essential', 'crucial',
      'highlight', 'focus', 'priority', 'main point', 'remember',
      'take note', 'significant', 'major', 'primary'
    ];
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (keyPhrases.some(phrase => lower.includes(phrase))) {
        // Clean up the sentence
        let cleanSentence = sentence.trim();
        // Capitalize first letter
        cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
        // Add period if missing
        if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
          cleanSentence += '.';
        }
        highlights.push(cleanSentence);
      }
    }
    
    // If we don't have enough highlights, add some longer sentences
    if (highlights.length < 3) {
      const longSentences = sentences
        .filter(s => s.trim().length > 50)
        .sort((a, b) => b.length - a.length)
        .slice(0, 5 - highlights.length)
        .map(s => {
          // Clean up the sentence
          let cleanSentence = s.trim();
          // Capitalize first letter
          cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
          // Add period if missing
          if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
            cleanSentence += '.';
          }
          return cleanSentence;
        });
      
      highlights.push(...longSentences);
    }
    
    // Limit to 5 highlights and remove duplicates
    return [...new Set(highlights)].slice(0, 5);
  };

  // Helper function to extract action items from transcript
  const extractActionItems = (text) => {
    const actionItems = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Look for sentences with action item phrases
    const actionPhrases = [
      'need to', 'should', 'will', 'must', 'going to',
      'task', 'action item', 'follow up', 'follow-up', 'todo',
      'to do', 'to-do', 'assign', 'responsibility', 'deadline'
    ];
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (actionPhrases.some(phrase => lower.includes(phrase))) {
        // Clean up the sentence
        let cleanSentence = sentence.trim();
        // Capitalize first letter
        cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
        // Add period if missing
        if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
          cleanSentence += '.';
        }
        actionItems.push(cleanSentence);
      }
    }
    
    // Limit to 5 action items and remove duplicates
    return [...new Set(actionItems)].slice(0, 5);
  };

  // Helper function to generate an overview
  const generateOverview = (text) => {
    // Clean up the text first
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Split into sentences
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Take the first 2-3 sentences for the overview
    const selectedSentences = sentences.slice(0, Math.min(3, sentences.length));
    
    // Clean up and format sentences
    const formattedSentences = selectedSentences.map(s => {
      let cleanSentence = s.trim();
      // Capitalize first letter
      cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
      // Add period if missing
      if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
        cleanSentence += '.';
      }
      return cleanSentence;
    });
    
    return formattedSentences.join(' ');
  };

  // Generate meeting summary using AI
  const generateMeetingSummary = async (textOverride) => {
    const textToSummarize = textOverride || transcriptText;
    
    if (!textToSummarize || !textToSummarize.trim()) {
      toast.error('No transcript available to summarize');
      setLoadingSummary(false);
      return;
    }
    
    setShowSummaryModal(true);
    
    try {
      console.log("Generating summary from text of length:", textToSummarize.length);
      
      // For demonstration, we'll simulate an API call to an AI service
      // In a real implementation, you would call your backend API that uses
      // OpenAI, Azure, or another AI service to generate the summary
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a structured summary
      const duration = transcriptionStartTime 
        ? Math.floor((new Date() - transcriptionStartTime) / 60000) 
        : 1; // Default to 1 minute if no start time
      
      // Extract potential highlights based on common meeting phrases
      const highlights = extractHighlights(textToSummarize);
      
      // Extract potential action items
      const actions = extractActionItems(textToSummarize);
      
      // Generate overview
      const overview = generateOverview(textToSummarize);
      
      // Generate summary text
      const summary = `## Meeting Summary
**Duration:** ${duration} minutes
**Date:** ${new Date().toLocaleDateString()}
**Time:** ${new Date().toLocaleTimeString()}

### Overview
${overview}

### Key Points
${highlights.map(h => `- ${h}`).join('\n')}

### Action Items
${actions.map(a => `- ${a}`).join('\n')}`;
      
      console.log("Generated summary:", summary);
      setMeetingSummary(summary);
      setMeetingHighlights(highlights);
      setActionItems(actions);
      setLoadingSummary(false);
      
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      toast.error('Failed to generate meeting summary');
      setLoadingSummary(false);
    }
  };

  // Download meeting summary
  const downloadMeetingSummary = () => {
    if (!meetingSummary) return;
    
    const element = document.createElement('a');
    const file = new Blob([meetingSummary], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `meeting-summary-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    setTimeout(() => {
      document.body.removeChild(element);
    }, 100);
    
    toast.success('Meeting summary downloaded');
  };

  // Copy meeting summary to clipboard
  const copyMeetingSummary = () => {
    if (!meetingSummary) return;
    
    navigator.clipboard.writeText(meetingSummary)
      .then(() => toast.success('Meeting summary copied to clipboard'))
      .catch(() => toast.error('Failed to copy meeting summary'));
  };

  // Show notification message
  const showNotificationMessage = (message, type = "info") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Get participant video element
  const renderParticipantVideo = (participant, index) => {
    const isLocal = participant.id === socket.id;
    const stream = isLocal ? stream : remoteStreams.find(s => s.userId === participant.id);
    const isSpeaking = activeSpeaker === participant.id;
    
    return (
      <div 
        key={participant.id} 
        className={`video-box ${isSpeaking ? 'active-speaker' : ''} ${!participant.cameraOn ? 'camera-off' : ''}`}
      >
        {participant.cameraOn && stream ? (
          <video
            ref={isLocal ? myVideo : null}
            autoPlay
            playsInline
            muted={isLocal}
            className={isLocal ? 'mirror' : ''}
            srcObject={stream}
          />
        ) : (
          <div className="avatar-placeholder">
            <div className="avatar-circle">
              {participant.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <div className="participant-info">
          <span className="participant-name">
            {participant.name} {isLocal && "(You)"}
          </span>
          <div className="participant-status">
            {!participant.micOn && <MicOff size={16} className="status-icon muted" />}
          </div>
        </div>
      </div>
    );
  };

  // Handle remote video element creation and srcObject assignment
  const handleRemoteVideoRef = useCallback((element, stream) => {
    if (element && stream) {
      try {
        if (element.srcObject !== stream) {
          element.srcObject = stream;
          logVideoState('Remote', element, stream);
        }
      } catch (err) {
        console.error("Error setting remote video stream:", err);
      }
    }
  }, [logVideoState]);

  // End call and navigate back
  const handleEndCall = () => {
    // Stop all streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect from socket
    socket.emit("leave-room", roomId);
    socket.disconnect();
    
    // Navigate back to dashboard (user dashboard as fallback)
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    navigate(isAdmin ? "/dashboard/admin" : "/dashboard/user");
  };

  // Format the meeting time (seconds to MM:SS)
  const formatMeetingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navigate = useNavigate();

  // Monitor connection quality (simulated for now)
  const monitorConnectionQuality = useCallback(() => {
    const qualities = ['excellent', 'good', 'poor'];
    const randomQuality = () => {
      // Weighted random to favor excellent and good over poor
      const rand = Math.random();
      if (rand < 0.6) return 'excellent';
      if (rand < 0.9) return 'good';
      return 'poor';
    };
    
    const intervalId = setInterval(() => {
      setConnectionQuality(randomQuality());
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const cleanup = monitorConnectionQuality();
    return cleanup;
  }, [monitorConnectionQuality]);

  // Add meeting info state
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [meetingCode, setMeetingCode] = useState('');
  
  // Generate a meeting code on component mount
  useEffect(() => {
    // Generate a random meeting code like Google Meet (3 groups of 3 letters)
    const generateMeetingCode = () => {
      const chars = 'abcdefghijkmnpqrstuvwxyz';
      let code = '';
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) code += '-';
      }
      return code;
    };
    
    setMeetingCode(generateMeetingCode());
  }, []);
  
  // Toggle meeting info panel
  const toggleMeetingInfo = () => {
    setShowMeetingInfo(!showMeetingInfo);
  };
  
  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meetingCode}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success('Meeting link copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy meeting link:', err);
        toast.error('Failed to copy meeting link');
      });
  };

  const toggleWhiteboard = () => {
    // When opening the whiteboard, automatically set it to fullscreen
    if (!showWhiteboard) {
      setShowWhiteboard(true);
      setIsWhiteboardFullscreen(true);
    } else {
      // When closing, make sure to reset both states
      setShowWhiteboard(false);
      setIsWhiteboardFullscreen(false);
    }
    
    // Close other panels when whiteboard is opened
    if (showChat) setShowChat(false);
    if (showParticipants) setShowParticipants(false);
  };
  
  const toggleWhiteboardFullscreen = () => {
    setIsWhiteboardFullscreen(!isWhiteboardFullscreen);
  };

  const toggleBreakoutRoom = () => {
    setShowBreakoutRoom(!showBreakoutRoom);
  };

  const closeBreakoutRoom = () => {
    setShowBreakoutRoom(false);
  };

  return (
    <div className="video-conference">
      {/* Video background with gradient overlay */}
      <div className="video-background-overlay"></div>
      
      {/* Top bar with meeting info and connection quality */}
      <div className="top-bar">
        <div className="connection-quality">
          <div className={`quality-indicator quality-${connectionQuality}`}></div>
          <span className="quality-text">
            {connectionQuality === 'excellent' ? 'Excellent' : 
             connectionQuality === 'good' ? 'Good' : 
             'Poor'}
          </span>
        </div>
        
        <div className="meeting-info-bar">
          <div className="meeting-name">Team Meeting</div>
          <button 
            className="meeting-info-btn"
            onClick={toggleMeetingInfo}
            title="Meeting information"
          >
            <Info size={20} />
          </button>
        </div>
        
        <div className="top-right-actions">
          <div className="meeting-timer">
            {formatMeetingTime(meetingTime)}
          </div>
          <button 
            className="layout-toggle-btn"
            onClick={toggleLayout}
            title="Change layout"
          >
            <Layout size={20} />
          </button>
        </div>
      </div>
      
      {/* Meeting info panel */}
      {showMeetingInfo && (
        <div className="meeting-info-panel">
          <div className="meeting-info-header">
            <h3>Meeting information</h3>
            <button 
              className="close-btn"
              onClick={toggleMeetingInfo}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="meeting-info-content">
            <div className="meeting-code-section">
              <span className="meeting-code-label">Meeting code</span>
              <div className="meeting-code">{meetingCode}</div>
            </div>
            <button 
              className="copy-link-btn"
              onClick={copyMeetingLink}
            >
              <Copy size={16} />
              <span>Copy meeting link</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Video Grid */}
      <div className={`video-grid ${screenSharing ? 'screen-active' : ''} ${showWhiteboard ? 'whiteboard-active' : ''} layout-${layoutMode}`}>
        {screenSharing ? (
          // Screen sharing layout
          <div className="screen-sharing-layout">
            {/* Main screen share display */}
            <div className="screen-share-container">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="screen-share-video"
              />
              <div className="screen-share-label">
                Your screen
              </div>
            </div>
            
            {/* Video feeds in sidebar when screen sharing */}
            <div className="video-feeds-sidebar">
              {/* Local video */}
              <div className="sidebar-video local-video-container">
                <video
                  ref={myVideo}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
                
                {!cameraOn && (
                  <div className="video-placeholder">
                    <div className="avatar-circle-small">
                      {participants.find(p => p.id === socket.id)?.name.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                )}
                
                <div className="local-video-overlay">
                  <div className="video-label">
                    {participants.find(p => p.id === socket.id)?.name || 'You'} {micOn ? '' : '(Muted)'}
                  </div>
                </div>
              </div>
              
              {/* Remote participants */}
              {participants
                .filter(p => p.id !== socket.id)
                .map(participant => (
                  <div key={participant.id} className="sidebar-video participant-tile">
                    <video
                      ref={el => {
                        if (el && remoteStreams.find(s => s.userId === participant.id)) {
                          el.srcObject = remoteStreams.find(s => s.userId === participant.id).stream;
                          el.play().catch(err => console.error("Error playing remote video:", err));
                        }
                      }}
                      autoPlay
                      playsInline
                      className="participant-tile-video"
                    />
                    
                    {(!participant.cameraOn || !remoteStreams.find(s => s.userId === participant.id)) && (
                      <div className="video-placeholder">
                        <div className="avatar-circle-small">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    <div className="participant-tile-info">
                      <div className="participant-tile-name">
                        {participant.name}
                      </div>
                      <div className="participant-tile-status">
                        {!participant.micOn && (
                          <MicOff size={12} className="participant-tile-status-icon muted" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          // Normal video grid layout when not screen sharing
          <>
            {/* Local video container */}
            <div className="local-video-container">
              <video
                ref={myVideo}
                autoPlay
                playsInline
                muted
                className={`local-video ${!cameraOn ? 'hidden' : ''}`}
              />
              
              {!cameraOn && (
                <div className="video-placeholder">
                  <div className="avatar-circle">
                    {participants.find(p => p.id === socket.id)?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              )}
              
              <div className="local-video-overlay">
                <div className="video-label">
                  {participants.find(p => p.id === socket.id)?.name || 'You'} {micOn ? '' : '(Muted)'}
                </div>
              </div>
            </div>

            {/* Remote participants */}
            <div className="participants-videos">
              {participants
                .filter(p => p.id !== socket.id)
                .map(participant => renderParticipantVideo(participant))}
            </div>
          </>
        )}
        
        {/* Add Whiteboard component */}
        {showWhiteboard && (
          <div className={`whiteboard-container ${isWhiteboardFullscreen ? 'fullscreen' : ''}`}>
            <div className="whiteboard-header">
              <h3>Whiteboard</h3>
              <button
                className="whiteboard-fullscreen-btn"
                onClick={toggleWhiteboardFullscreen}
                title={isWhiteboardFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isWhiteboardFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
              <Whiteboard 
                roomId={roomId}
                userId={socket.id}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      <div className="floating-action-menu">
        <button 
          className={`floating-action-btn ${showParticipants ? 'active' : ''}`}
          onClick={toggleParticipants}
          title="Show participants"
        >
          <Users size={20} />
        </button>
        <button 
          className={`floating-action-btn ${showChat ? 'active' : ''}`}
          onClick={toggleChat}
          title="Show chat"
        >
          <MessageSquare size={20} />
        </button>
        <button 
          className={`floating-action-btn ${isTranscribing ? 'active' : ''}`}
          onClick={toggleAISummarizer}
          title="AI Meeting Summary"
        >
          <FileText size={20} />
        </button>
        <button 
          className={`floating-action-btn ${showBreakoutRoom ? 'active' : ''}`}
          onClick={toggleBreakoutRoom}
          title="Breakout Rooms"
        >
          <UserPlus size={20} />
        </button>
        <button 
          className={`floating-action-btn ${showWhiteboard ? 'active' : ''}`}
          onClick={toggleWhiteboard}
          title="Whiteboard"
        >
          <Edit3 size={20} />
        </button>
      </div>

      {/* Call Controls - Google Meet style */}
      <div className="call-controls google-meet-controls">
        <button
          className={`control-btn ${micOn ? '' : 'off'}`}
          onClick={toggleMic}
          title={micOn ? "Turn off microphone" : "Turn on microphone"}
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          <span className="control-btn-label">{micOn ? "Mic" : "Mic off"}</span>
        </button>
        <button
          className={`control-btn ${cameraOn ? '' : 'off'}`}
          onClick={toggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
          <span className="control-btn-label">{cameraOn ? "Camera" : "Camera off"}</span>
        </button>
        <button
          className={`control-btn ${screenSharing ? 'active' : ''}`}
          onClick={toggleScreenShare}
          title={screenSharing ? "Stop sharing screen" : "Share screen"}
        >
          <Share2 size={24} />
          <span className="control-btn-label">{screenSharing ? "Stop" : "Present"}</span>
        </button>
        <button
          className={`control-btn ${recording ? 'active' : ''}`}
          onClick={toggleRecording}
          title={recording ? "Stop recording" : "Start recording"}
        >
          <StopCircle size={24} />
          <span className="control-btn-label">{recording ? "Stop" : "Record"}</span>
        </button>
        <button
          className="control-btn more-options-btn"
          onClick={() => navigate(-1)}
          title="End call"
        >
          <Phone size={24} />
          <span className="control-btn-label">End</span>
        </button>
      </div>

      {/* Participants panel with Google Meet style */}
      {showParticipants && (
        <div className="participants-panel">
          <div className="panel-header">
            <h3>People ({participants.length})</h3>
            <button 
              className="close-btn"
              onClick={toggleParticipants}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="panel-content">
            <div className="participants-list">
              {participants.map(participant => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-avatar-small">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="participant-details">
                    <div className="participant-name">
                      {participant.name} {participant.id === socket.id && ' (You)'}
                    </div>
                    <div className="participant-status-icons">
                      {!participant.micOn && (
                        <MicOff size={16} className="status-icon muted" />
                      )}
                      {!participant.cameraOn && (
                        <VideoOff size={16} className="status-icon" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat panel */}
      {showChat && (
        <div className="chat-panel">
          <div className="panel-header">
            <h3>Chat</h3>
            <button 
              className="close-btn"
              onClick={toggleChat}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="chat-messages" ref={chatContainerRef}>
            {chatMessages.map((message, index) => (
              <div key={index} className="chat-message">
                <div className="message-sender">
                  {message.sender === participants.find(p => p.id === socket.id)?.name ? 'You' : message.sender}
                </div>
                <div className={`message-content ${message.sender === participants.find(p => p.id === socket.id)?.name ? 'own' : ''}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Send a message to everyone"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            />
            <button 
              className="send-message-btn"
              onClick={sendChatMessage}
              disabled={!newMessage.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* AI Meeting Summary Modal */}
      {showSummaryModal && (
        <div className="ai-meeting-summarizer-modal-overlay">
          <div className="ai-meeting-summarizer-modal-content">
            <div className="ai-meeting-summarizer-modal-header">
              <h3>AI Meeting Summary</h3>
              <button 
                className="ai-meeting-summarizer-close-btn"
                onClick={() => setShowSummaryModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="ai-meeting-summarizer-modal-body">
              {loadingSummary ? (
                <div className="ai-meeting-summarizer-loading-spinner">
                  <Loader size={32} className="ai-meeting-summarizer-spinner" />
                  <p>Generating summary...</p>
                </div>
              ) : (
                <div className="ai-meeting-summarizer-meeting-summary">
                  <div className="ai-meeting-summarizer-summary-tabs">
                    <button className="ai-meeting-summarizer-summary-tab active">Summary</button>
                    <button className="ai-meeting-summarizer-summary-tab">Highlights</button>
                    <button className="ai-meeting-summarizer-summary-tab">Action Items</button>
                    <button className="ai-meeting-summarizer-summary-tab">Transcript</button>
                  </div>
                  
                  <div className="ai-meeting-summarizer-summary-content ai-meeting-summarizer-markdown-content">
                    {meetingSummary ? (
                      <div className="markdown-content">
                        {meetingSummary.split('\n').map((line, index) => {
                          if (line.startsWith('## ')) {
                            return <h2 key={index}>{line.replace('## ', '')}</h2>;
                          } else if (line.startsWith('### ')) {
                            return <h3 key={index}>{line.replace('### ', '')}</h3>;
                          } else if (line.startsWith('- ')) {
                            return <li key={index}>{line.replace('- ', '')}</li>;
                          } else if (line.trim() === '') {
                            return <br key={index} />;
                          } else {
                            return <p key={index}>{line}</p>;
                          }
                        })}
                      </div>
                    ) : (
                      <p>No summary available yet. Start AI summarizer to generate a summary.</p>
                    )}
                  </div>
                  
                  <div className="ai-meeting-summarizer-summary-actions">
                    <button 
                      className="ai-meeting-summarizer-summary-action-btn"
                      onClick={copyMeetingSummary}
                      disabled={!meetingSummary}
                    >
                      <Copy size={16} />
                      <span>Copy to clipboard</span>
                    </button>
                    <button 
                      className="ai-meeting-summarizer-summary-action-btn"
                      onClick={downloadMeetingSummary}
                      disabled={!meetingSummary}
                    >
                      <Download size={16} />
                      <span>Download as markdown</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transcription indicator */}
      {isTranscribing && (
        <div className="transcription-indicator">
          <div className="pulse-dot"></div>
          <span>Recording meeting...</span>
          {interimTranscript && (
            <span className="interim-transcript">{interimTranscript}</span>
          )}
        </div>
      )}

      {/* Whiteboard in fullscreen mode */}
      {showWhiteboard && isWhiteboardFullscreen && (
        <div className="whiteboard-fullscreen">
          <div className="whiteboard-fullscreen-header">
            <h3>Team Whiteboard</h3>
            <button 
              className="close-fullscreen-btn"
              onClick={toggleWhiteboardFullscreen}
              title="Return to video call"
            >
              <Minimize2 size={20} /> <span style={{ marginLeft: '5px' }}>Return to video call</span>
            </button>
          </div>
          <div className="whiteboard-fullscreen-container">
            <Whiteboard
              roomId={`whiteboard-${meetingCode}`}
              userId={socket.id}
            />
          </div>
        </div>
      )}

      {/* Breakout Rooms */}
      {showBreakoutRoom && (
        <BreakoutRoom 
          socket={socket} 
          roomId={roomId}
          participants={participants}
          isHost={participants.length > 0 && participants[0].id === socket.id}
          onClose={closeBreakoutRoom}
        />
      )}
    </div>
  );
};

export default VideoConference;