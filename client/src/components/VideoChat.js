import React, { useState, useEffect, useRef } from "react";
import socket from "../websocket"; // Import the shared socket instance
import Peer from "simple-peer";
import { v4 as uuidv4 } from "uuid"; // To generate unique Room IDs

import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, IconButton, Tooltip } from "@mui/material";
import { Users } from "lucide-react";
import BreakoutRoom from "./BreakoutRoom";
import "./VideoChat.css"; // Ensure you have this imported for styling

const VideoChat = () => {
    const { roomId } = useParams(); // Fetch roomId from URL params
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [showBreakoutRoom, setShowBreakoutRoom] = useState(false);
    const [userName, setUserName] = useState("");
    const myVideo = useRef();
    const navigate = useNavigate();
    const [currentRoomId, setCurrentRoomId] = useState(roomId || ""); // Default roomId is empty if not passed

    useEffect(() => {
        if (roomId) {
            // Set current user as host if they created the room
            const storedUserName = localStorage.getItem('userName') || `User-${Math.floor(Math.random() * 1000)}`;
            setUserName(storedUserName);
            
            // First user to join is the host
            if (peers.length === 0) {
                setIsHost(true);
            }

            // Get user media (camera and microphone) and join the room
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
                setStream(mediaStream);
                if (myVideo.current) myVideo.current.srcObject = mediaStream;
                
                // Join room with user info
                socket.emit("join-room", {
                    roomId,
                    userId: socket.id,
                    userName: storedUserName,
                    isHost: peers.length === 0
                });
            });

            // Update participants when users connect/disconnect
            socket.on("room-participants", (roomParticipants) => {
                setParticipants(roomParticipants);
            });

            socket.on("user-connected", (userData) => {
                const { userId, userName } = userData;
                const peer = new Peer({ initiator: true, trickle: false, stream });

                peer.on("signal", (signal) => {
                    socket.emit("send-signal", { userId, signal });
                });

                peer.on("stream", (userStream) => {
                    setPeers((prev) => [...prev, { id: userId, name: userName, stream: userStream }]);
                });

                socket.on("receive-signal", ({ signal }) => {
                    peer.signal(signal);
                });
            });

            socket.on("user-disconnected", (userId) => {
                setPeers(peers => peers.filter(peer => peer.id !== userId));
            });
        }

        return () => {
            // Clean up all media streams first
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            
            // Leave room if we're in one
            if (roomId) {
                socket.emit("leave-room", roomId);
            }
            
            // Clean up socket listeners
            socket.off("room-participants");
            socket.off("user-connected");
            socket.off("user-disconnected");
            socket.off("receive-signal");
            
            // Don't disconnect the socket completely, just leave the room
            // This prevents the socket connection cycle
            // socket.disconnect();
        };
    }, [roomId, stream]);

    // Function to join an existing room
    const joinRoom = () => {
        if (currentRoomId.trim()) {
            // Store user name for use in the room
            const userNameInput = document.getElementById("userName").value;
            if (userNameInput) {
                localStorage.setItem('userName', userNameInput);
                setUserName(userNameInput);
            }
            navigate(`/video-call/${currentRoomId}`); // Join the room based on entered room ID
        }
    };

    // Function to create a new room with a unique ID
    const createRoom = () => {
        const newRoomId = uuidv4().slice(0, 8); // Generate an 8-character unique ID
        setCurrentRoomId(newRoomId);
        
        // Store user name for use in the room
        const userNameInput = document.getElementById("userName").value;
        if (userNameInput) {
            localStorage.setItem('userName', userNameInput);
            setUserName(userNameInput);
        }
        
        setIsHost(true); // Creator is the host
        navigate(`/video-call/${newRoomId}`); // Navigate to the generated room ID
    };

    // Toggle breakout room visibility
    const toggleBreakoutRoom = () => {
        setShowBreakoutRoom(!showBreakoutRoom);
    };

    // Close breakout room panel
    const closeBreakoutRoom = () => {
        setShowBreakoutRoom(false);
    };

    return (
        <div className="video-chat-container">
            {!roomId ? (
                <div>
                    <h2>Enter Room ID or Create New</h2>
                    <div className="user-input-group">
                        <TextField
                            id="userName"
                            label="Your Name"
                            defaultValue={localStorage.getItem('userName') || ""}
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                        />
                    </div>
                    <div className="button-group">
                        <TextField
                            label="Enter Room ID"
                            value={currentRoomId}
                            onChange={(e) => setCurrentRoomId(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                        <Button variant="contained" color="primary" onClick={joinRoom} disabled={!currentRoomId}>
                            Join Room
                        </Button>
                        <Button variant="contained" color="secondary" onClick={createRoom}>
                            Generate Room ID
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="video-header">
                        <h2>Room ID: {roomId}</h2>
                        {isHost && (
                            <Tooltip title="Breakout Rooms">
                                <IconButton 
                                    color="primary" 
                                    onClick={toggleBreakoutRoom}
                                    className="breakout-button"
                                >
                                    <Users />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                    <div className="video-container">
                        <div className="video-participant">
                            <video ref={myVideo} autoPlay muted className="video-box" />
                            <div className="participant-name">{userName} (You)</div>
                        </div>
                        {peers.map((peer) => (
                            <div key={peer.id} className="video-participant">
                                <video 
                                    ref={(video) => { if (video) video.srcObject = peer.stream }} 
                                    autoPlay 
                                    className="video-box" 
                                />
                                <div className="participant-name">{peer.name || 'Participant'}</div>
                            </div>
                        ))}
                    </div>

                    {/* Breakout Room Component */}
                    {showBreakoutRoom && (
                        <BreakoutRoom 
                            socket={socket} 
                            roomId={roomId} 
                            participants={[
                                { id: socket.id, name: userName, isLocal: true },
                                ...peers.map(peer => ({ id: peer.id, name: peer.name || 'Participant', isLocal: false }))
                            ]}
                            isHost={isHost}
                            onClose={closeBreakoutRoom}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoChat;
