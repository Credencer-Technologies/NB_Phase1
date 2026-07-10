import { useState } from "react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import ChatMessage from "./ChatMessage";
import QuickReplies from "./QuickReplies";
import "./ChatBot.css";

import {
  botReplies,
  faqCategories,
  faqData,
} from "./chatbotData";

const welcomeMessage = {
  sender: "bot",
  text:
    "👋 Hi! Welcome to NariBazar.\n\nI'm your virtual assistant.\n\nHow can I help you today?",
};

const welcomeOptions = [
  "Find a Service",
  "Become a Provider",
  "Booking Help",
  "Payments",
  "FAQs",
];

export default function ChatBot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([welcomeMessage]);

  const [input, setInput] = useState("");

  const [options, setOptions] = useState(welcomeOptions);

  const [step, setStep] = useState("welcome");

  const [userData, setUserData] = useState({
    category: "",
    city: "",
    budget: "",
    date: "",
  });

  const botReply = (text, newOptions = []) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text,
        },
      ]);

      setOptions(newOptions);
    }, 600);
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setInput("");

    /* ==========================
       START OVER
    ========================== */

    if (text === "Start Over") {
      setStep("welcome");

      setUserData({
        category: "",
        city: "",
        budget: "",
        date: "",
      });

      botReply("How can I help you today?", welcomeOptions);
      return;
    }

    /* ==========================
       WELCOME
    ========================== */

    if (step === "welcome") {
      if (text === "Find a Service") {
        setStep("category");

        botReply(
          "Great! 😊\n\nWhat type of service are you looking for?",
          [
            "Beauty & Wellness",
            "Mehndi & Bridal",
            "Fashion",
            "Education",
            "Yoga & Fitness",
            "Photography",
            "Home Services",
          ]
        );

        return;
      }

      if (text === "Become a Provider") {
        navigate("/register?role=provider");
        setIsOpen(false);
        return;
      }

      if (text === "Booking Help") {
        botReply(
          "Booking is simple 😊\n\n1️⃣ Search a Service\n2️⃣ Choose a Provider\n3️⃣ Select Date\n4️⃣ Confirm Booking",
          ["Okay", "Need More Help"]
        );

        return;
      }

      if (text === "Payments") {
        botReply(
          "We support:\n\n💳 UPI\n💳 Debit Card\n💳 Credit Card\n🏦 Net Banking\n💵 Cash (if provider allows)"
        );

        return;
      }

      if (text === "FAQs") {
        setStep("faqCategory");

        botReply(
          botReplies["FAQs"].text,
          botReplies["FAQs"].options
        );

        return;
      }
    }

    /* ==========================
       FAQ CATEGORY
    ========================== */

    if (step === "faqCategory") {
      setStep("faqQuestion");

      botReply(
        "Please select your question:",
        faqCategories[text] || []
      );

      return;
    }

    /* ==========================
       FAQ QUESTION
    ========================== */

    if (step === "faqQuestion") {
      botReply(
        faqData[text] || "Sorry, I couldn't find an answer for that.",
        ["Back to FAQs", "Start Over"]
      );

      return;
    }

    /* ==========================
       BACK TO FAQ
    ========================== */

    if (text === "Back to FAQs") {
      setStep("faqCategory");

      botReply(
        botReplies["FAQs"].text,
        botReplies["FAQs"].options
      );

      return;
    }

    /* ==========================
       CATEGORY
    ========================== */

    if (step === "category") {
      setUserData((prev) => ({
        ...prev,
        category: text,
      }));

      navigate(
        `/explore?category=${encodeURIComponent(text)}`
      );

      setIsOpen(false);
      setStep("welcome");

      return;
    }

    /* ==========================
       CITY
    ========================== */

    if (step === "city") {
      setUserData((prev) => ({
        ...prev,
        city: text,
      }));

      setStep("budget");

      botReply("What's your approximate budget?", [
        "₹1000-3000",
        "₹3000-5000",
        "₹5000+",
      ]);

      return;
    }

    /* ==========================
       BUDGET
    ========================== */

    if (step === "budget") {
      setUserData((prev) => ({
        ...prev,
        budget: text,
      }));

      setStep("date");

      botReply("When do you need the service?", [
        "Today",
        "Tomorrow",
        "This Week",
      ]);

      return;
    }

    /* ==========================
       DATE
    ========================== */

    if (step === "date") {
      setUserData((prev) => ({
        ...prev,
        date: text,
      }));

      setStep("completed");

      botReply(
        "Perfect! 🎉\n\nThank you for sharing your requirements.\n\nI'm finding the best service providers for you.",
        ["Start Over"]
      );

      return;
    }

    /* ==========================
       DEFAULT
    ========================== */

    botReply(
      "Sorry, I didn't understand that.\nPlease choose one of the available options.",
      options
    );
  };

  return (
    <>
      <button
        className="nb-chat-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {isOpen && (
        <div className="nb-chat-window">
          <div className="nb-chat-header">
            <div className="bot-info">
              <div className="bot-avatar">🤖</div>

              <div>
                <h3>Nari Assistant</h3>
                <span>Always here to help</span>
              </div>
            </div>
          </div>

          <div className="nb-chat-body">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                text={msg.text}
              />
            ))}

            <QuickReplies
              options={options}
              onSelect={sendMessage}
            />
          </div>

          <div className="nb-chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
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