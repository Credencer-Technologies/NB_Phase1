import { FaTimes } from "react-icons/fa";
import ChatMessage from "./ChatMessage";
import QuickReplies from "./QuickReplies";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import "./ChatBot.css";

function ChatWindow({ messages, isBotTyping, quickReplies, onSend, onQuickReply, onAction, onClose, bodyRef }) {
  return (
    <div className="nb-chat-window">
      <div className="nb-chat-header">
        <div className="bot-info">
          <div className="bot-avatar">🤖</div>
          <div>
            <h3>Nari Sakhi</h3>
            <span>{isBotTyping ? "Typing..." : "Always here to help"}</span>
          </div>
        </div>

        <button
          type="button"
          className="nb-chat-header-close-btn"
          onClick={onClose}
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>

      <div className="nb-chat-body" ref={bodyRef}>
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            text={msg.text}
            actions={msg.actions}
            providers={msg.providers}
            onAction={onAction}
          />
        ))}

        {isBotTyping && <TypingIndicator />}

        <QuickReplies options={quickReplies} onSelect={onQuickReply} />
      </div>

      <ChatInput onSend={onSend} disabled={isBotTyping} />
    </div>
  );
}

export default ChatWindow;