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

// Start server only after connecting to MongoDB
const startBackend = async () => {
    try {
        await connectDB(); 

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Socket.io server is running`);
        });
    } catch (error) {
        console.error('Failed to start backend:', error);
        process.exit(1);
    }
};

startBackend(); 
