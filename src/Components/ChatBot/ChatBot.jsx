import { useState, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaMicrophone,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { startListening } from "./speechRecognition";
import { speak } from "./textToSpeech";

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

  const greeted = useRef(false);

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    welcomeMessage,
  ]);

  const [input, setInput] = useState("");

  const [options, setOptions] =
    useState(welcomeOptions);

  const [isListening, setIsListening] =
    useState(false);

  const [step, setStep] =
    useState("welcome");

  const [userData, setUserData] = useState({
    category: "",
    city: "",
    budget: "",
    date: "",
  });

  // -----------------------------
  // BOT REPLY
  // -----------------------------

  const botReply = (
    text,
    newOptions = []
  ) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text,
        },
      ]);

      // Speak the response
      speak(text);

      setOptions(newOptions);
    }, 600);
  };

  // -----------------------------
  // VOICE INPUT
  // -----------------------------

  const handleVoiceInput = () => {
    setIsListening(true);

    startListening(
      (voiceText) => {
        sendMessage(voiceText);
      },

      () => {
        setIsListening(false);
      }
    );
  };

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;

    const originalText = text;

    let message = text
      .toLowerCase()
      .trim();

    message = message.replace(
      /[.,!?]/g,
      ""
    );

    message = message.replace(
      /\s+/g,
      " "
    );

    // -----------------------------
    // NATURAL LANGUAGE MAPPING
    // -----------------------------

    if (step === "welcome") {

      if (
        message.includes("service") ||
        message.includes("beauty") ||
        message.includes("wellness") ||
        message.includes("fashion") ||
        message.includes("mehndi") ||
        message.includes("photography") ||
        message.includes("education") ||
        message.includes("fitness")
      ) {
        text = "Find a Service";
      }

      else if (
        message.includes("provider") ||
        message.includes("register") ||
        message.includes("seller")
      ) {
        text = "Become a Provider";
      }

      else if (
        message.includes("book") ||
        message.includes("booking")
      ) {
        text = "Booking Help";
      }

      else if (
        message.includes("payment") ||
        message.includes("upi") ||
        message.includes("card")
      ) {
        text = "Payments";
      }

      else if (
        message.includes("faq") ||
        message.includes("question") ||
        message.includes("help")
      ) {
        text = "FAQs";
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: originalText,
      },
    ]);

    setInput("");

    // -----------------------------
    // START OVER
    // -----------------------------

    if (text === "Start Over") {

      setStep("welcome");

      setUserData({
        category: "",
        city: "",
        budget: "",
        date: "",
      });

      botReply(
        "How can I help you today?",
        welcomeOptions
      );

      return;
    }

    // -----------------------------
    // WELCOME MENU
    // -----------------------------

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

        navigate(
          "/register?role=provider"
        );

        setIsOpen(false);

        return;
      }

      if (text === "Booking Help") {

        botReply(
          "Booking is simple 😊\n\n1️⃣ Search a Service\n2️⃣ Choose a Provider\n3️⃣ Select Date\n4️⃣ Confirm Booking",
          [
            "Okay",
            "Need More Help",
          ]
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

        // -----------------------------
    // FAQ CATEGORY
    // -----------------------------
    if (step === "faqCategory") {
      setStep("faqQuestion");

      botReply(
        "Please select your question:",
        faqCategories[text] || []
      );

      return;
    }

    // -----------------------------
    // FAQ QUESTION
    // -----------------------------
    if (step === "faqQuestion") {
      botReply(
        faqData[text] ||
          "Sorry, I couldn't find an answer for that.",
        ["Back to FAQs", "Start Over"]
      );

      return;
    }

    // -----------------------------
    // BACK TO FAQ
    // -----------------------------
    if (text === "Back to FAQs") {
      setStep("faqCategory");

      botReply(
        botReplies["FAQs"].text,
        botReplies["FAQs"].options
      );

      return;
    }

    // -----------------------------
    // CATEGORY (Voice Friendly)
    // -----------------------------
    if (step === "category") {

      let category = text;

      const voice = text.toLowerCase();

      if (
        voice.includes("beauty") ||
        voice.includes("salon") ||
        voice.includes("spa")
      ) {
        category = "Beauty & Wellness";
      }

      else if (
        voice.includes("mehndi") ||
        voice.includes("bridal")
      ) {
        category = "Mehndi & Bridal";
      }

      else if (
        voice.includes("fashion") ||
        voice.includes("dress")
      ) {
        category = "Fashion";
      }

      else if (
        voice.includes("education") ||
        voice.includes("teacher") ||
        voice.includes("tuition")
      ) {
        category = "Education";
      }

      else if (
        voice.includes("yoga") ||
        voice.includes("fitness") ||
        voice.includes("gym")
      ) {
        category = "Yoga & Fitness";
      }

      else if (
        voice.includes("photography") ||
        voice.includes("camera")
      ) {
        category = "Photography";
      }

      else if (
        voice.includes("cleaning") ||
        voice.includes("plumber") ||
        voice.includes("electrician")
      ) {
        category = "Home Services";
      }

      setUserData((prev) => ({
        ...prev,
        category,
      }));

      navigate(
        `/explore?category=${encodeURIComponent(category)}`
      );

      setIsOpen(false);

      setStep("welcome");

      return;
    }

    // -----------------------------
    // CITY
    // -----------------------------
    if (step === "city") {

      setUserData((prev) => ({
        ...prev,
        city: text,
      }));

      setStep("budget");

      botReply(
        "What's your approximate budget?",
        [
          "₹1000-3000",
          "₹3000-5000",
          "₹5000+",
        ]
      );

      return;
    }

    // -----------------------------
    // BUDGET
    // -----------------------------
    if (step === "budget") {

      setUserData((prev) => ({
        ...prev,
        budget: text,
      }));

      setStep("date");

      botReply(
        "When do you need the service?",
        [
          "Today",
          "Tomorrow",
          "This Week",
        ]
      );

      return;
    }

    // -----------------------------
    // DATE
    // -----------------------------
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

    // -----------------------------
    // DEFAULT RESPONSE
    // -----------------------------
    botReply(
      "Sorry, I didn't understand that.\n\nPlease choose one of the available options.",
      options
    );

  };
    return (
    <>
      {/* Floating Chat Button */}
      <button
        className="nb-chat-button"
        onClick={() => {
          const open = !isOpen;
          setIsOpen(open);

          // Speak welcome message only once
          if (open && !greeted.current) {
            speak(welcomeMessage.text);
            greeted.current = true;
          }
        }}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {isOpen && (
        <div className="nb-chat-window">

          {/* ================= HEADER ================= */}
          <div className="nb-chat-header">
            <div className="bot-info">

              <div className="bot-avatar">
                🤖
              </div>

              <div>
                <h3>Nari Assistant</h3>
                <span>Always here to help</span>
              </div>

            </div>
          </div>

          {/* ================= CHAT BODY ================= */}
          <div className="nb-chat-body">

            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                text={msg.text}
              />
            ))}

            {/* Listening Indicator */}
            {isListening && (
              <div className="listening">
                🎤 Listening...
              </div>
            )}

            {/* Quick Reply Buttons */}
            <QuickReplies
              options={options}
              onSelect={sendMessage}
            />

          </div>

          {/* ================= FOOTER ================= */}
          <div className="nb-chat-footer">

            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(input);
                }
              }}
            />

            {/* Voice Button */}
            <button
              className="mic-btn"
              onClick={handleVoiceInput}
              title="Speak"
            >
              <FaMicrophone />
            </button>

            {/* Send Button */}
            <button
              className="send-btn"
              onClick={() =>
                sendMessage(input)
              }
              title="Send"
            >
              <FaPaperPlane />
            </button>

          </div>

        </div>
      )}
    </>
  );
}