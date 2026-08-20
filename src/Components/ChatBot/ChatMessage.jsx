import { useState } from "react";
import { speakText, stopSpeaking } from "./speech";

export default function ChatMessage({ message }) {

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeaker = () => {

    if (isSpeaking) {

      stopSpeaking();
      setIsSpeaking(false);

    } else {

      speakText(message.text);
      setIsSpeaking(true);

      // Reset icon when speech ends
      const interval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(interval);
        }
      }, 200);

    }

  };

  return (

    <div
      className={`message-wrapper ${
        message.sender === "user" ? "user" : "bot"
      }`}
    >

      <div
        className={`message-bubble ${
          message.sender === "user"
            ? "user-message"
            : "bot-message"
        }`}
      >

        <p>{message.text}</p>

        <span className="message-time">

          {new Date().toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit",

          })}

        </span>
      </div>

    </div>

  );

}