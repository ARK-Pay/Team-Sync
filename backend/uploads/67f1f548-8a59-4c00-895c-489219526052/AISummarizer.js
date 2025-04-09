import React, { useState } from "react";

const AISummarizer = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    // Check if there is text
    if (!text.trim()) {
      alert("❌ Please enter some text to summarize.");
      return;
    }

    setLoading(true);

    try {
      // Send text to the backend for summarization
      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),  // Send the text from the input field
      });

      // Debugging: Log the response
      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        // Update the state with the generated summary
        setSummary(data.summary || "Failed to generate summary.");
      } else {
        setSummary("Error generating summary. Try again.");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Error generating summary. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="ai-summarizer">
      <h2>AI Summarizer</h2>
      <textarea
        placeholder="Enter text to summarize..."
        value={text}
        onChange={(e) => setText(e.target.value)} // Update text state on user input
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? "Summarizing..." : "Generate Summary"}
      </button>
      {summary && (
        <div className="summary-box">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default AISummarizer;
