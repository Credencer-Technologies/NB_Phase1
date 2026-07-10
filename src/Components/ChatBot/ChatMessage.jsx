import "./ChatBot.css";

function ChatMessage({ sender, text }) {
  const isBot = sender === "bot";

  return (
    <div className={`message-wrapper ${isBot ? "bot" : "user"}`}>
      <div className={`message-bubble ${isBot ? "bot-message" : "user-message"}`}>
        <div className="message-content">
          {text.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

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

export default ChatMessage;