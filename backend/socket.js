const socket = io("http://localhost:5000");  // Connect to backend on port 5000

// Log when the connection is established
socket.on("connect", () => {
  console.log("Connected to server with socket ID:", socket.id);
});

// Log when disconnected
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Example: Handle 'screen-shared' event (if relevant to your app)
socket.on("screen-shared", (data) => {
  console.log("Screen shared with data:", data);
});
