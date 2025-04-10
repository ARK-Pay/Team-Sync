import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import './BreakoutRoom.css';

const BreakoutRoom = ({ socket, roomId, participants, isHost, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState({});
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Initialize with main room
  useEffect(() => {
    setRooms([{ id: roomId, name: 'Main Room', participants: [...participants] }]);
  }, [roomId, participants]);

  // Listen for breakout room events from server
  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on('breakout-rooms-update', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    // Listen for room assignment
    socket.on('assigned-to-breakout', (roomData) => {
      setCurrentRoom(roomData);
      showSuccess(`You've been assigned to ${roomData.name}`);
    });

    // Listen for room closure
    socket.on('breakout-room-closed', (roomId) => {
      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom(null);
        showSuccess('Returning to main room');
      }
    });

    return () => {
      socket.off('breakout-rooms-update');
      socket.off('assigned-to-breakout');
      socket.off('breakout-room-closed');
    };
  }, [socket, currentRoom]);

  const createRoom = () => {
    if (!newRoomName.trim()) {
      showError('Please enter a room name');
      return;
    }

    setLoading(true);
    socket.emit('create-breakout-room', { 
      mainRoomId: roomId, 
      name: newRoomName.trim() 
    }, (response) => {
      setLoading(false);
      if (response.success) {
        setNewRoomName('');
        showSuccess(`Room "${newRoomName}" created successfully`);
      } else {
        showError(response.error || 'Failed to create room');
      }
    });
  };

  const assignParticipants = () => {
    const assignments = Object.entries(selectedParticipants)
      .filter(([_, roomId]) => roomId) // Filter out unassigned participants
      .map(([participantId, roomId]) => ({ participantId, roomId }));

    if (assignments.length === 0) {
      showError('No participants assigned');
      return;
    }

    setLoading(true);
    socket.emit('assign-to-breakout-rooms', { 
      mainRoomId: roomId, 
      assignments 
    }, (response) => {
      setLoading(false);
      if (response.success) {
        showSuccess('Participants assigned successfully');
        // Clear selections
        setSelectedParticipants({});
      } else {
        showError(response.error || 'Failed to assign participants');
      }
    });
  };

  const closeBreakoutRoom = (roomId) => {
    setLoading(true);
    socket.emit('close-breakout-room', { 
      mainRoomId: roomId, 
      breakoutRoomId: roomId 
    }, (response) => {
      setLoading(false);
      if (response.success) {
        showSuccess('Breakout room closed');
      } else {
        showError(response.error || 'Failed to close room');
      }
    });
  };

  const joinBreakoutRoom = (roomId) => {
    socket.emit('join-breakout-room', { 
      mainRoomId: roomId, 
      breakoutRoomId: roomId 
    });
  };

  const returnToMainRoom = () => {
    socket.emit('return-to-main-room', { 
      mainRoomId: roomId, 
      breakoutRoomId: currentRoom?.id 
    });
    setCurrentRoom(null);
  };

  const broadcastToAll = (message) => {
    if (!message.trim()) return;
    
    socket.emit('broadcast-to-breakout-rooms', { 
      mainRoomId: roomId, 
      message: message.trim() 
    });
  };

  const handleParticipantAssignment = (participantId, roomId) => {
    setSelectedParticipants(prev => ({
      ...prev,
      [participantId]: roomId
    }));
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  // If user is not a host and not in a breakout room, show minimal UI
  if (!isHost && !currentRoom) {
    return (
      <div className="breakout-room-container">
        <div className="breakout-room-header">
          <h3>Breakout Rooms</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="breakout-room-content">
          <p className="breakout-info-text">
            Waiting for the host to assign you to a breakout room.
          </p>
        </div>
      </div>
    );
  }

  // If user is in a breakout room, show room UI
  if (currentRoom) {
    return (
      <div className="breakout-room-container">
        <div className="breakout-room-header">
          <h3>{currentRoom.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="breakout-room-content">
          <div className="current-room-info">
            <p>You are currently in a breakout room.</p>
            <button 
              className="return-to-main-btn"
              onClick={returnToMainRoom}
            >
              Return to Main Room
            </button>
          </div>
          
          <div className="room-participants">
            <h4>Participants in this room</h4>
            <ul className="participant-list">
              {currentRoom.participants.map(participant => (
                <li key={participant.id} className="participant-item">
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="participant-name">{participant.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Host UI for managing breakout rooms
  return (
    <div className="breakout-room-container">
      <div className="breakout-room-header">
        <h3>Breakout Rooms</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Notification messages */}
      {error && (
        <div className="notification error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="notification success">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Tab navigation */}
      <div className="breakout-room-tabs">
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage
        </button>
      </div>

      <div className="breakout-room-content">
        {activeTab === 'create' ? (
          <div className="create-room-tab">
            <div className="create-room-form">
              <input
                type="text"
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="room-name-input"
              />
              <button 
                className="create-room-btn"
                onClick={createRoom}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <UserPlus size={16} />}
                Create Room
              </button>
            </div>

            <div className="assign-participants">
              <h4>Assign Participants</h4>
              <div className="participant-assignment-grid">
                {participants.filter(p => !p.isLocal).map(participant => (
                  <div key={participant.id} className="participant-assignment-row">
                    <div className="participant-info">
                      <div className="participant-avatar">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="participant-name">{participant.name}</span>
                    </div>
                    <select
                      value={selectedParticipants[participant.id] || ''}
                      onChange={(e) => handleParticipantAssignment(participant.id, e.target.value)}
                      className="room-select"
                    >
                      <option value="">Select Room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button 
                className="assign-btn"
                onClick={assignParticipants}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <Users size={16} />}
                Assign Participants
              </button>
            </div>
          </div>
        ) : (
          <div className="manage-rooms-tab">
            <h4>Active Breakout Rooms</h4>
            {rooms.length <= 1 ? (
              <p className="no-rooms-message">No breakout rooms created yet.</p>
            ) : (
              <div className="rooms-list">
                {rooms.filter(room => room.id !== roomId).map(room => (
                  <div key={room.id} className="room-item">
                    <div className="room-info">
                      <h5 className="room-name">{room.name}</h5>
                      <span className="participant-count">
                        {room.participants.length} participants
                      </span>
                    </div>
                    <div className="room-actions">
                      <button 
                        className="join-room-btn"
                        onClick={() => joinBreakoutRoom(room.id)}
                      >
                        Join
                      </button>
                      <button 
                        className="close-room-btn"
                        onClick={() => closeBreakoutRoom(room.id)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="broadcast-message">
              <h4>Broadcast Message</h4>
              <div className="broadcast-form">
                <input
                  type="text"
                  placeholder="Message to all breakout rooms"
                  className="broadcast-input"
                />
                <button className="broadcast-btn">
                  Broadcast
                </button>
              </div>
            </div>

            <button className="close-all-rooms-btn">
              Close All Breakout Rooms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakoutRoom;