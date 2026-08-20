import chatbotLogo from "../../assets/Images/chatbot-logo.jpeg";
import { FaTimes } from "react-icons/fa";

export default function ChatHeader({ onClose }) {
  return (
    <div className="nb-chat-header">
      <div className="chat-header-left">
        <img
          src={chatbotLogo}
          alt="Nari Sakhi"
          className="chatbot-logo"
        />

        <div>
          <h3>Nari Sakhi</h3>
          <span>Online</span>
        </div>
      </div>

      <button className="close-btn" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
}