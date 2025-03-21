import { io } from "socket.io-client";

// Use consistent server URL that matches backend port (3001)
// First try to detect if we're on localhost or a real server
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// Default ports to try in order
const SOCKET_PORTS = [3001, 3002, 3003];
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
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    upgrade: true
  });
};

// Create initial socket instance
let socket = createSocket(SERVER_URL);

// Connection status
let isConnected = false;
let connectionAttempts = 0;
const MAX_MANUAL_RECONNECT_ATTEMPTS = 3;

// Try next port if available
const tryNextPort = () => {
  currentPortIndex++;
  if (currentPortIndex < SOCKET_PORTS.length) {
    SERVER_URL = getServerUrl(currentPortIndex);
    console.log(`Trying next server port: ${SERVER_URL}`);
    
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }
    
    // Create new socket with next port
    socket = createSocket(SERVER_URL);
    setupEventHandlers();
    return true;
  }
  return false;
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
    
    // Try next port first before attempting reconnection on same port
    if (connectionAttempts === 0 && currentPortIndex < SOCKET_PORTS.length - 1) {
      if (tryNextPort()) {
        return; // Don't continue with reconnection logic if we're trying a new port
      }
    }
    
    if (++connectionAttempts <= MAX_MANUAL_RECONNECT_ATTEMPTS) {
      console.log(`Reconnection attempt ${connectionAttempts}/${MAX_MANUAL_RECONNECT_ATTEMPTS}...`);
      setTimeout(() => {
        console.log("Attempting to reconnect manually...");
        // Force polling transport on reconnection attempts
        socket.io.opts.transports = ["polling"];
        socket.connect();
      }, 2000 * connectionAttempts); // Increasing backoff
    }
    
    // Dispatch a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('socketError', { detail: { error: error.message }}));
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from socket server:", reason);
    isConnected = false;
    
    // Dispatch a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('socketDisconnected', { detail: { reason }}));
    
    // If this was an unexpected disconnect, try to reconnect
    if (reason === 'io server disconnect' || reason === 'transport close') {
      console.log("Unexpected disconnect, attempting to reconnect...");
      socket.connect();
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Reconnected to server after", attemptNumber, "attempts");
    isConnected = true;
    connectionAttempts = 0;
    
    // Dispatch a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('socketReconnected'));
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Socket reconnection attempt #${attemptNumber}`);
    // Try polling transport on reconnection attempts if websocket fails
    if (attemptNumber > 1) {
      socket.io.opts.transports = ["polling"];
    }
  });

  socket.on("reconnect_error", (error) => {
    console.error("Socket reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("Socket reconnection failed after all attempts");
    
    // Try next port as last resort
    if (tryNextPort()) {
      console.log("Trying alternative port after reconnection failure");
    } else {
      // Dispatch a custom event that components can listen for
      window.dispatchEvent(new CustomEvent('socketReconnectFailed'));
    }
  });
};

// Initialize event handlers
setupEventHandlers();

// Helper functions
const getConnectionStatus = () => isConnected;

const manualReconnect = () => {
  if (!isConnected) {
    console.log("Manually attempting to reconnect socket...");
    
    // Try next port if we've already attempted reconnection on this port
    if (connectionAttempts >= MAX_MANUAL_RECONNECT_ATTEMPTS && tryNextPort()) {
      return;
    }
    
    // Try polling transport for manual reconnection
    socket.io.opts.transports = ["polling"];
    socket.connect();
  }
};

// Export the socket instance and helper functions
export { getConnectionStatus, manualReconnect };
export default socket;
