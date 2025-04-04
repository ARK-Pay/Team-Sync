import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "./VideoConference.css";
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
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const socket = io("http://127.0.0.1:3001", {
  transports: ["websocket"],
  withCredentials: true,
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
  
  // Speech recognition state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [currentTranscriptText, setCurrentTranscriptText] = useState("");
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [recognizedTopics, setRecognizedTopics] = useState([]);
  
  // Refs for components
  const myVideo = useRef();
  const screenVideo = useRef();
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const chatContainerRef = useRef(null);
  const meetingTimerRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const combinedStreamRef = useRef(null);
  
  // Refs for speech recognition
  const transcriptTimeoutRef = useRef(null);

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
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (myVideo.current) myVideo.current.srcObject = mediaStream;

        // Add yourself to participants list
        const userName = localStorage.getItem("user_name") || "You";
        setParticipants(prev => [
          ...prev.filter(p => p.id !== socket.id),
          { id: socket.id, name: userName, micOn: true, cameraOn: true, isLocal: true }
        ]);

        socket.emit("join-room", roomId, socket.id, userName);
        
        // Show notification
        showNotificationMessage("Connected to meeting", "success");
      } catch (error) {
        console.error("Error accessing media devices:", error);
        showNotificationMessage("Failed to access camera/microphone", "error");
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

  // Toggle camera on/off
  const toggleCamera = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack.enabled) {
        // Turning camera off
        videoTrack.enabled = false;
        setCameraOn(false);
      } else {
        // Turning camera on - need to restart the track
        try {
          // Stop the current track
          videoTrack.stop();
          
          // Get a new video track
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newVideoTrack = newStream.getVideoTracks()[0];
          
          // Replace the old track with the new one
          stream.removeTrack(videoTrack);
          stream.addTrack(newVideoTrack);
          
          // Update the video element
          if (myVideo.current) {
            myVideo.current.srcObject = null;
            myVideo.current.srcObject = stream;
            await myVideo.current.play().catch(e => {
              console.error("Error playing video after camera toggle:", e);
            });
          }
          
          newVideoTrack.enabled = true;
          setCameraOn(true);
        } catch (error) {
          console.error("Error restarting camera:", error);
          showNotificationMessage("Failed to turn camera back on", "error");
          return;
        }
      }
      
      // Update yourself in participants list
      updateParticipant(socket.id, { cameraOn: !videoTrack.enabled ? false : true });
      
      // Notify others of change
      socket.emit("camera-toggle", { userId: socket.id, cameraOn: !videoTrack.enabled ? false : true });
      
      // Show notification
      showNotificationMessage(`Camera ${!videoTrack.enabled ? 'turned off' : 'turned on'}`, "info");
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
    if (screenStream && screenVideo.current) {
      // For screen sharing
      console.log("[VideoDebug] Setting screen sharing stream");
      try {
        screenVideo.current.srcObject = screenStream;
        logVideoState('Screen', screenVideo.current, screenStream);
      } catch (err) {
        console.error("Error setting screen sharing stream:", err);
      }
    }
  }, [screenStream, logVideoState]);

  // Improved screen sharing with better browser compatibility
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        console.log("[VideoDebug] Starting screen share");
        
        // Use a more compatible approach with explicit options
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            frameRate: 30,
            displaySurface: "monitor"
          },
          audio: true,  // Try to capture system audio if available
          selfBrowserSurface: "include", // Include the browser window itself
          systemAudio: "include" // Include system audio if available
        }).catch(err => {
          console.error("[VideoDebug] Initial screen share attempt failed, trying alternative:", err);
          // Fallback with simpler options
          return navigator.mediaDevices.getDisplayMedia({ 
            video: true,
            audio: false
          });
        });
        
        // Verify we got a valid stream with tracks
        if (displayStream && displayStream.getVideoTracks().length > 0) {
          console.log("[VideoDebug] Screen share tracks:", displayStream.getVideoTracks());
          const videoTrack = displayStream.getVideoTracks()[0];
          console.log("[VideoDebug] Screen video track settings:", videoTrack.getSettings());
          
          setScreenStream(displayStream);
          setScreenSharing(true);
          
          // Force the video element srcObject immediately
          if (screenVideo.current) {
            try {
              screenVideo.current.srcObject = null; // Clear first to force refresh
              screenVideo.current.srcObject = displayStream;
              // Add event listener for when the video is ready
              screenVideo.current.onloadedmetadata = () => {
                console.log("[VideoDebug] Screen video loaded metadata, playing...");
                screenVideo.current.play().catch(e => {
                  console.error("[VideoDebug] Error playing screen video:", e);
                });
              };
              logVideoState('Screen (direct)', screenVideo.current, displayStream);
            } catch (err) {
              console.error("Error setting screen stream to video element:", err);
            }
          } else {
            console.error("[VideoDebug] Screen video ref not available");
          }
          
          // Listen for the end of screen sharing
          displayStream.getVideoTracks()[0].onended = () => {
            console.log("[VideoDebug] Screen share track ended");
            stopScreenShare();
          };
          
          showNotificationMessage("Screen sharing started", "success");
        } else {
          console.error("[VideoDebug] Got screen share stream but no video tracks");
          showNotificationMessage("Failed to start screen sharing - no video tracks", "error");
        }
      } catch (error) {
        console.error("[VideoDebug] Error sharing screen:", error);
        showNotificationMessage(`Failed to share screen: ${error.message}`, "error");
      }
    } else {
      stopScreenShare();
    }
  };

  // Stop screen sharing with improved logging
  const stopScreenShare = () => {
    console.log("[VideoDebug] Stopping screen share");
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        console.log(`[VideoDebug] Stopping screen track: ${track.kind}`);
        track.stop();
      });
      
      // Make sure we clear the srcObject
      if (screenVideo.current) {
        screenVideo.current.srcObject = null;
      }
      
      setScreenStream(null);
      setScreenSharing(false);
      showNotificationMessage("Screen sharing stopped", "info");
    }
  };

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

  // Update the speech recognition initialization
  useEffect(() => {
    // Set up speech recognition if available
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;
      
      // Increase the recognition timeout
      recognition.addEventListener('nomatch', () => {
        console.log("Speech recognition did not match any text");
      });
      
      // Make sure to restart whenever it ends
      recognition.onend = () => {
        console.log("Speech recognition ended - checking if restart needed");
        if (isTranscribing) {
          try {
            console.log("Attempting to restart speech recognition");
            setTimeout(() => {
              recognition.start();
              console.log("Speech recognition restarted");
            }, 300);
          } catch (e) {
            console.error("Error restarting speech recognition:", e);
            showNotificationMessage("Speech recognition failed to restart. Try again.", "error");
          }
        }
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        console.log(`Got speech results: ${event.results.length} results`);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          const confidence = event.results[i][0].confidence;
          console.log(`Transcript: "${transcript}" with confidence: ${confidence}`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          console.log("Final transcript captured:", finalTranscript);
          
          // Get current user name from either localStorage or participants list
          const currentUserName = localStorage.getItem("user_name") || 
                                 participants.find(p => p.id === socket.id)?.name || 
                                 "You";
          
          // Add text to transcript segments with current user as speaker
          const newSegment = { 
            speaker: currentUserName, 
            text: finalTranscript.trim(), 
            timestamp: new Date().toISOString() 
          };
          
          setTranscriptSegments(prev => [...prev, newSegment]);
          setCurrentTranscriptText("");
          
          console.log("Added transcript segment:", newSegment);
          console.log("Current segments:", transcriptSegments.length + 1);
        } else if (interimTranscript) {
          setCurrentTranscriptText(interimTranscript.trim());
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        
        // If it's a no-speech timeout or other error, restart
        if (event.error === 'no-speech' || event.error === 'network' || event.error === 'aborted') {
          if (isTranscribing) {
            showNotificationMessage(`Speech recognition error: ${event.error}. Restarting...`, "warning");
            try {
              recognition.stop();
              setTimeout(() => {
                if (isTranscribing) {
                  recognition.start();
                  console.log("Restarted after speech recognition error");
                }
              }, 500);
            } catch (e) {
              console.error("Error restarting after error:", e);
            }
          }
        }
      };
      
      setSpeechRecognition(recognition);
    } else {
      console.error("Speech Recognition API not supported in this browser");
      showNotificationMessage("Speech Recognition is not supported in your browser. Try Chrome.", "error");
    }
  }, [isTranscribing, participants]);

  // Handle the transcript summary
  const getTranscriptSummary = async () => {
    try {
      setLoadingSummary(true);
      const availableSegments = transcriptSegments.filter(
        (segment) => segment.text.trim() !== ""
      );

      if (availableSegments.length === 0) {
        setShowSummaryModal(true);
        setLoadingSummary(false);
        setMeetingSummary(
          "Not enough conversation to summarize. Please speak during recording."
        );
        return;
      }

      // For our fallback solution (no API available)
      const fullTranscript = availableSegments
        .map((segment) => `${segment.speaker || "You"}: ${segment.text}`)
        .join("\n");

      try {
        // Try using API
        const response = await fetch("http://127.0.0.1:3001/api/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript: fullTranscript }),
        });

        if (!response.ok) {
          throw new Error("Failed to get summary from API");
        }

        const data = await response.json();
        setMeetingSummary(data.summary);
        
        // Process recognized topics
        const topics = data.topics || [];
        setRecognizedTopics(topics);
        
        // Process action items - ensure they have the correct structure
        const items = data.actionItems || [];
        const formattedItems = items.map(item => {
          return typeof item === 'string' 
            ? { text: item, completed: false }
            : { ...item, completed: item.completed || false };
        });
        setActionItems(formattedItems);
        
      } catch (error) {
        console.error("Error fetching from API:", error);
        
        // Generate a local summary as fallback
        generateLocalSummary(fullTranscript);
      } finally {
        setLoadingSummary(false);
        setShowSummaryModal(true);
      }
    } catch (error) {
      console.error("Error in summary generation:", error);
      setLoadingSummary(false);
      setShowSummaryModal(true);
      setMeetingSummary(
        "An error occurred while generating the summary. Please try again."
      );
    }
  };

  // Function to generate a local summary as fallback when API fails
  const generateLocalSummary = (transcript) => {
    console.log("Generating local summary from transcript:", transcript);
    
    // Make sure we have actual text content
    if (!transcript || transcript.trim().length < 10) {
      setMeetingSummary(
        "No meaningful conversation was detected during recording. Please ensure your microphone is working and speak clearly during recording."
      );
      setRecognizedTopics([]);
      setActionItems([]);
      return;
    }
    
    // Extract potential topics from transcript
    const potentialTopics = extractTopics(transcript);
    setRecognizedTopics(potentialTopics.length > 0 ? potentialTopics : ["No clear topics detected"]);
    
    // Extract potential action items
    const potentialActionItems = extractActionItems(transcript);
    
    if (potentialActionItems.length > 0) {
      setActionItems(potentialActionItems.map(item => ({ 
        text: item, 
        completed: false 
      })));
    } else {
      setActionItems([{ 
        text: "No clear action items detected. Try having a more detailed conversation.",
        completed: false 
      }]);
    }
    
    // Set a basic summary
    const speakerCount = new Set(transcriptSegments.map(segment => segment.speaker)).size;
    const speakers = [...new Set(transcriptSegments.map(segment => segment.speaker))].join(", ");
    const wordCount = transcript.split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.round(wordCount / 150));
    
    if (wordCount < 50) {
      setMeetingSummary(
        "The recorded conversation was too brief to generate a meaningful summary. " +
        "Please have a longer discussion or check that your microphone is working properly."
      );
    } else {
      setMeetingSummary(
        "This is a locally generated summary as our AI service is currently unavailable. " +
        "We've identified potential topics and action items from your conversation.\n\n" +
        `The transcript included approximately ${estimatedMinutes} ${estimatedMinutes === 1 ? 'minute' : 'minutes'} ` +
        `of conversation between ${speakerCount > 1 ? speakers : 'participants'}.\n\n` +
        "For best results, please ensure you're speaking clearly and close to your microphone. " +
        "Try refreshing the page if speech recognition is not working as expected."
      );
    }
  };

  // Function to extract potential topics from transcript with improved detail
  const extractTopics = (transcript) => {
    console.log("Extracting topics from transcript of length:", transcript.length);
    
    // Improved topic extraction with more detailed analysis
    if (!transcript || transcript.trim().length < 20) {
      return ["No meaningful conversation detected"];
    }
    
    // Extract sentences to analyze for topics
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Common words to exclude from topics
    const stopWords = [
      "the", "and", "that", "this", "with", "for", "have", "you", "not", "but", 
      "was", "are", "what", "when", "why", "how", "from", "your", "will", "would",
      "could", "should", "than", "then", "them", "these", "those", "there", "their",
      "about", "which", "been", "into", "some", "very", "just", "also", "like",
      "okay", "yes", "no", "maybe", "sure", "right", "well", "know", "think", "said",
      "going", "get", "got", "because", "says", "trying", "does", "doing", "done",
      "being", "need", "needs", "wants", "wanted", "way", "really"
    ];
    
    // Topic indicator phrases that suggest important discussion points
    const topicIndicators = [
      "discuss", "talk about", "focus on", "regarding", "concerning",
      "about the", "topic of", "subject of", "matter of", "issue of", 
      "idea of", "concept of", "plan for", "strategy for", "approach to",
      "related to", "in terms of", "with respect to", "agenda", "important"
    ];
    
    // Analyze words frequency first
    const wordFrequency = {};
    const words = transcript.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w\s]|_/g, "").trim();
      if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    // Get frequent keywords
    const frequentKeywords = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 2)
      .sort(([_, countA], [__, countB]) => countB - countA)
      .slice(0, 10)
      .map(([word]) => word);
    
    console.log("Frequent keywords:", frequentKeywords);
    
    // Find sentences that might be describing topics
    const potentialTopicSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      // Check if sentence contains any topic indicators
      return topicIndicators.some(indicator => lowerSentence.includes(indicator)) ||
             // Or contains multiple frequent keywords
             frequentKeywords.filter(keyword => lowerSentence.includes(keyword)).length >= 2;
    });
    
    // Extract potential phrases from topic sentences
    let candidateTopics = [];
    
    // First try to extract from sentences with topic indicators
    potentialTopicSentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase().trim();
      
      // Look for phrases following topic indicators
      for (const indicator of topicIndicators) {
        if (lowerSentence.includes(indicator)) {
          const index = lowerSentence.indexOf(indicator) + indicator.length;
          const remainingText = lowerSentence.slice(index).trim();
          
          if (remainingText.length > 3 && remainingText.length < 50) {
            const topic = remainingText.charAt(0).toUpperCase() + remainingText.slice(1);
            candidateTopics.push(topic);
          }
        }
      }
    });
    
    // If we couldn't find topics using indicators, extract based on keyword phrases
    if (candidateTopics.length < 2) {
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        
        // If the sentence contains multiple frequent keywords, consider it a topic
        const containedKeywords = frequentKeywords.filter(keyword => 
          lowerSentence.includes(keyword)
        );
        
        if (containedKeywords.length >= 2) {
          // Extract a reasonable portion of the sentence
          let topic = sentence.trim();
          
          // Limit to a reasonable length (30-80 chars)
          if (topic.length > 80) {
            topic = topic.slice(0, 77) + "...";
          } else if (topic.length < 30 && containedKeywords.length >= 2) {
            // If it's too short, expand with keywords context
            const contextWords = containedKeywords.join(" and ") + " discussion";
            topic = topic + " - " + contextWords;
          }
          
          // Capitalize first letter
          topic = topic.charAt(0).toUpperCase() + topic.slice(1);
          candidateTopics.push(topic);
        }
      });
    }
    
    // Deduplicate topics and limit to 5
    const uniqueTopics = [...new Set(candidateTopics)];
    let finalTopics = uniqueTopics.slice(0, 5);
    
    // If we still don't have enough topics, add keyword-based generic topics
    if (finalTopics.length < 2 && frequentKeywords.length > 0) {
      for (let i = 0; i < Math.min(3, frequentKeywords.length); i++) {
        const keyword = frequentKeywords[i];
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        const genericTopic = `Discussion about ${capitalizedKeyword}`;
        
        if (!finalTopics.includes(genericTopic)) {
          finalTopics.push(genericTopic);
        }
      }
    }
    
    // Return formatted topics or default message
    return finalTopics.length > 0 ? 
      finalTopics : 
      ["The conversation didn't contain clearly identifiable topics"];
  };

  // Function to extract potential action items from transcript with better accuracy
  const extractActionItems = (transcript) => {
    console.log("Extracting action items from transcript");
    
    if (!transcript || transcript.trim().length < 20) {
      return [];
    }
    
    // Split transcript into sentences
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    // Action item indicator patterns
    const actionIndicators = [
      { pattern: /need to\s+([\w\s,]+)/i, priority: 5 }, 
      { pattern: /should\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /have to\s+([\w\s,]+)/i, priority: 5 },
      { pattern: /must\s+([\w\s,]+)/i, priority: 5 },
      { pattern: /going to\s+([\w\s,]+)/i, priority: 3 },
      { pattern: /will\s+([\w\s,]+)/i, priority: 3 },
      { pattern: /let'?s\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /plan to\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /remember to\s+([\w\s,]+)/i, priority: 5 },
      { pattern: /don'?t forget to\s+([\w\s,]+)/i, priority: 5 },
      { pattern: /action item[:;]\s*([\w\s,]+)/i, priority: 10 },
      { pattern: /task[:;]\s*([\w\s,]+)/i, priority: 10 },
      { pattern: /assign(?:ed|ing)?\s+(?:to|for)?\s+([\w\s,]+)/i, priority: 8 },
      { pattern: /take care of\s+([\w\s,]+)/i, priority: 7 },
      { pattern: /responsible for\s+([\w\s,]+)/i, priority: 8 },
      { pattern: /follow(?:ing)? up (?:on|with)?\s+([\w\s,]+)/i, priority: 6 },
      { pattern: /create\s+([\w\s,]+)/i, priority: 3 },
      { pattern: /implement\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /set up\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /review\s+([\w\s,]+)/i, priority: 3 },
      { pattern: /complete\s+([\w\s,]+)/i, priority: 4 },
      { pattern: /finish\s+([\w\s,]+)/i, priority: 4 }
    ];
    
    // Time expressions to identify deadlines
    const timeExpressions = [
      /by (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /by (?:tomorrow|next week|next month|tonight|today)/i,
      /by (?:january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /by the end of (?:day|week|month|quarter|year)/i,
      /within \d+ (?:hour|day|week|month|year)s?/i,
      /before (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    ];
    
    // Person indicators to identify who is assigned
    const personIndicators = [
      /(?:assign to|assigned to) (\w+)/i,
      /(\w+) will (?:do|take|handle)/i,
      /(\w+) should (?:do|take|handle)/i,
      /(\w+) is responsible/i
    ];
    
    // Extracted candidate action items with metadata
    const candidates = [];
    
    sentences.forEach(sentence => {
      let matchFound = false;
      let highestPriority = 0;
      let bestMatch = null;
      
      for (const { pattern, priority } of actionIndicators) {
        const match = sentence.match(pattern);
        
        if (match && match[1] && priority > highestPriority) {
          matchFound = true;
          highestPriority = priority;
          bestMatch = {
            text: match[1].trim(),
            priority: priority,
            sentence: sentence.trim(),
            hasDeadline: timeExpressions.some(expr => sentence.match(expr)),
            assignee: extractAssignee(sentence, personIndicators)
          };
        }
      }
      
      if (matchFound && bestMatch) {
        // Format the action item text
        let actionItemText = bestMatch.text;
        
        // If text is too short, use the whole sentence
        if (actionItemText.length < 15 && bestMatch.sentence.length < 120) {
          actionItemText = bestMatch.sentence;
        }
        
        // Add assignee information if available
        if (bestMatch.assignee) {
          if (!actionItemText.includes(bestMatch.assignee)) {
            actionItemText = `[${bestMatch.assignee}] ${actionItemText}`;
          }
        }
        
        // Add deadline information
        for (const timeExpr of timeExpressions) {
          const deadlineMatch = sentence.match(timeExpr);
          if (deadlineMatch && !actionItemText.includes(deadlineMatch[0])) {
            actionItemText += ` (${deadlineMatch[0]})`;
            break;
          }
        }
        
        candidates.push({
          text: actionItemText,
          priority: bestMatch.priority,
          completed: false
        });
      }
    });
    
    // Sort by priority and limit to 5 items
    const sortedItems = candidates
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
    
    return sortedItems.length > 0 ? sortedItems : [];
  };

  // Helper function to extract assignee from sentence
  const extractAssignee = (sentence, personIndicators) => {
    for (const pattern of personIndicators) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Try to find common names in the sentence
    const words = sentence.split(/\s+/);
    for (const word of words) {
      // Look for capitalized words that might be names
      if (word.length > 1 && word[0] === word[0].toUpperCase() && word[1] === word[1].toLowerCase()) {
        // Exclude sentence beginnings and common words
        if (words.indexOf(word) > 0 && !["I", "We", "The", "This", "That", "These", "Those"].includes(word)) {
          return word;
        }
      }
    }
    
    return null;
  };

  // Toggle AI Summarizer function - starts/stops transcription and generates summary
  const toggleAISummarizer = () => {
    if (isTranscribing) {
      // If already transcribing, stop and generate summary
      if (speechRecognition) {
        try {
          console.log("Stopping speech recognition and generating summary...");
          speechRecognition.stop();
          setIsTranscribing(false);
          showNotificationMessage("Recording stopped. Generating meeting summary...", "info");
          
          // Generate summary from transcript if we have segments
          if (transcriptSegments.length > 0) {
            console.log(`Found ${transcriptSegments.length} transcript segments, generating summary...`);
            getTranscriptSummary();
          } else {
            console.error("No transcript segments available to summarize");
            showNotificationMessage("Not enough conversation to summarize. Please speak during recording.", "warning");
            setShowSummaryModal(true);
            setMeetingSummary("Not enough conversation to summarize. Please speak clearly during recording.");
          }
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
          showNotificationMessage("Error stopping recording", "error");
        }
      }
    } else {
      // Start transcribing
      if (!speechRecognition) {
        console.error("No speech recognition available");
        showNotificationMessage("Speech recognition not available in your browser. Try Chrome or Edge.", "error");
        return;
      }

      try {
        console.log("Starting speech recognition...");
        // Reset previous transcript segments if any
        setTranscriptSegments([]);
        setRecognizedTopics([]);
        setActionItems([]);
        
        // Start the speech recognition
        speechRecognition.start();
        setIsTranscribing(true);
        setTranscriptionEnabled(true);
        
        // Show notification with instructions for microphone access
        showNotificationMessage("AI summarizer activated - recording conversation. Please speak clearly and allow microphone access. Click again to stop and generate summary.", "success");
        
        // Check if recording started successfully
        setTimeout(() => {
          if (isTranscribing && transcriptSegments.length === 0) {
            console.log("Speech recognition started but no segments detected yet - this is normal");
          }
        }, 5000);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        showNotificationMessage(`Failed to activate AI summarizer: ${error.message}. Make sure you've granted microphone permissions.`, "error");
      }
    }
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

  // Copy summary to clipboard
  const copySummary = () => {
    if (meetingSummary) {
      navigator.clipboard.writeText(meetingSummary).then(() => {
        setSummaryJustCopied(true);
        setTimeout(() => setSummaryJustCopied(false), 2000);
        showNotificationMessage("Summary copied to clipboard", "success");
      }).catch(err => {
        console.error("Failed to copy text: ", err);
        showNotificationMessage("Failed to copy to clipboard", "error");
      });
    }
  };

  // Add translation function
  const translateSummary = async (targetLanguage) => {
    if (!meetingSummary) return;
    
    setIsTranslating(true);
    try {
      console.log(`Translating summary to ${targetLanguage}...`);
      
      const apiUrl = 'http://localhost:3001/api/translate';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: meetingSummary,
          targetLanguage 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranslatedSummary(data.translatedText);
        setTranslationLanguage(targetLanguage);
        showNotificationMessage(`Summary translated to ${getLanguageName(targetLanguage)}`, "success");
      } else {
        const error = await response.json();
        throw new Error(error.details || error.error || "Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      showNotificationMessage(`Translation failed: ${error.message}`, "error");
      // If translation fails, keep using the original summary
      setTranslatedSummary("");
    } finally {
      setIsTranslating(false);
    }
  };

  // Helper to get language name from code
  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      hi: "Hindi"
    };
    return languages[code] || code;
  };

  // Enhanced function to download summary with better formatting
  const downloadSummary = () => {
    const content = generateSummaryContent(meetingSummary, recognizedTopics, actionItems);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const date = new Date().toISOString().split('T')[0];
    a.download = `meeting-summary-${date}.txt`;
    a.href = url;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded successfully!');
  };

  // Helper function to generate formatted summary content
  const generateSummaryContent = (summary, topics, actions) => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let content = `MEETING SUMMARY - ${date} at ${time}\n\n`;
    
    // Add summary text
    content += `${summary}\n\n`;
    
    // Add topics if available
    if (topics && topics.length > 0) {
      content += `DISCUSSED TOPICS:\n`;
      topics.forEach(topic => {
        content += `• ${topic}\n`;
      });
      content += '\n';
    }
    
    // Add action items if available
    if (actions && actions.length > 0) {
      content += `ACTION ITEMS:\n`;
      actions.forEach(item => {
        content += `[ ] ${item}\n`;
      });
    }
    
    return content;
  };

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

  const toggleActionItemComplete = (index) => {
    setActionItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        completed: !newItems[index].completed
      };
      return newItems;
    });
  };

  return (
    <div className="video-conference">
      {/* Transcription indicator - shows when recording is active */}
      {isTranscribing && (
        <div className="transcription-indicator">
          <span className="pulse-dot"></span>
          <span className="recording-text">Recording conversation</span>
        </div>
      )}

      <div className="meeting-header">
        <div className="meeting-info">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
          </button>
          <h1>{projectName || "Meeting"}</h1>
          <div className="meeting-duration">
            <Clock size={14} />
            <span>{formatMeetingTime(meetingTime)}</span>
          </div>
        </div>
        <div className="meeting-controls">
          <button 
            className="layout-toggle-button" 
            onClick={toggleLayout}
            title="Change layout"
          >
            <Layout size={18} />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className={`video-grid layout-${layoutMode} ${screenSharing ? 'screen-active' : ''}`}>
        {screenSharing && (
          <div className="screen-share-container">
            <video
              ref={screenVideo}
              autoPlay
              playsInline
              className="screen-share-video"
            />
            <div className="debug-overlay">
              {!screenStream && <p className="debug-text">No screen stream available</p>}
            </div>
          </div>
        )}
        
        <div className={`participants-videos layout-${layoutMode}`}>
          {participants.map((participant) => {
            const isLocal = participant.id === socket.id;
            
            if (isLocal) {
              return (
                <div 
                  key={participant.id} 
                  className={`video-box ${activeSpeaker === participant.id ? 'active-speaker' : ''} ${!participant.cameraOn ? 'camera-off' : ''}`}
                >
                  {participant.cameraOn ? (
                    <>
                      <video
                        ref={myVideo}
                        autoPlay
                        playsInline
                        muted
                        className="mirror"
                      />
                      {!stream && <div className="debug-overlay"><p className="debug-text">No camera stream</p></div>}
                    </>
                  ) : (
                    <div className="avatar-placeholder">
                      <div className="avatar-circle">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div className="participant-info">
                    <span className="participant-name">
                      {participant.name} (You)
                    </span>
                    <div className="participant-status">
                      {!participant.micOn && <MicOff size={16} className="status-icon muted" />}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Remote participant
              const remoteStream = remoteStreams.find(s => s.userId === participant.id);
              return (
                <div 
                  key={participant.id} 
                  className={`video-box ${activeSpeaker === participant.id ? 'active-speaker' : ''} ${!participant.cameraOn ? 'camera-off' : ''}`}
                >
                  {participant.cameraOn && remoteStream ? (
                    <video
                      ref={(el) => handleRemoteVideoRef(el, remoteStream)}
                      autoPlay
                      playsInline
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
                      {participant.name}
                    </span>
                    <div className="participant-status">
                      {!participant.micOn && <MicOff size={16} className="status-icon muted" />}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Call Controls - Simplified */}
      <div className="call-controls">
        <button 
          className={`control-btn mic-btn ${!micOn ? 'off' : ''}`} 
          onClick={toggleMic}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button 
          className={`control-btn camera-btn ${!cameraOn ? 'off' : ''}`} 
          onClick={toggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button 
          className={`control-btn share-btn ${screenSharing ? 'active' : ''}`} 
          onClick={toggleScreenShare}
          title={screenSharing ? "Stop sharing" : "Share screen"}
        >
          {screenSharing ? <StopCircle size={20} /> : <Share2 size={20} />}
        </button>

        <button 
          className={`control-btn chat-btn`} 
          onClick={toggleChat}
          title="Toggle chat"
        >
          <MessageSquare size={20} />
        </button>

        <button 
          className={`control-btn recording-btn ${recording ? 'active' : ''}`} 
          onClick={toggleRecording}
          title={recording ? "Stop recording" : "Start recording"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        
        <button 
          className={`control-btn ai-summarizer ${isTranscribing ? 'active' : ''} ${loadingSummary ? 'loading' : ''}`}
          onClick={toggleAISummarizer}
          title={isTranscribing ? "Stop recording and generate summary" : "Start AI meeting summarizer"}
          disabled={loadingSummary}
        >
          {isTranscribing ? (
            <>
              <span className="recording-indicator"></span>
              <FileText size={20} />
              <span className="recording-text">Recording...</span>
            </>
          ) : (
            <FileText size={20} />
          )}
        </button>
        
        <button 
          className="control-btn end-call-btn" 
          onClick={handleEndCall}
          title="End call"
        >
          <Phone size={20} />
        </button>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="participants-sidebar">
          <div className="sidebar-header">
            <h3>
              <Users size={16} className="sidebar-icon" />
              Participants ({participants.length})
            </h3>
            <button 
              className="close-sidebar" 
              onClick={toggleParticipants}
              aria-label="Close participants panel"
            >
              <XCircle size={18} />
            </button>
          </div>
          
          <div className="participant-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <div className="participant-item-name">
                  {participant.name} {participant.id === socket.id && "(You)"}
                </div>
                <div className="status-icons">
                  {!participant.micOn && <MicOff size={16} className="status-icon mic-off" />}
                  {!participant.cameraOn && <VideoOff size={16} className="status-icon camera-off" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      {showChat && (
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h3>
              <MessageSquare size={16} className="sidebar-icon" />
              Meeting Chat
            </h3>
            <button 
              className="close-sidebar" 
              onClick={toggleChat}
              aria-label="Close chat panel"
            >
              <XCircle size={18} />
            </button>
          </div>
          
          <div className="chat-messages" ref={chatContainerRef}>
            {chatMessages.length === 0 ? (
              <div className="empty-chat">
                <p>No messages yet</p>
                <p className="empty-chat-subtext">Be the first to send a message</p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`chat-message ${msg.isLocal ? 'local-message' : 'remote-message'}`}
                >
                  <div className="message-sender">{msg.sender}</div>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="chat-input-form" onSubmit={sendChatMessage}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Summary modal */}
      {showSummaryModal && (
        <div className="meeting-summary-modal">
          <div className="summary-content">
            <div className="summary-header">
              <h3>Meeting Summary</h3>
              <button 
                className="close-summary" 
                onClick={() => {
                  setShowSummaryModal(false);
                  setTranslatedSummary(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="summary-text">
              {/* Summary text */}
              {isLoadingSummary ? (
                <div className="loading-summary">
                  <div className="spinner"></div>
                  <p>Generating summary...</p>
                </div>
              ) : isTranslating ? (
                <div className="loading-summary">
                  <div className="spinner"></div>
                  <p>Translating summary...</p>
                </div>
              ) : (
                <div>
                  <p>{translatedSummary || meetingSummary}</p>
                  
                  {/* Display recognized topics if not in translated view */}
                  {recognizedTopics.length > 0 && !translatedSummary && (
                    <div className="topics-section">
                      <h4>Topics Discussed:</h4>
                      <ul className="topics-list-display">
                        {recognizedTopics.map((topic, index) => (
                          <li key={index} className="topic-item">{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action items section */}
                  {actionItems.length > 0 && !translatedSummary && (
                    <div className="action-items-section">
                      <h4>Action Items:</h4>
                      <ul className="action-items-list">
                        {actionItems.map((item, index) => (
                          <li key={index} className="action-item">
                            <input
                              type="checkbox"
                              id={`action-item-${index}`}
                              checked={item.completed || false}
                              onChange={() => toggleActionItemComplete(index)}
                            />
                            <label htmlFor={`action-item-${index}`}>
                              {item.text || item}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary actions */}
            <div className="summary-actions">
              <button 
                className="download-summary" 
                onClick={downloadSummary}
              >
                <i className="fas fa-download"></i> Download Summary
              </button>
              <button 
                className="copy-summary" 
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateSummaryContent(meetingSummary, recognizedTopics, actionItems)
                  );
                  toast.success("Summary copied to clipboard!");
                }}
              >
                <i className="fas fa-copy"></i> Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className={`notification notification-${notificationType}`}>
          {notificationType === 'success' && <CheckCircle size={16} className="notification-icon" />}
          {notificationType === 'error' && <AlertCircle size={16} className="notification-icon" />}
          {notificationType === 'info' && <div className="notification-icon info-icon">i</div>}
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Loading Overlay for Summary */}
      {loadingSummary && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating meeting summary...</p>
        </div>
      )}

      {/* Topic Indicator */}
      {recognizedTopics.length > 0 && (
        <div className="topics-indicator">
          <div className="topics-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Topics Detected:</span>
          </div>
          <div className="topics-list">
            {recognizedTopics.slice(0, 3).map((topic, index) => (
              <div key={index} className="topic-tag">{topic}</div>
            ))}
            {recognizedTopics.length > 3 && (
              <div className="topic-tag more-topics">+{recognizedTopics.length - 3} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConference;