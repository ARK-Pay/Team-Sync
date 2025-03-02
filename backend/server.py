from flask import Flask
from flask_socketio import SocketIO
import whisper
from transformers import pipeline
import base64
import tempfile

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load AI models
whisper_model = whisper.load_model("medium")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@socketio.on("audio_data")
def handle_audio(audio_base64):
    """Handles audio data from frontend, transcribes, and summarizes."""
    audio_bytes = base64.b64decode(audio_base64)

    # Save audio as temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(audio_bytes)
        temp_audio_path = temp_audio.name

    # Transcribe audio
    result = whisper_model.transcribe(temp_audio_path)
    text = result["text"]

    # Summarize transcription
    summary = summarizer(text, max_length=150, min_length=50, do_sample=False)[0]["summary_text"]

    # Send back summary
    socketio.emit("summary", summary)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
