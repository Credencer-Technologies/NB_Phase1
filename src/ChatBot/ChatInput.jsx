import { useState } from "react";
import { FaPaperPlane, FaMicrophone, FaStop } from "react-icons/fa";
import {
  startListening,
  stopListening,
} from "./speechRecognition";
import "./ChatBot.css";

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);

  const handleSend = () => {
    const trimmed = value.trim();

    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");
  };

  const handleVoice = () => {
    if (disabled) return;

    // Stop listening
    if (listening) {
      stopListening();
      setListening(false);
      return;
    }

    setListening(true);

    startListening((voiceText) => {
      setListening(false);

      if (voiceText && voiceText.trim()) {
        onSend(voiceText);
      }
    });
  };

  return (
    <div className="nb-chat-footer">
      <input
        placeholder={
          listening ? "🎤 Listening..." : "Type your message..."
        }
        value={value}
        disabled={disabled || listening}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        className={`voice-btn ${listening ? "listening" : ""}`}
        onClick={handleVoice}
        disabled={disabled}
        aria-label="Voice input"
      >
        {listening ? <FaStop /> : <FaMicrophone />}
      </button>

      <button
        onClick={handleSend}
        disabled={disabled}
        aria-label="Send message"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}

export default ChatInput;