const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const router = express.Router();

router.post("/summarize", async (req, res) => {
  console.log("📣 Summarize endpoint hit!");
  console.log("📦 Request body:", req.body);
  
  const text = req.body.text;  
  
  if (!text) {
    console.error("❌ No text provided for summarization");
    return res.status(400).json({ error: "Text is required for summarization" });
  }

  console.log(`📝 Received content of length: ${text.length} characters`);
  
  try {
    // Use local summarization only - no external API calls
    console.log("🔍 Processing with local summarization...");
    
    // Extract participants and their messages
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const participants = new Set();
    const messagesByParticipant = {};
    
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const speaker = parts[0].trim();
        const message = parts.slice(1).join(':').trim();
        participants.add(speaker);
        
        if (!messagesByParticipant[speaker]) {
          messagesByParticipant[speaker] = [];
        }
        messagesByParticipant[speaker].push(message);
      }
    });
    
    // Basic sentence extraction for key points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    // Extract potential topics using word frequency
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'you', 'is', 'are', 'were', 'was', 'be', 'that', 'this', 'these', 'those', 'his', 'her', 'they', 'we', 'it', 'as', 'of', 'our', 'their', 'when', 'what', 'all', 'had'];
    const wordFrequency = {};
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Get top topics based on frequency
    const topics = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Select key messages as action items
    const actionItems = sentences
      .filter(s => 
        s.includes("need to") || 
        s.includes("should") || 
        s.includes("must") || 
        s.includes("will") || 
        s.includes("going to") ||
        s.toLowerCase().includes("important") ||
        s.toLowerCase().includes("remember") ||
        s.toLowerCase().includes("deadline") ||
        s.toLowerCase().includes("don't forget")
      )
      .map(s => s.trim())
      .slice(0, 3);
    
    // If no clear action items, use important sentences
    if (actionItems.length === 0) {
      const importantSentences = sentences
        .filter(s => s.length > 20)
        .sort((a, b) => b.length - a.length)
        .slice(0, 3);
      
      actionItems.push(...importantSentences);
    }
    
    // Generate executive summary
    const participantsText = Array.from(participants).join(", ");
    let executiveSummary = `This conversation includes contributions from ${participantsText}.`;
    
    if (topics.length > 0) {
      executiveSummary += ` The discussion covered topics such as ${topics.slice(0, 3).join(", ")}.`;
    }
    
    // Format the complete summary
    const formattedSummary = `# Meeting Summary

## Executive Summary
${executiveSummary}

## Main Topics Discussed
${topics.map(topic => `- ${topic.charAt(0).toUpperCase() + topic.slice(1)}`).join('\n')}

## Key Points
${actionItems.map(point => `- ${point}`).join('\n')}

_Generated using local summarization_`;
    
    console.log("✅ Summary generated successfully");
    
    return res.json({ 
      summary: formattedSummary,
      topics: topics.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
      actionItems
    });
    
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    
    // Always return something useful even if errors occur
    const fallbackSummary = `# Meeting Summary

## Executive Summary
A conversation took place with multiple exchanges of information.

## Main Topics Discussed
- The content of the discussion

## Key Points
- Please review the transcript for complete details
- The AI summarizer encountered an error
- A manual review may be needed

_Note: This is a basic fallback summary created due to an error in processing._`;
    
    return res.json({ 
      summary: fallbackSummary,
      topics: ["conversation"],
      actionItems: ["Please review the transcript manually"]
    });
  }
});

module.exports = router;
