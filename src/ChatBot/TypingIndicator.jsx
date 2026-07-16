import "./ChatBot.css";

function TypingIndicator() {
  return (
    <div className="message-wrapper bot">
      <div className="message-bubble bot-message typing-indicator-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

export default TypingIndicator;