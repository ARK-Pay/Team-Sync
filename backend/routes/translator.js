const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const router = express.Router();

// Use local translation instead of external API
router.post("/translate", async (req, res) => {
  console.log("📣 Translate endpoint hit!");
  console.log("📦 Request body:", req.body);
  
  const { text, targetLanguage } = req.body;

  if (!text) {
    console.error("❌ No text provided for translation");
    return res.status(400).json({ error: "Text is required for translation" });
  }

  if (!targetLanguage) {
    console.error("❌ No target language provided");
    return res.status(400).json({ error: "Target language is required" });
  }
  
  console.log(`📝 Translating ${text.length} characters to ${targetLanguage}`);
  
  try {
    // Simple local translation - just add a note that it's a simulated translation
    // In a real app, you'd integrate with a translation service or library
    
    const localTranslations = {
      es: {
        prefix: "Traducción simulada al español:\n\n",
        note: "\n\n[Esta es una traducción simulada para fines de demostración]"
      },
      fr: {
        prefix: "Traduction simulée en français:\n\n",
        note: "\n\n[Ceci est une traduction simulée à des fins de démonstration]"
      },
      de: {
        prefix: "Simulierte Übersetzung auf Deutsch:\n\n",
        note: "\n\n[Dies ist eine simulierte Übersetzung zu Demonstrationszwecken]"
      },
      zh: {
        prefix: "模拟中文翻译:\n\n",
        note: "\n\n[这是出于演示目的的模拟翻译]"
      },
      ja: {
        prefix: "日本語でのシミュレーション翻訳:\n\n",
        note: "\n\n[これはデモ目的のためのシミュレーション翻訳です]"
      },
      hi: {
        prefix: "हिंदी में अनुकरण अनुवाद:\n\n",
        note: "\n\n[यह प्रदर्शन उद्देश्यों के लिए एक अनुकरण अनुवाद है]"
      }
    };
    
    const translation = localTranslations[targetLanguage] || { 
      prefix: `Simulated translation to ${targetLanguage}:\n\n`,
      note: "\n\n[This is a simulated translation for demonstration purposes]"
    };
    
    const translatedText = translation.prefix + text + translation.note;
    
    console.log("✅ Local translation successful");
    
    return res.json({ translatedText });
  } catch (error) {
    console.error("❌ Error translating text:", error);
    return res.status(500).json({ error: "Failed to translate text", details: error.message });
  }
});

module.exports = router; 