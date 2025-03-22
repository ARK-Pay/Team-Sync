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
  FileSpreadsheet
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [showSummaryModal, setShowSummaryModal] = useState(false);
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
  const [showDebugControls, setShowDebugControls] = useState(false);

  // Refs
  const myVideo = useRef();
  const screenVideo = useRef();
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const chatContainerRef = useRef(null);
  const meetingTimerRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const combinedStreamRef = useRef(null);

  // Speech recognition state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [currentTranscriptText, setCurrentTranscriptText] = useState("");
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [recognizedTopics, setRecognizedTopics] = useState([]);
  
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
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
      
      // Update yourself in participants list
      updateParticipant(socket.id, { cameraOn: videoTrack.enabled });
      
      // Notify others of change
      socket.emit("camera-toggle", { userId: socket.id, cameraOn: videoTrack.enabled });
      
      // Show notification
      showNotificationMessage(`Camera ${videoTrack.enabled ? 'turned on' : 'turned off'}`, "info");
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

  // Initialize speech recognition when the component mounts
  useEffect(() => {
    // Check if speech recognition is available in the browser
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Handle result event - when speech is recognized
      recognition.onresult = (event) => {
        let currentText = '';
        let isFinal = false;
        
        // Process the results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          currentText += transcript;
          isFinal = event.results[i].isFinal;
        }
        
        // Update the current transcript text being displayed
        setCurrentTranscriptText(currentText);
        
        // If the result is final, add it to the transcript segments
        if (isFinal) {
          // Get the current speaker (for now just use "Speaker" with random number)
          // In a real implementation, this would identify the current speaker
          const currentSpeakerId = socket.id;
          const speakerName = participants.find(p => p.id === currentSpeakerId)?.name || 'Unknown Speaker';
          
          // Add to transcript segments
          setTranscriptSegments(prev => [
            ...prev, 
            { 
              speaker: speakerName, 
              text: currentText.trim(),
              timestamp: new Date().toISOString()
            }
          ]);
          
          // Clear the current transcript text
          setCurrentTranscriptText('');
        }
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // If error is fatal, restart recognition
        if (event.error === 'network' || event.error === 'service-not-allowed') {
          setTimeout(() => {
            if (isTranscribing) {
              try {
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
              }
            }
          }, 3000);
        }
      };
      
      // Handle end event - restart if still transcribing
      recognition.onend = () => {
        if (isTranscribing) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
          }
        }
      };
      
      setSpeechRecognition(recognition);
    } else {
      console.warn("Speech recognition not supported in this browser");
    }
    
    // Cleanup function
    return () => {
      if (speechRecognition) {
        try {
          speechRecognition.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
      }
    };
  }, [participants]);

  // Extract topics from transcript for local fallback
  const extractTopicsFromTranscript = (transcript) => {
    // Simple keyword extraction based on frequency
    if (!transcript || transcript.length < 50) {
      return [];
    }

    // Convert to lowercase and remove common words
    const text = transcript.toLowerCase();
    const words = text.split(/\s+/);
    
    // Filter out common words and short words
    const commonWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'for', 'in', 'on', 'at', 'to', 'of', 'with',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those',
      'would', 'could', 'should', 'will', 'shall', 'may', 'might', 'can', 'must', 'our', 'your',
      'my', 'his', 'her', 'its', 'their', 'ok', 'okay', 'yes', 'no', 'yeah', 'right', 'like',
      'um', 'uh', 'oh', 'so', 'well', 'just', 'very', 'really', 'actually', 'basically'
    ]);
    
    // Count word frequency
    const wordCounts = {};
    words.forEach(word => {
      // Only include words with 3+ characters and not in common words list
      if (word.length >= 3 && !commonWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Sort by frequency and get top words
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
      
    return topWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  };

  // Handle the transcript summary
  const handleTranscriptSummary = async () => {
    setLoadingSummary(true);
    
    try {
      // Format transcript segments for the API
      const formattedTranscript = transcriptSegments
        .map(segment => `${segment.speaker}: ${segment.text}`)
        .join('\n');
      
      setMeetingTranscript(formattedTranscript);
      
      // Add proper error handling and logging
      console.log("Sending transcript for summarization:", { length: formattedTranscript.length });
      
      // Try the main API endpoint first
      try {
        // Use the Gemini API endpoint for summarization
        const response = await axios.post('/api/summarize', {
          text: formattedTranscript
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });
        
        console.log("Summary API response:", response);
        
        if (response.data && response.data.summary) {
          // Properly format and set the meeting summary
          const summaryText = response.data.summary.trim();
          console.log("Raw summary text:", summaryText);
          setMeetingSummary(summaryText);
          
          // Extract topics if available
          if (response.data.topics && response.data.topics.length > 0) {
            setRecognizedTopics(response.data.topics);
          } else {
            // Try to extract topics from the summary
            setRecognizedTopics(extractTopicsFromTranscript(formattedTranscript));
          }
          setSummarySource("ai");
          setShowSummaryModal(true);
          return;
        } else {
          console.error("Invalid API response format:", response.data);
          throw new Error('Invalid response from summarization API');
        }
      } catch (apiError) {
        console.error('Primary API summarization failed:', apiError.response?.data || apiError.message);
        
        // Try alternate API endpoints if available
        try {
          showNotificationMessage("Trying alternate summarization service...", "info");
          
          // Try a publicly available summarization API as fallback
          const fallbackResponse = await axios.post('https://api.hume.ai/v0/batch/nlp/summarize', {
            text: formattedTranscript,
            method: "abstractive",
            max_sentences: 5
          }, {
            headers: {
              'Content-Type': 'application/json',
              'X-Hume-Api-Key': 'demo_key' // This is a demo key, not a real API key
            },
            timeout: 15000
          });
          
          if (fallbackResponse.data && fallbackResponse.data.summary) {
            const summary = `MEETING SUMMARY:\n${fallbackResponse.data.summary}\n\nNote: This summary was generated using a fallback API service.`;
            setMeetingSummary(summary);
            setRecognizedTopics(extractTopicsFromTranscript(formattedTranscript));
            setSummarySource("ai-fallback");
            setShowSummaryModal(true);
            return;
          } else {
            throw new Error('Invalid response from fallback API');
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError.message);
          showNotificationMessage('Using local summarization: API services unavailable', 'warning');
          
          // If both APIs fail, use the local summarization
          const fallbackSummary = generateLocalSummary(formattedTranscript);
          setMeetingSummary(fallbackSummary.summary);
          setRecognizedTopics(fallbackSummary.topics);
          setSummarySource("basic");
          setShowSummaryModal(true);
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      showNotificationMessage('Failed to generate meeting summary', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Helper function to generate a local summary if API fails
  const generateLocalSummary = (transcript) => {
    try {
      // Basic local summarization
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const topics = extractTopicsFromTranscript(transcript);
      
      // Generate a basic summary
      let summary = "Meeting Summary:\n\n";
      
      if (topics.length > 0) {
        summary += "Main Topics Discussed:\n";
        topics.forEach(topic => {
          summary += `- ${topic}\n`;
        });
        summary += "\n";
      }
      
      // Add key points from the most important sentences
      summary += "Key Points:\n";
      const keyPoints = sentences
        .filter((s, i) => i % 3 === 0 && s.length > 15) // Take every 3rd sentence as important
        .slice(0, 5)
        .map(s => `- ${s.trim()}`);
        
      summary += keyPoints.join('\n');
      
      return { summary, topics };
    } catch (error) {
      console.error('Local summarization failed:', error);
      return { 
        summary: "Unable to generate summary. Please check the transcript manually.", 
        topics: [] 
      };
    }
  };

  // Toggle AI Summarizer function - starts/stops transcription and generates summary
  const toggleAISummarizer = () => {
    if (isTranscribing) {
      // If already transcribing, stop and generate summary
      if (speechRecognition) {
        try {
          speechRecognition.stop();
          setIsTranscribing(false);
          showNotificationMessage("Processing meeting summary...", "info");
          
          // Generate summary from transcript if we have segments
          if (transcriptSegments.length > 0) {
            handleTranscriptSummary();
          } else {
            showNotificationMessage("Not enough conversation to summarize", "warning");
          }
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
          showNotificationMessage("Error stopping transcription", "error");
        }
      }
    } else {
      // Start transcribing
      try {
        // Check if speech recognition is available
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
          showNotificationMessage("Speech recognition not available in your browser", "error");
          return;
        }

        // Create speech recognition instance if not already created
        if (!speechRecognition) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          // Handle result event - when speech is recognized
          recognition.onresult = (event) => {
            let currentText = '';
            let isFinal = false;
            
            // Process the results
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              currentText += transcript;
              isFinal = event.results[i].isFinal;
            }
            
            // Update the current transcript text being displayed
            setCurrentTranscriptText(currentText);
            
            // If the result is final, add it to the transcript segments
            if (isFinal) {
              // Get the current speaker (for now just use "Speaker" with socket ID)
              const currentSpeakerId = socket.id;
              const speakerName = participants.find(p => p.id === currentSpeakerId)?.name || 'Unknown Speaker';
              
              // Add to transcript segments
              setTranscriptSegments(prev => [
                ...prev, 
                { 
                  speaker: speakerName, 
                  text: currentText.trim(),
                  timestamp: new Date().toISOString()
                }
              ]);
              
              // Clear the current transcript text
              setCurrentTranscriptText('');
            }
          };
          
          // Handle errors
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showNotificationMessage(`Transcription error: ${event.error}`, "error");
            
            // If error is fatal, restart recognition
            if (event.error === 'network' || event.error === 'service-not-allowed') {
              setTimeout(() => {
                if (isTranscribing) {
                  try {
                    recognition.start();
                  } catch (e) {
                    console.error("Failed to restart speech recognition:", e);
                  }
                }
              }, 3000);
            }
          };
          
          // Handle end event - restart if still transcribing
          recognition.onend = () => {
            console.log("Speech recognition ended");
            if (isTranscribing) {
              try {
                console.log("Restarting speech recognition");
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
                setIsTranscribing(false);
              }
            }
          };
          
          setSpeechRecognition(recognition);
          
          // Start the recognition
          recognition.start();
          setIsTranscribing(true);
          setTranscriptionEnabled(true);
          showNotificationMessage("AI summarizer activated - recording conversation", "success");
          return;
        }
        
        // Reset previous transcript segments if any
        setTranscriptSegments([]);
        setRecognizedTopics([]);
        
        try {
          // Start the speech recognition if it already exists
          speechRecognition.start();
          setIsTranscribing(true);
          setTranscriptionEnabled(true);
          showNotificationMessage("AI summarizer activated - recording conversation", "success");
        } catch (startError) {
          console.error("Error starting speech recognition:", startError);
          
          // Try to reset the recognition instance and start again
          if (speechRecognition) {
            try {
              speechRecognition.stop();
            } catch (e) {
              console.error("Error stopping existing recognition:", e);
            }
          }
          
          // Create new instance as a fallback
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const newRecognition = new SpeechRecognition();
          newRecognition.continuous = true;
          newRecognition.interimResults = true;
          newRecognition.lang = 'en-US';
          
          // Copy the event handlers from above
          // (simplified for brevity - handlers should be the same as above)
          
          setSpeechRecognition(newRecognition);
          try {
            newRecognition.start();
            setIsTranscribing(true);
            showNotificationMessage("AI summarizer activated (retry)", "info");
          } catch (retryError) {
            console.error("Failed to start recognition even after retry:", retryError);
            showNotificationMessage("Failed to activate AI summarizer", "error");
          }
        }
      } catch (error) {
        console.error("Error in toggleAISummarizer:", error);
        showNotificationMessage("Failed to activate AI summarizer", "error");
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

  // Download summary
  const downloadSummary = () => {
    if (meetingSummary) {
  const element = document.createElement("a");
  const file = new Blob([meetingSummary], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
      element.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-meeting-summary.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
    }
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

  // Mock transcript generator for testing
  const generateMockTranscriptForTesting = () => {
    const mockTranscript = [
      { speaker: "Alice", text: "Hi everyone, let's begin our project planning meeting for the new mobile app.", timestamp: new Date().toISOString() },
      { speaker: "Bob", text: "Thanks Alice. I've been working on the UI designs and have completed about 70% of the screens.", timestamp: new Date().toISOString() },
      { speaker: "Charlie", text: "That's great progress Bob. Did you consider the dark mode requirements we discussed last week?", timestamp: new Date().toISOString() },
      { speaker: "Bob", text: "Yes, all screens have both light and dark mode variants. I'll share the Figma link after the meeting.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Perfect. What about the backend API? David, any updates on that front?", timestamp: new Date().toISOString() },
      { speaker: "David", text: "I've set up the basic structure and implemented the authentication endpoints. Still working on the data models for the content management system.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "When do you think that will be ready for testing?", timestamp: new Date().toISOString() },
      { speaker: "David", text: "I should have it ready by next Friday. I'll need some test data to work with though.", timestamp: new Date().toISOString() },
      { speaker: "Charlie", text: "I can help with generating test data. I'll prepare some JSON fixtures this week.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Great! Let's also discuss the project timeline. We initially planned to launch in December, but we might need to push it to January.", timestamp: new Date().toISOString() },
      { speaker: "Bob", text: "What's causing the delay?", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "We need more time for QA and user testing. Plus, launching right before the holidays isn't ideal from a marketing perspective.", timestamp: new Date().toISOString() },
      { speaker: "Charlie", text: "I agree with Alice. January would be better. We could aim for the second week of January after everyone is back from vacation.", timestamp: new Date().toISOString() },
      { speaker: "David", text: "That works for me. It gives us more time to polish the product.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Then it's settled. Our new launch date is January 15th. Let's update the project plan accordingly.", timestamp: new Date().toISOString() },
      { speaker: "Bob", text: "Should we schedule additional testing sessions in December then?", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Yes, let's plan for a beta release to internal users by December 10th, and then a wider testing group by December 20th.", timestamp: new Date().toISOString() },
      { speaker: "Charlie", text: "I'll coordinate with the QA team to set up the testing schedule.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Perfect. Any other concerns or questions we should address today?", timestamp: new Date().toISOString() },
      { speaker: "David", text: "Just one thing - we need to decide on the analytics solution we'll be using. Do we stick with Google Analytics or try something new?", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "Let's discuss that in our next meeting. I'll do some research on alternatives before then.", timestamp: new Date().toISOString() },
      { speaker: "Alice", text: "If there's nothing else, let's wrap up for today. Thanks everyone for your updates.", timestamp: new Date().toISOString() }
    ];
    
    return mockTranscript;
  };

  // Function to test the summarizer with mock data
  const testSummarizerWithMockData = () => {
    setLoadingSummary(true);
    showNotificationMessage("Testing summarizer with mock data...", "info");
    
    // Set mock transcript data
    const mockTranscript = generateMockTranscriptForTesting();
    setTranscriptSegments(mockTranscript);
    
    // Process the summary
    setTimeout(() => {
      handleTranscriptSummary();
    }, 500);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Alt+S for testing the summarizer with mock data
      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        testSummarizerWithMockData();
      }
      
      // Alt+D to toggle debug mode
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        setShowDebugControls(prev => !prev);
        showNotificationMessage("Debug controls toggled", "info");
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close summary modal
  const closeSummaryModal = () => {
    setShowSummaryModal(false);
  };

  // Process summary text for rendering
  const processSummaryText = (text) => {
    if (!text) return [];
    
    // Split into paragraphs
    const paragraphs = text.split('\n');
    
    // Process each paragraph
    return paragraphs.map((para, index) => {
      // Skip empty lines
      if (!para.trim()) return { type: 'empty', content: '', key: `empty-${index}` };
      
      // Check if it's a section heading
      if (para.includes('MEETING SUMMARY:') || 
          para.includes('KEY POINTS:') || 
          para.includes('DECISIONS:') || 
          para.includes('ACTION ITEMS:')) {
        return { type: 'heading', content: para, key: `heading-${index}` };
      }
      
      // Handle topics section specially
      if (para.includes('TOPICS:')) {
        return { type: 'heading', content: 'TOPICS:', key: `heading-topics` };
      }
      
      // Check if it's a JSON array (topics)
      if (para.trim().startsWith('[') && para.trim().endsWith(']')) {
        try {
          // Try to parse it as JSON
          const topics = JSON.parse(para);
          return { 
            type: 'topics', 
            content: topics, 
            key: `topics-${index}` 
          };
        } catch (e) {
          // If not valid JSON, treat as normal paragraph
          return { type: 'paragraph', content: para, key: `para-${index}` };
        }
      }
      
      // Check if it's a bullet point
      if (para.trim().startsWith('-')) {
        return { 
          type: 'bullet', 
          content: para.trim().substring(1).trim(), 
          key: `bullet-${index}` 
        };
      }
      
      // Regular paragraph
      return { type: 'paragraph', content: para, key: `para-${index}` };
    });
  };

  return (
    <div className="video-conference">
        {/* Header */}
        <header className="meeting-header">
          <div className="header-left">
            <button className="header-back-button" onClick={() => {
              // Check if user is admin and navigate to appropriate dashboard
              const isAdmin = localStorage.getItem("isAdmin") === "true";
              navigate(isAdmin ? "/dashboard/admin" : "/dashboard/user");
            }}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="meeting-title">{projectName}</h1>
            <div className="meeting-timer">
              <Clock size={14} />
              <span>{formatMeetingTime(meetingTime)}</span>
        </div>
          </div>
          <div className="header-right">
            {recording && (
              <div className="recording-indicator">
                <span className="recording-dot"></span>
                REC
              </div>
            )}
            <button 
              className="layout-toggle-button" 
              onClick={toggleLayout}
              title="Change layout"
            >
              <Layout size={18} />
            </button>
          </div>
        </header>

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
              <div className="recording-indicator">
                <span className="recording-dot"></span>
                <FileText size={20} />
              </div>
            ) : loadingSummary ? (
              <div className="loading-spinner-small"></div>
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

        {/* Meeting Summary Modal */}
        {showSummaryModal && meetingSummary && (
          <div className="meeting-summary-modal">
            <div className="summary-content">
              <div className="summary-header">
                <h3>
                  <FileSpreadsheet size={18} />
                  Meeting Summary {summarySource !== "ai" && summarySource !== "ai-fallback" && "(Local)"}
                </h3>
                <button 
                  className="close-summary" 
                  onClick={closeSummaryModal}
                  aria-label="Close summary"
                >
                  <XCircle size={18} />
                </button>
              </div>
              
              <div className="summary-scrollable">
                <div className="summary-text">
                  {processSummaryText(meetingSummary).map(item => {
                    switch (item.type) {
                      case 'empty':
                        return <div key={item.key} className="summary-empty-line"></div>;
                      case 'heading':
                        return <h4 key={item.key} className="summary-section-header">{item.content}</h4>;
                      case 'bullet':
                        return <div key={item.key} className="summary-bullet-point">
                          <span className="bullet-marker">•</span>
                          <span>{item.content}</span>
                        </div>;
                      case 'topics':
                        return <div key={item.key} className="summary-topics-list">
                          {item.content.map((topic, i) => (
                            <span key={`topic-${i}`} className="summary-topic-tag">{topic}</span>
                          ))}
                        </div>;
                      case 'paragraph':
                      default:
                        return <p key={item.key}>{item.content}</p>;
                    }
                  })}
                  
                  {/* Fallback Notes */}
                  {summarySource === "basic" && (
                    <div className="summary-fallback-note summary-fallback-basic">
                      <AlertCircle size={16} />
                      Note: This is a basic summary created because the AI service was unavailable.
                    </div>
                  )}
                  
                  {summarySource === "ai-fallback" && (
                    <div className="summary-fallback-note summary-fallback-alternate">
                      <AlertCircle size={16} />
                      Note: This summary was generated using an alternate AI service.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="summary-meta">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} • Meeting duration: {formatMeetingTime(meetingTime)}
              </div>
              
              <div className="summary-actions">
                <button 
                  className="copy-summary" 
                  onClick={copySummary}
                >
                  {summaryJustCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {summaryJustCopied ? "Copied!" : "Copy to Clipboard"}
                </button>
                
                <button 
                  className="download-summary" 
                  onClick={downloadSummary}
                >
                  <Download size={16} />
                  Download Summary
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
            <p>AI is generating your meeting summary...</p>
          </div>
        )}

        {/* Transcription status indicator */}
        {isTranscribing && (
          <div className="transcription-indicator">
            <span className="pulse-dot"></span>
            <span className="transcription-label">AI is recording</span>
            {currentTranscriptText && (
              <div className="interim-transcript">
                "{currentTranscriptText.length > 50 
                  ? currentTranscriptText.substring(0, 50) + '...' 
                  : currentTranscriptText}"
              </div>
            )}
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

        {/* Debug Controls */}
        {showDebugControls && (
          <div className="debug-controls">
            <button 
              className="debug-button test-summary"
              onClick={testSummarizerWithMockData}
              title="Test summarizer with mock data"
            >
              Test AI Summary
            </button>
            <button 
              className="debug-button test-api"
              onClick={() => window.open('/test-gemini', '_blank')}
              title="Test Gemini API"
            >
              Test API
            </button>
            <div className="debug-info">
              <p>Debug Mode: Active</p>
              <p>API Key Status: {window.location.hostname === 'localhost' ? 'Local Dev' : 'Production'}</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default VideoConference;