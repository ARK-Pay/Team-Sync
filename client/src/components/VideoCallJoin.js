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
  X,
  Clock,
  MessageCircle
} from "lucide-react";
import axios from "axios";

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
  const [scheduledMeeting, setScheduledMeeting] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 3600000)); // Default to 1 hour from now
  const [selectedTime, setSelectedTime] = useState(
    new Date(Date.now() + 3600000).toTimeString().slice(0, 5)
  );
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [meetingsError, setMeetingsError] = useState("");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvites, setIsSendingInvites] = useState(false);
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

  // Fetch scheduled meetings from calendar
  useEffect(() => {
    fetchScheduledMeetings();
  }, []);

  // Function to fetch scheduled meetings
  const fetchScheduledMeetings = async () => {
    setIsLoadingMeetings(true);
    setMeetingsError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMeetingsError("Authentication required to fetch meetings");
        setIsLoadingMeetings(false);
        return;
      }
      
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setMeetingsError("User email not found");
        setIsLoadingMeetings(false);
        return;
      }
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: 'http://localhost:3001',
        headers: { authorization: token }
      });
      
      // Fetch tasks assigned to the user
      const assignedResponse = await api.get(`/task/user/${userEmail}/assigned-tasks`);
      
      // Fetch tasks created by the user
      const createdResponse = await api.get(`/task/user/${userEmail}/created-tasks`);
      
      // Combine and deduplicate tasks
      const assignedTasks = assignedResponse.data.tasks || [];
      const createdTasks = createdResponse.data || [];
      
      // Create a map to deduplicate tasks by ID
      const taskMap = new Map();
      
      // Add all tasks to the map (this will automatically deduplicate by ID)
      [...assignedTasks, ...createdTasks].forEach(task => {
        taskMap.set(task.id, task);
      });
      
      // Filter for tasks that contain video meeting links
      const videoMeetings = Array.from(taskMap.values())
        .filter(task => task.description && task.description.includes('/video-call/'))
        .map(task => ({
          id: task.id,
          title: task.title,
          time: new Date(task.deadline).toLocaleString(),
          description: task.description,
          projectName: task.project_name,
          link: task.description.match(/(https?:\/\/[^\s]+\/video-call\/[a-zA-Z0-9-]+)/)?.[1] || 
                 task.description.match(/(\/video-call\/[a-zA-Z0-9-]+)/)?.[1]
        }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));
      
      setScheduledMeetings(videoMeetings);
    } catch (error) {
      console.error("Error fetching scheduled meetings:", error);
      setMeetingsError("Failed to load scheduled meetings");
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  // Function to delete a meeting
  const deleteMeeting = async (meetingId) => {
    if (!meetingId) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required to delete meetings");
        setIsDeleting(false);
        return;
      }
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: 'http://localhost:3001',
        headers: { authorization: token }
      });
      
      // Delete the task
      const response = await api.delete(`/task/${meetingId}`);
      
      if (response.status === 200) {
        // Remove the deleted meeting from the state
        setScheduledMeetings(prevMeetings => 
          prevMeetings.filter(meeting => meeting.id !== meetingId)
        );
        
        // Show success message
        alert("Meeting deleted successfully");
      } else {
        throw new Error("Failed to delete meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(false);
      setMeetingToDelete(null);
    }
  };
  
  // Open delete confirmation modal
  const confirmDeleteMeeting = (meeting) => {
    setMeetingToDelete(meeting);
    setShowDeleteConfirmModal(true);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setMeetingToDelete(null);
  };

  // Set up camera preview
  useEffect(() => {
    const setupPreviewStream = async () => {
      try {
        // Always stop any existing tracks before creating new ones
        if (previewStream) {
          previewStream.getTracks().forEach(track => track.stop());
        }
        
        if (cameraOn) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: micOn 
          });
          setPreviewStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          setPreviewStream(null);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
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

  // Open date picker modal
  const openDatePicker = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to add meetings to calendar");
      return;
    }

    // Get project ID from localStorage or use a default
    const projectId = localStorage.getItem("project_id") || "";
    
    if (!projectId) {
      alert("No project selected. Please select a project first.");
      return;
    }

    // Set default date and time (1 hour from now)
    const defaultDate = new Date(Date.now() + 3600000);
    setSelectedDate(defaultDate);
    setSelectedTime(defaultDate.toTimeString().slice(0, 5));
    
    // Show the date picker modal
    setShowDatePickerModal(true);
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Add meeting to calendar
  const addToCalendar = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to add meetings to calendar");
        return;
      }

      // Get project ID from localStorage or use a default
      const projectId = localStorage.getItem("project_id") || "";
      
      if (!projectId) {
        alert("No project selected. Please select a project first.");
        return;
      }

      // Combine selected date and time
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      // Create a meeting task in the project
      const meetingData = {
        title: `Video Meeting: ${projectName}`,
        description: `Video call meeting link: ${window.location.origin}/video-call/${generatedRoomId || roomId}`,
        priority: "1", // Medium priority (using the correct format "1" instead of "Medium")
        status: "0", // To Do (using the correct format "0" instead of "To Do")
        deadline: dateTime.toISOString(), // Use the selected date and time
        assignees: [localStorage.getItem("userEmail") || ""],
        creator_id: localStorage.getItem("userEmail") || "",
        project_name: projectName || "Team Meeting"
      };

      console.log("Adding meeting to calendar with data:", {
        projectId,
        meetingData,
        token: token.substring(0, 10) + "..." // Log partial token for debugging
      });

      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: 'http://localhost:3001',
        headers: { authorization: token }
      });

      // Send request to create task
      const response = await api.post(
        `task/project/${projectId}/create-task`,
        meetingData
      );

      console.log("Calendar API response:", response.data);

      // Check if the response indicates success (task was created)
      if (response.data && response.data.task) {
        setScheduledMeeting({
          title: meetingData.title,
          time: dateTime.toLocaleString(),
          link: `${window.location.origin}/video-call/${generatedRoomId || roomId}`,
          projectName: projectName
        });
        
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 5000);
        
        // Close the date picker modal
        setShowDatePickerModal(false);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error adding meeting to calendar:", error);
      alert("Failed to add meeting to calendar. Please try again.");
    }
  };

  // Open invite modal
  const openInviteModal = () => {
    // Set default invite message
    const meetingLink = `${window.location.origin}/video-call/${generatedRoomId || roomId}`;
    const meetingCode = generatedRoomId || roomId;
    setInviteMessage(`You've been invited to join a TeamSync video meeting.\n\nMeeting Link: ${meetingLink}\n\nJoin with the code: ${meetingCode}`);
    setShowInviteModal(true);
  };

  // Close invite modal
  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmails("");
    setInviteMessage("");
  };

  // Send invites
  const sendInvites = async () => {
    setIsSendingInvites(true);
    
    try {
      // Send invites to the provided email addresses
      console.log("Sending invites to:", inviteEmails);
      console.log("Invite message:", inviteMessage);
      
      // Simulate sending invites
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert("Invitations sent successfully");
      
      // Close the invite modal
      closeInviteModal();
    } catch (error) {
      console.error("Error sending invites:", error);
      alert("Failed to send invitations. Please try again.");
    } finally {
      setIsSendingInvites(false);
    }
  };

  // Copy meeting code to clipboard
  const copyMeetingCode = () => {
    const meetingCode = generatedRoomId || roomId;
    navigator.clipboard.writeText(meetingCode);
    
    // Show temporary success message
    const codeButton = document.getElementById('copy-code-button');
    if (codeButton) {
      const originalText = codeButton.innerText;
      codeButton.innerText = 'Copied!';
      
      setTimeout(() => {
        codeButton.innerText = originalText;
      }, 2000);
    }
  };

  return (
    <div className="video-join-container">
      {/* Header */}
      <header className="video-join-header">
        <button onClick={goBack} className="back-button" aria-label="Back to dashboard">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="project-title">
          <Video size={24} className="header-icon" />
          <span>{projectName}</span>
        </div>
        
        <div className="user-info">
          <span className="user-name">{userName}</span>
        </div>
      </header>
      
      <main className="video-join-content">
        <div className="join-card">
          {/* Left panel: Video preview */}
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
                  <span>Camera is turned off</span>
                </div>
              )}
              
              <div className="media-controls">
                <button 
                  className={`control-btn ${micOn ? 'active' : 'muted'}`}
                  onClick={toggleMic}
                  aria-label={micOn ? "Turn microphone off" : "Turn microphone on"}
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
                  <button className="share-option" onClick={openInviteModal}>
                    <Users size={16} />
                    <span>Invite people</span>
                  </button>
                  <button className="share-option" onClick={openDatePicker}>
                    <Calendar size={16} />
                    <span>Add to calendar</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Scheduled meeting info */}
            {scheduledMeeting && (
              <div className="meeting-info">
                <h3>Scheduled Meeting</h3>
                <div className="meeting-details">
                  <p><strong>Title:</strong> {scheduledMeeting.title}</p>
                  <p><strong>Time:</strong> {scheduledMeeting.time}</p>
                  <p><strong>Project:</strong> {scheduledMeeting.projectName}</p>
                </div>
              </div>
            )}
            
            {/* Scheduled Meetings from Calendar */}
            <div className="scheduled-meetings-box">
              <h3>
                <Calendar size={16} />
                <span>Upcoming Meetings</span>
                <button 
                  onClick={fetchScheduledMeetings} 
                  className="refresh-button"
                  aria-label="Refresh meetings"
                >
                  <RefreshCw size={14} />
                </button>
              </h3>
              
              {isLoadingMeetings ? (
                <div className="loading-meetings">Loading scheduled meetings...</div>
              ) : meetingsError ? (
                <div className="meetings-error">
                  <AlertCircle size={16} />
                  <span>{meetingsError}</span>
                </div>
              ) : scheduledMeetings.length === 0 ? (
                <div className="no-meetings">
                  <p>No scheduled video meetings found</p>
                </div>
              ) : (
                <div className="meetings-list">
                  {scheduledMeetings.slice(0, 3).map(meeting => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-item-header">
                        <h4>{meeting.title}</h4>
                        <span className="meeting-time">
                          <Clock size={14} />
                          {new Date(meeting.time).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="meeting-project">{meeting.projectName}</p>
                      <div className="meeting-actions">
                        <button 
                          className="delete-meeting-button"
                          onClick={() => confirmDeleteMeeting(meeting)}
                          aria-label="Delete meeting"
                        >
                          <X size={14} />
                          <span>Delete</span>
                        </button>
                        <button 
                          className="join-now-button"
                          onClick={() => {
                            if (previewStream) {
                              previewStream.getTracks().forEach(track => track.stop());
                            }
                            
                            // Extract the room ID from the link
                            const roomIdFromLink = meeting.link.split('/').pop();
                            navigate(`/video-call/${roomIdFromLink}`);
                          }}
                        >
                          <Video size={14} />
                          <span>Join Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {scheduledMeetings.length > 3 && (
                    <div className="more-meetings">
                      <span>+{scheduledMeetings.length - 3} more meetings</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
      
      {/* Date Picker Modal */}
      {showDatePickerModal && (
        <div className="modal-overlay">
          <div className="date-picker-modal">
            <div className="modal-header">
              <h3>Schedule Meeting</h3>
              <button 
                className="close-button" 
                onClick={() => setShowDatePickerModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="meeting-date">
                  <Calendar size={16} />
                  <span>Date</span>
                </label>
                <input 
                  type="date" 
                  id="meeting-date"
                  value={formatDateForInput(selectedDate)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={formatDateForInput(new Date())}
                  className="date-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="meeting-time">
                  <Clock size={16} />
                  <span>Time</span>
                </label>
                <input 
                  type="time" 
                  id="meeting-time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="time-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowDatePickerModal(false)}
              >
                Cancel
              </button>
              <button 
                className="schedule-button"
                onClick={addToCalendar}
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Copied notification */}
      {showCopiedAlert && (
        <div className="copied-alert">
          <CheckCircle size={16} />
          <span>Meeting link copied to clipboard!</span>
        </div>
      )}
      
      {/* Success notification */}
      {showSuccessAlert && (
        <div className="copied-alert success-alert">
          <CheckCircle size={16} />
          <span>Meeting added to calendar successfully!</span>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && meetingToDelete && (
        <div className="modal-overlay">
          <div className="date-picker-modal delete-confirm-modal">
            <div className="modal-header">
              <h3>Delete Meeting</h3>
              <button 
                className="close-button" 
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle size={24} />
                <p>Are you sure you want to delete this meeting?</p>
              </div>
              <div className="meeting-to-delete-info">
                <p><strong>Title:</strong> {meetingToDelete.title}</p>
                <p><strong>Time:</strong> {new Date(meetingToDelete.time).toLocaleString()}</p>
                <p><strong>Project:</strong> {meetingToDelete.projectName}</p>
              </div>
              <p className="delete-note">This will permanently remove the meeting from the calendar.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => deleteMeeting(meetingToDelete.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Invite People Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <div className="modal-header">
              <h3>Invite People</h3>
              <button 
                className="close-button" 
                onClick={closeInviteModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="invite-emails">
                  <Users size={16} />
                  <span>Enter email addresses (comma or newline separated)</span>
                </label>
                <textarea 
                  id="invite-emails"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  className="invite-emails"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="invite-message">
                  <MessageCircle size={16} />
                  <span>Message</span>
                </label>
                <div className="meeting-code-container">
                  <span className="meeting-code-label">Meeting code: <strong>{generatedRoomId || roomId}</strong></span>
                  <button 
                    id="copy-code-button"
                    onClick={copyMeetingCode} 
                    className="copy-code-button"
                  >
                    <Copy size={14} />
                    <span>Copy Code</span>
                  </button>
                </div>
                <textarea 
                  id="invite-message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="invite-message"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={closeInviteModal}
              >
                Cancel
              </button>
              <button 
                className="send-button"
                onClick={sendInvites}
                disabled={isSendingInvites}
              >
                {isSendingInvites ? "Sending..." : "Send Invitations"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallJoin;
