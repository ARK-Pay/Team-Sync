const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const router = express.Router();

// Load API Key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("ERROR: Gemini API key is not set in the environment variables.");
}

// Add a test endpoint to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Summarizer API is working" });
});

router.post("/summarize", async (req, res) => {
    console.log("Summarize request received");
    const { text } = req.body;  // Get the transcript text from the request
    
    if (!text) {
      console.error("Error: No text provided for summarization");
      return res.status(400).json({ error: "Text is required for summarization" });
    }
    
    console.log(`Received text for summarization: ${text.length} characters`);
    
    if (!GEMINI_API_KEY) {
      console.error("Error: Gemini API key is missing");
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }
  
    try {
      // Create a more detailed prompt for better summarization
      const prompt = `
You are an expert meeting summarizer. Analyze the following meeting transcript and create a comprehensive summary.

TRANSCRIPT:
${text}

If the transcript is too short, contains nonsensical content, or doesn't appear to be a real meeting, please indicate this in your summary but still attempt to extract any meaningful information.

Please provide:
1. A concise overview of the meeting (2-3 sentences)
2. Key points discussed (bullet points)
3. Main decisions made (if any)
4. Action items/next steps (if any)
5. A list of the main topics discussed (as a JSON array)

Format your response EXACTLY as follows:
MEETING SUMMARY:
[Overview]

KEY POINTS:
- [Point 1]
- [Point 2]
...

DECISIONS:
- [Decision 1]
- [Decision 2]
...

ACTION ITEMS:
- [Item 1]
- [Item 2]
...

TOPICS:
["Topic 1", "Topic 2", "Topic 3", ...]

Note: It is critical to follow this exact format, especially for the TOPICS section which must be a valid JSON array with double quotes.
If there are no decisions or action items, include the section headers but write "None identified." below them.
For the TOPICS array, if no clear topics can be identified, use ["Meeting discussion"] as a default.
`;

      console.log("Sending request to Gemini API");
      
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      console.log(`Using Gemini endpoint: ${geminiEndpoint}`);
      
      const payload = {
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024
        }
      };
      
      console.log("Request payload (partial):", { 
        endpoint: geminiEndpoint,
        apiKeyLength: GEMINI_API_KEY.length,
        promptLength: prompt.length
      });
      
      const response = await axios.post(
        geminiEndpoint,
        payload,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 25000 // 25 second timeout
        }
      );
  
      console.log("Gemini API response received:", {
        status: response.status,
        hasData: !!response.data,
        hasCandidates: !!response.data.candidates,
        candidatesLength: response.data.candidates?.length
      });
      
      // Extract the summary from the Gemini API response
      const summaryText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate summary";
      
      // Clean up the summary to ensure proper formatting
      const cleanedSummary = summaryText
        .replace(/```json\s*(.*?)\s*```/gs, '$1') // Remove code blocks if present
        .replace(/TOPICS:\s*(\[.*?\])\s*$/s, (match, p1) => {
          try {
            // Validate if the topics array is valid JSON
            JSON.parse(p1);
            return `TOPICS:\n${p1}`;
          } catch (e) {
            // If not valid JSON, try to fix it
            console.log("Fixing invalid JSON topics array");
            const fixedJson = p1
              .replace(/'/g, '"')            // Replace single quotes with double quotes
              .replace(/(\w+):/g, '"$1":')   // Add quotes around keys
              .replace(/,\s*]/g, ']');       // Remove trailing commas
              
            try {
              JSON.parse(fixedJson);
              return `TOPICS:\n${fixedJson}`;
            } catch (e2) {
              // If still not valid, return a basic format
              return 'TOPICS:\n[]';
            }
          }
        });
      
      console.log("Cleaned summary:", cleanedSummary);
      
      // Extract topics from the summary if possible
      let topics = [];
      
      try {
        // Find the topics section
        const topicsMatch = cleanedSummary.match(/TOPICS:\s*\[(.*?)\]/s);
        if (topicsMatch && topicsMatch[1]) {
          // Try to parse topics as JSON array
          const topicsString = `[${topicsMatch[1]}]`;
          topics = JSON.parse(topicsString.replace(/'/g, '"')); // Replace single quotes with double quotes
          console.log("Successfully extracted topics:", topics);
        } else {
          console.log("No topics section found in the summary");
        }
      } catch (parseError) {
        console.error("Error parsing topics:", parseError);
        // If failed to parse, extract topics using regex
        const topicMatches = cleanedSummary.match(/TOPICS:[\s\n]*(?:-\s*([^\n]+)[\s\n]*)+/);
        if (topicMatches) {
          topics = topicMatches[0].split('\n').slice(1).map(t => t.replace(/^-\s*/, '').trim());
          console.log("Extracted topics using fallback method:", topics);
        }
      }
      
      // Return the summary and topics
      res.json({ 
        summary: cleanedSummary,
        topics: topics
      });
      
      console.log("Summary successfully sent to client");
    } catch (error) {
      console.error("Error generating summary:");
      console.error("Error message:", error.message);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      }
      
      res.status(500).json({ 
        error: "Failed to generate summary", 
        message: error.message,
        details: error.response?.data || "No additional details"
      });
    }
});
  
module.exports = router;
