const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { connectDB } = require('./db');
const http = require('http');
const { Server } = require('socket.io');

const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const taskRouter = require("./routes/task");
const commentRouter = require("./routes/comment");
const summarizerRouter = require("./routes/summarizer");
const translatorRouter = require("./routes/translator");
const mailRouter = require("./routes/mail/mailRoutes");
const filesystemRouter = require("./routes/filesystem");

const app = express();
const PORT = 3001; 

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io setup for video conferencing
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Store for breakout rooms
  const breakoutRooms = new Map();
  
  // Join a room
  socket.on('join-room', (roomId, userData) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Broadcast to all users in the room except the sender
    socket.to(roomId).emit('user-joined', { 
      id: socket.id, 
      name: userData.name,
      micOn: userData.micOn,
      cameraOn: userData.cameraOn
    });
    
    // Get all users in the room
    const users = [];
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      room.forEach(id => {
        if (id !== socket.id) {
          const userSocket = io.sockets.sockets.get(id);
          if (userSocket) {
            users.push({
              id,
              name: userSocket.userData?.name || 'Anonymous',
              micOn: userSocket.userData?.micOn || false,
              cameraOn: userSocket.userData?.cameraOn || false,
              isScreenSharing: userSocket.userData?.isScreenSharing || false
            });
          }
        }
      });
    }
    
    // Store user data
    socket.userData = {
      roomId,
      name: userData.name,
      micOn: userData.micOn,
      cameraOn: userData.cameraOn,
      isScreenSharing: false
    };
    
    // Send existing users to the new user
    socket.emit('existing-users', users);
  });
  
  // Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    
    // Notify other users
    socket.to(roomId).emit('user-left', socket.id);
  });
  
  // Handle chat messages
  socket.on('send-message', (roomId, message) => {
    console.log(`Message from ${socket.id} in room ${roomId}: ${message.text}`);
    socket.to(roomId).emit('receive-message', {
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp
    });
  });
  
  // Handle mic toggle
  socket.on('toggle-mic', (roomId, micOn) => {
    console.log(`User ${socket.id} toggled mic: ${micOn}`);
    if (socket.userData) {
      socket.userData.micOn = micOn;
    }
    socket.to(roomId).emit('user-toggle-mic', socket.id, micOn);
  });
  
  // Handle camera toggle
  socket.on('toggle-camera', (roomId, cameraOn) => {
    console.log(`User ${socket.id} toggled camera: ${cameraOn}`);
    if (socket.userData) {
      socket.userData.cameraOn = cameraOn;
    }
    socket.to(roomId).emit('user-toggle-camera', socket.id, cameraOn);
  });
  
  // Handle screen sharing start
  socket.on('screen-share-started', (userId) => {
    console.log(`User ${userId} started screen sharing`);
    if (socket.userData) {
      socket.userData.isScreenSharing = true;
      const roomId = socket.userData.roomId;
      if (roomId) {
        socket.to(roomId).emit('screen-share-started', userId);
      }
    }
  });
  
  // Handle screen sharing stop
  socket.on('screen-share-stopped', (userId) => {
    console.log(`User ${userId} stopped screen sharing`);
    if (socket.userData) {
      socket.userData.isScreenSharing = false;
      const roomId = socket.userData.roomId;
      if (roomId) {
        socket.to(roomId).emit('screen-share-stopped', userId);
      }
    }
  });
  
  // Create a breakout room
  socket.on('create-breakout-room', (data, callback) => {
    try {
      console.log(`Creating breakout room for main room: ${data.mainRoomId}`);
      const { mainRoomId, name } = data;
      
      // Create a unique ID for the breakout room
      const breakoutRoomId = `${mainRoomId}-breakout-${Date.now()}`;
      
      // Initialize the breakout room map for the main room if it doesn't exist
      if (!breakoutRooms.has(mainRoomId)) {
        breakoutRooms.set(mainRoomId, new Map());
      }
      
      // Store the breakout room info
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      mainRoomBreakouts.set(breakoutRoomId, {
        id: breakoutRoomId,
        name,
        participants: []
      });
      
      // Emit the updated breakout room list to everyone in the main room
      const updatedRooms = Array.from(mainRoomBreakouts.values());
      io.to(mainRoomId).emit('breakout-rooms-update', updatedRooms);
      
      console.log(`Breakout room created: ${breakoutRoomId} (${name})`);
      callback({ success: true, roomId: breakoutRoomId });
    } catch (error) {
      console.error('Error creating breakout room:', error);
      callback({ success: false, error: 'Failed to create breakout room' });
    }
  });
  
  // Assign participants to breakout rooms
  socket.on('assign-to-breakout-rooms', (data, callback) => {
    try {
      const { mainRoomId, assignments } = data;
      console.log(`Assigning participants to breakout rooms for main room: ${mainRoomId}`);
      
      if (!breakoutRooms.has(mainRoomId)) {
        return callback({ success: false, error: 'Main room not found' });
      }
      
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      
      // Process assignments
      for (const assignment of assignments) {
        const { participantId, roomId } = assignment;
        
        // Find the participant socket
        const participantSocket = io.sockets.sockets.get(participantId);
        if (!participantSocket) continue;
        
        // Get the breakout room
        const breakoutRoom = mainRoomBreakouts.get(roomId);
        if (!breakoutRoom) continue;
        
        // Add participant to the breakout room
        breakoutRoom.participants.push({
          id: participantId,
          name: participantSocket.userData?.name || 'Anonymous'
        });
        
        // Join the socket to the breakout room
        participantSocket.join(roomId);
        
        // Notify the participant they've been assigned
        io.to(participantId).emit('assigned-to-breakout', breakoutRoom);
      }
      
      // Emit the updated breakout room list to everyone in the main room
      const updatedRooms = Array.from(mainRoomBreakouts.values());
      io.to(mainRoomId).emit('breakout-rooms-update', updatedRooms);
      
      callback({ success: true });
    } catch (error) {
      console.error('Error assigning to breakout rooms:', error);
      callback({ success: false, error: 'Failed to assign participants' });
    }
  });
  
  // Close a breakout room
  socket.on('close-breakout-room', (data, callback) => {
    try {
      const { mainRoomId, breakoutRoomId } = data;
      console.log(`Closing breakout room: ${breakoutRoomId}`);
      
      if (!breakoutRooms.has(mainRoomId)) {
        return callback({ success: false, error: 'Main room not found' });
      }
      
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      
      // Get the breakout room
      const breakoutRoom = mainRoomBreakouts.get(breakoutRoomId);
      if (!breakoutRoom) {
        return callback({ success: false, error: 'Breakout room not found' });
      }
      
      // Notify all participants that the room is closed
      io.to(breakoutRoomId).emit('breakout-room-closed', breakoutRoomId);
      
      // Move all participants back to the main room
      const room = io.sockets.adapter.rooms.get(breakoutRoomId);
      if (room) {
        room.forEach(id => {
          const userSocket = io.sockets.sockets.get(id);
          if (userSocket) {
            userSocket.leave(breakoutRoomId);
            userSocket.join(mainRoomId);
          }
        });
      }
      
      // Remove the breakout room
      mainRoomBreakouts.delete(breakoutRoomId);
      
      // Emit the updated breakout room list to everyone in the main room
      const updatedRooms = Array.from(mainRoomBreakouts.values());
      io.to(mainRoomId).emit('breakout-rooms-update', updatedRooms);
      
      callback({ success: true });
    } catch (error) {
      console.error('Error closing breakout room:', error);
      callback({ success: false, error: 'Failed to close breakout room' });
    }
  });
  
  // Join a breakout room
  socket.on('join-breakout-room', (data) => {
    try {
      const { mainRoomId, breakoutRoomId } = data;
      console.log(`User ${socket.id} joining breakout room: ${breakoutRoomId}`);
      
      if (!breakoutRooms.has(mainRoomId)) return;
      
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      const breakoutRoom = mainRoomBreakouts.get(breakoutRoomId);
      
      if (!breakoutRoom) return;
      
      // Leave the main room and join the breakout room
      socket.leave(mainRoomId);
      socket.join(breakoutRoomId);
      
      // Notify the user they've joined the breakout room
      socket.emit('assigned-to-breakout', breakoutRoom);
      
      // Add participant to the breakout room if not already there
      const participantExists = breakoutRoom.participants.some(p => p.id === socket.id);
      if (!participantExists) {
        breakoutRoom.participants.push({
          id: socket.id,
          name: socket.userData?.name || 'Anonymous'
        });
        
        // Emit the updated breakout room list to everyone in the main room
        const updatedRooms = Array.from(mainRoomBreakouts.values());
        io.to(mainRoomId).emit('breakout-rooms-update', updatedRooms);
      }
    } catch (error) {
      console.error('Error joining breakout room:', error);
    }
  });
  
  // Return to main room
  socket.on('return-to-main-room', (data) => {
    try {
      const { mainRoomId, breakoutRoomId } = data;
      console.log(`User ${socket.id} returning to main room from breakout room: ${breakoutRoomId}`);
      
      if (!breakoutRooms.has(mainRoomId)) return;
      
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      const breakoutRoom = mainRoomBreakouts.get(breakoutRoomId);
      
      if (breakoutRoom) {
        // Remove participant from the breakout room
        breakoutRoom.participants = breakoutRoom.participants.filter(p => p.id !== socket.id);
        
        // Emit the updated breakout room list to everyone in the main room
        const updatedRooms = Array.from(mainRoomBreakouts.values());
        io.to(mainRoomId).emit('breakout-rooms-update', updatedRooms);
      }
      
      // Leave the breakout room and join the main room
      socket.leave(breakoutRoomId);
      socket.join(mainRoomId);
    } catch (error) {
      console.error('Error returning to main room:', error);
    }
  });
  
  // Broadcast message to all breakout rooms
  socket.on('broadcast-to-breakout-rooms', (data) => {
    try {
      const { mainRoomId, message } = data;
      console.log(`Broadcasting message to all breakout rooms for main room: ${mainRoomId}`);
      
      if (!breakoutRooms.has(mainRoomId)) return;
      
      const mainRoomBreakouts = breakoutRooms.get(mainRoomId);
      
      // Send message to all breakout rooms
      for (const [breakoutRoomId, room] of mainRoomBreakouts) {
        io.to(breakoutRoomId).emit('receive-message', {
          sender: 'Host',
          text: message,
          timestamp: new Date().toISOString(),
          isHostBroadcast: true
        });
      }
    } catch (error) {
      console.error('Error broadcasting to breakout rooms:', error);
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.userData && socket.userData.roomId) {
      socket.to(socket.userData.roomId).emit('user-left', socket.id);
    }
  });
});

// Middleware for parsing request bodies
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/task", taskRouter);
app.use("/comment", commentRouter);
app.use("/api", summarizerRouter);
app.use("/api", translatorRouter);
app.use("/mail", mailRouter);
app.use("/filesystem", filesystemRouter);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Start server only after connecting to MongoDB
const startBackend = async () => {
    try {
        await connectDB(); 

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Socket.io server is running`);
            console.log(`Filesystem API available at /filesystem`);
        });
    } catch (error) {
        console.error('Failed to start backend:', error);
        process.exit(1);
    }
};

startBackend(); 
