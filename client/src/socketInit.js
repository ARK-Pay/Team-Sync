/**
 * Socket Initialization Module
 * 
 * This file initializes the socket connection with a delay to prevent 
 * immediate reconnections and cyclical connection issues.
 */

import socket from './websocket';

// Delay socket connection initialization
let socketConnected = false;

// Set a flag to prevent multiple reconnection loops
let socketInitialized = false;

// Initialize socket only once when the app starts
if (!socketInitialized) {
  socketInitialized = true;
  
  // Wait for the DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting before initializing socket...');
    
    // Wait 2 seconds before attempting to connect
    setTimeout(() => {
      if (!socketConnected) {
        console.log('Initializing socket connection...');
        // The socket is already created in websocket.js
        // We're just making sure it doesn't auto-reconnect excessively
        
        // You can add additional initialization logic here if needed
        
        socketConnected = true;
      }
    }, 2000);
  });
}

// Export the initialized socket instance
export default socket; 