import { io } from "socket.io-client";

// Use consistent server URL that matches backend port (3001)
// First try to detect if we're on localhost or a real server
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// Default ports to try in order - only use port 3001 as we know that's the correct one
const SOCKET_PORTS = [3001];
let currentPortIndex = 0;

// Function to get the next server URL to try
const getServerUrl = (portIndex = 0) => {
  const port = SOCKET_PORTS[portIndex];
  return isLocalhost 
    ? `http://localhost:${port}`
    : `${window.location.protocol}//${window.location.hostname}:${port}`;
};

// Initial server URL
let SERVER_URL = getServerUrl(currentPortIndex);
console.log(`Connecting to socket server at: ${SERVER_URL}`);

// Create socket with more robust configuration
const createSocket = (url) => {
  console.log(`Attempting socket connection to: ${url}`);
  return io(url, {
    transports: ["polling", "websocket"], // Try polling first, then websocket
    reconnection: false, // Completely disable auto-reconnection
    timeout: 20000,
    autoConnect: true,
    forceNew: true
  });
};

// Create initial socket instance
let socket = createSocket(SERVER_URL);

// Connection status
let isConnected = false;
let connectionAttempts = 0;
const MAX_MANUAL_RECONNECT_ATTEMPTS = 0; // No reconnection attempts

// Get connection status
const getConnectionStatus = () => {
  return isConnected;
};

// Event handlers with retry logic
const setupEventHandlers = () => {
  socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
    isConnected = true;
    connectionAttempts = 0; // Reset counter on successful connection
    
    // Dispatch a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('socketConnected', { detail: { socketId: socket.id }}));
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    isConnected = false;
    
    // Don't automatically reconnect - just report the error
    window.dispatchEvent(new CustomEvent('socketError', { detail: { error: error.message }}));
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from socket server:", reason);
    isConnected = false;
    
    // Just report the disconnect, don't try to reconnect
    window.dispatchEvent(new CustomEvent('socketDisconnected', { detail: { reason }}));
  });
};

// Setup event handlers for initial socket connection
setupEventHandlers();

const manualReconnect = () => {
  if (!isConnected) {
    console.log("Manually attempting to reconnect socket...");
    socket.connect();
  }
};

// Export the socket instance and helper functions
export { getConnectionStatus, manualReconnect };
export default socket;
