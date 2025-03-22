import express from "express";
import http from "http";
import { Server } from "socket.io";
import mediasoup from "mediasoup";
import cors from "cors";
import axios from "axios";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Use middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Test endpoint for Gemini API
app.get('/test-gemini', async (req, res) => {
  require('dotenv').config();
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not found in environment" });
  }
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: "Hello, please respond with 'Gemini API is working'" }] }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    res.json({ 
      success: true, 
      message: "API test successful", 
      response: result,
      apiKeyLength: GEMINI_API_KEY.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || "No additional details"
    });
  }
});

// Test route for the summarizer
app.get('/test-summarizer', async (req, res) => {
  try {
    const mockTranscript = `
Alice: Hi everyone, let's begin our project planning meeting for the new mobile app.
Bob: Thanks Alice. I've been working on the UI designs and have completed about 70% of the screens.
Charlie: That's great progress Bob. Did you consider the dark mode requirements we discussed last week?
Bob: Yes, all screens have both light and dark mode variants. I'll share the Figma link after the meeting.
Alice: Perfect. What about the backend API? David, any updates on that front?
David: I've set up the basic structure and implemented the authentication endpoints. Still working on the data models for the content management system.
Alice: When do you think that will be ready for testing?
David: I should have it ready by next Friday. I'll need some test data to work with though.
Charlie: I can help with generating test data. I'll prepare some JSON fixtures this week.
Alice: Great! Let's also discuss the project timeline. We initially planned to launch in December, but we might need to push it to January.`;

    // Forward the request to our summarizer route
    const summarizerResponse = await axios.post('http://localhost:3001/api/summarize', 
      { text: mockTranscript },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    res.json({
      success: true,
      summary: summarizerResponse.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || "No additional details"
    });
  }
});

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: { "x-google-start-bitrate": 1000 },
  },
];

let worker, router;
const transports = {};
const producers = {};
const consumers = {};

async function startMediasoup() {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({ mediaCodecs });
  console.log("✅ Mediasoup Router Created!");
}

startMediasoup();

io.on("connection", (socket) => {
  console.log(`🔗 User Connected: ${socket.id}`);

  socket.on("get-rtp-capabilities", (callback) => {
    callback(router.rtpCapabilities);
  });

  socket.on("create-transport", async (_, callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.1.81" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    transports[socket.id] = transport;
    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  socket.on("create-transport", async (data, callback) => {
    if (typeof callback !== "function") {
      console.error("❌ Missing or invalid callback function for create-transport");
      return;
    }
  
    try {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.1.81" }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });
  
      transports[socket.id] = transport;
      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("❌ Error creating transport:", error);
      callback({ error: "Failed to create transport" });
    }
  });

  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    if (!rtpParameters.codecs) return callback({ error: "Missing RTP codecs" });

    const transport = transports[socket.id];
    const producer = await transport.produce({ kind, rtpParameters });

    producers[socket.id] = producer;
    socket.broadcast.emit("new-producer", { id: producer.id });
    callback({ id: producer.id });
  });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return callback({ error: "Cannot consume" });
    }

    const transport = transports[socket.id];
    const consumer = await transport.consume({ producerId, rtpCapabilities, paused: false });

    consumers[socket.id] = consumer;
    callback({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
    if (producers[socket.id]) producers[socket.id].close();
    if (consumers[socket.id]) consumers[socket.id].close();
    delete producers[socket.id];
    delete consumers[socket.id];
    delete transports[socket.id];
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});


