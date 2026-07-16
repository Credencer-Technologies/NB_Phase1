import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaTimes } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa";
import ChatWindow from "./ChatWindow";
import conversationFlow from "./conversationFlow";
import { speak } from "./textToSpeech";
import { startListening } from "./speechRecognition";
import { findMatchingProviders } from "./providers";
import {
  ROUTES,
  suggestedPrompts,
  CATEGORY_LABELS,
  searchKnowledgeBase,
} from "./chatbotData";
import "./ChatBot.css";

const welcomeMessage = {
  sender: "bot",
  text: "👋 Hi! Welcome to NariBazar.\n\nI'm your virtual assistant.\n\nHow can I help you today?",
};

const FLOW_ORDER = ["category", "city", "budget", "date"];
const TYPING_DELAY_MS = 650;

export default function ChatBot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(suggestedPrompts);
  const [activeFlowStep, setActiveFlowStep] = useState(null); // null | "category" | "city" | "budget" | "date"

  // Conversation memory — lives in a ref so control-flow code (deciding the
  // *next* step) can read the latest value synchronously, without waiting
  // for a re-render. See workflow §8, Conversation Memory.
  const contextRef = useRef({ category: "", city: "", budget: "", date: "", lastTopic: null });
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isBotTyping, quickReplies]);

  const updateContext = (patch) => {
    contextRef.current = { ...contextRef.current, ...patch };
  };

  /* ==========================================================
     MESSAGE HELPERS
  ========================================================== */
  const pushUserMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
  };

  // Shows the typing indicator, then appends the bot's message after a short
  // delay — mirrors Intercom's "typing while composing" pattern (§14).
  const pushBotMessage = (text, extra = {}) => {
  setIsBotTyping(true);

  setTimeout(() => {
    setMessages((prev) => [...prev, { sender: "bot", text, ...extra }]);

    setIsBotTyping(false);

    setQuickReplies(extra.options || extra.quickReplies || []);

    // Speak the bot message
    speak(text, () => {
      // Start listening after the bot finishes speaking
      startListening((voiceText) => {
        handleSend(voiceText);
      });
    });

  }, TYPING_DELAY_MS);
};
  /* ==========================================================
     GUIDED CONVERSATIONAL BOOKING FLOW (workflow §15D)
  ========================================================== */
  const startBookingFlow = (prefill = {}, introText = "") => {
    updateContext(prefill);
    const nextField = FLOW_ORDER.find((field) => !contextRef.current[field]);

    if (!nextField) {
      finishBookingFlow();
      return;
    }

    setActiveFlowStep(nextField);
    const stepDef = conversationFlow[nextField];
    const combinedText = introText ? `${introText}\n\n${stepDef.message}` : stepDef.message;
    pushBotMessage(combinedText, { options: stepDef.options || [] });
  };

  const continueBookingFlow = (answer) => {
    const field = activeFlowStep;
    if (!field) return;

    const cleanedAnswer = field === "category" ? CATEGORY_LABELS[answer] || answer : answer;
    updateContext({ [field]: cleanedAnswer });

    const nextField = FLOW_ORDER.find((f) => !contextRef.current[f]);

    if (!nextField) {
      setActiveFlowStep(null);
      finishBookingFlow();
      return;
    }

    setActiveFlowStep(nextField);
    const stepDef = conversationFlow[nextField];
    pushBotMessage(stepDef.message, { options: stepDef.options || [] });
  };

  const finishBookingFlow = () => {
    const finalContext = contextRef.current;
    const matches = findMatchingProviders(finalContext);
    setActiveFlowStep(null);

    if (matches.length === 0) {
      pushBotMessage(
        `Hmm, I couldn't find an exact match for ${finalContext.category} in ${finalContext.city} within ${finalContext.budget}. 😔\n\nWant to browse all ${finalContext.category} providers instead?`,
        {
          actions: [
            { label: "Browse All", type: "navigate", value: ROUTES.explore(finalContext.category) },
            { label: "Start Over", type: "quickReply", value: "Start Over" },
          ],
        }
      );
      return;
    }

    pushBotMessage(`Perfect! 🎉 Here are top ${finalContext.category} providers in ${finalContext.city} for you:`, {
      providers: matches,
      actions: [
        { label: "View All Results", type: "navigate", value: ROUTES.explore(finalContext.category) },
        { label: "Change Filters", type: "quickReply", value: "Start Over" },
      ],
    });
  };

  /* ==========================================================
     FREE-TEXT "AI SEARCH" (workflow §4, §7)
  ========================================================== */
  const processFreeText = (text) => {
    const match = searchKnowledgeBase(text, contextRef.current.lastTopic);

    if (match) {
      updateContext({ lastTopic: match.id });

      if (match.startsFlow) {
        startBookingFlow(match.prefillCategory ? { category: match.prefillCategory } : {}, match.response);
        return;
      }

      pushBotMessage(match.response, { actions: match.actions || [], quickReplies: match.quickReplies || [] });
      return;
    }

    // Human handoff — nothing in the knowledge base matched confidently (§9).
    pushBotMessage(
      "Hmm, I couldn't find an exact answer for that. 🤔\n\nI can connect you with our support team, or try one of these:",
      {
        actions: [
          { label: "Talk to Support", type: "contact" },
          { label: "Browse FAQs", type: "quickReply", value: "FAQs" },
        ],
      }
    );
  };

  /* ==========================================================
     TOP-LEVEL SEND / ACTION HANDLERS
  ========================================================== */
  const resetConversation = () => {
    contextRef.current = { category: "", city: "", budget: "", date: "", lastTopic: null };
    setActiveFlowStep(null);
    pushBotMessage("How can I help you today? 😊", { options: suggestedPrompts });
  };

  const handleSend = (rawText) => {
    if (!rawText || !rawText.trim()) return;
    const text = rawText.trim();

    pushUserMessage(text);
    setQuickReplies([]);

    if (text === "Start Over") {
      resetConversation();
      return;
    }

    if (text === "Find a Service") {
      startBookingFlow({});
      return;
    }

    if (activeFlowStep) {
      continueBookingFlow(text);
      return;
    }

    processFreeText(text);
  };

  const handleAction = (action) => {
    if (!action) return;

    switch (action.type) {
      case "navigate":
        setIsOpen(false);
        navigate(action.value);
        return;
      case "contact":
        setIsOpen(false);
        navigate(ROUTES.contact);
        return;
      case "quickReply":
        handleSend(action.value);
        return;
      case "startFlow":
        startBookingFlow(action.prefill || {});
        return;
      default:
        return;
    }
  };

  return (
    <>
      <button className="nb-chat-button" onClick={() => setIsOpen(!isOpen)} aria-label="Open chat">
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {isOpen && (
        <ChatWindow
          messages={messages}
          isBotTyping={isBotTyping}
          quickReplies={quickReplies}
          onSend={handleSend}
          onQuickReply={handleSend}
          onAction={handleAction}
          onClose={() => setIsOpen(false)}
          bodyRef={bodyRef}
        />
      )}
    </>
  );
}