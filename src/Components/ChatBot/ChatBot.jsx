import { useEffect, useState } from "react";
import nariSakhiIcon from "../../assets/Images/nari-sakhi-icon.png";
import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import { WELCOME_MESSAGE } from "./constants";

import "./ChatBot.css";

export default function ChatBot() {
  const initialMessages = [WELCOME_MESSAGE];

  const [isOpen, setIsOpen] = useState(false);

  // Controls whether "Ask NariSakhi AI" text is visible
  const [showLauncherText, setShowLauncherText] = useState(true);

  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);

  /*
   * After 4 seconds:
   * hide the text and keep only the chatbot icon.
   */
  useEffect(() => {
    if (isOpen) return;

    const timer = setTimeout(() => {
      setShowLauncherText(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  /*
   * Open chatbot
   */
  const openChatbot = () => {
    setIsOpen(true);
    setShowLauncherText(false);
  };

  /*
   * Close chatbot
   */
  const closeChatbot = () => {
    setIsOpen(false);

    // Show text again for a few seconds
    setShowLauncherText(true);
  };

  /*
   * Refresh chatbot
   */
  const handleRefresh = () => {
    setMessages(initialMessages);
    setLoading(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      {/* =========================================
    FLOATING NARISAKHI ICON
========================================= */}

<button
  type="button"
  className={`ask-narisakhi-launcher ${
    !isOpen && showLauncherText
      ? "launcher-expanded"
      : "launcher-icon-only"
  }`}
  onClick={() => {
    if (!isOpen) {
      setIsOpen(true);
      setShowLauncherText(false);
    }
  }}
  aria-label="Ask NariSakhi AI"
>
  <span className="ask-narisakhi-logo">
    <img
      src={nariSakhiIcon}
      alt="NariSakhi"
    />
  </span>

  {/* Text ONLY when chatbot is closed */}
  {!isOpen && showLauncherText && (
    <span className="ask-narisakhi-label label-visible">
      Ask NariSakhi AI
    </span>
  )}
</button>
      {/* =========================================
          CHATBOT WINDOW
          OPENS AT TOP-RIGHT
      ========================================= */}

      {isOpen && (
        <div className="nb-chat-window chatbot-open-top">
          <ChatHeader
            onClose={closeChatbot}
            onRefresh={handleRefresh}
          />

          <ChatWindow
            messages={messages}
            setMessages={setMessages}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  );
}