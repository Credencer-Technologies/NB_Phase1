import { useState } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import "./ChatBot.css";
import { botReplies } from "./chatbotData";

export default function ChatBot() {

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: botReplies.welcome.text
    }
  ]);

  const [options, setOptions] = useState(botReplies.welcome.options);

  const [input, setInput] = useState("");

  const sendMessage = (message) => {

    const updated = [
      ...messages,
      {
        sender: "user",
        text: message
      }
    ];

    if (botReplies[message]) {

      updated.push({
        sender: "bot",
        text: botReplies[message].text
      });

      setOptions(botReplies[message].options || []);

    } else {

      updated.push({
        sender: "bot",
        text: "Sorry! I didn't understand that."
      });

      setOptions([]);
    }

    setMessages(updated);
    setInput("");
  };

  return (
    <>
      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes /> : <FaRobot />}
      </button>

      {open && (
        <div className="chat-window">

          <div className="chat-header">
            🤖 Nari Assistant
          </div>

          <div className="chat-body">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}

            <div className="quick-options">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => sendMessage(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

          </div>

          <div className="chat-input">

            <input
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage(input)
              }
            />

            <button onClick={() => sendMessage(input)}>
              <FaPaperPlane />
            </button>

          </div>

        </div>
      )}
    </>
  );
}