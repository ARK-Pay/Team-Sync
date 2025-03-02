const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const router = express.Router();

// Load API Key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Gemini API key is not set in the environment variables.");
}

router.post("/summarize", async (req, res) => {
    const { text } = req.body;  // Ensure 'text' is being sent from the frontend
  
    if (!text) {
      return res.status(400).json({ error: "Text is required for summarization" });
    }
  
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            { parts: [{ text: `Summarize this text: ${text}` }] }
          ]
        },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const summary = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate summary";
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating summary:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });
  

module.exports = router;
