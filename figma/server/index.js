const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle user joining
  socket.on('user:join', ({ userId, userName }) => {
    console.log(`User ${userName} (${userId}) joined`);
    
    // Store user info
    activeUsers.set(socket.id, {
      userId,
      userName,
      color: getRandomColor(),
      position: { x: 0, y: 0 }
    });
    
    // Broadcast to all users that a new user has joined
    io.emit('users:update', Array.from(activeUsers.values()));
  });
  
  // Handle cursor movement
  socket.on('cursor:move', ({ userId, position }) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
      
      // Broadcast cursor position to all other users
      socket.broadcast.emit('cursor:update', {
        userId,
        position,
        userName: user.userName,
        color: user.color
      });
    }
  });
  
  // Handle user leaving
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('users:update', Array.from(activeUsers.values()));
  });
});

// Generate a random color for user cursor
function getRandomColor() {
  const colors = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
    '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
    '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
