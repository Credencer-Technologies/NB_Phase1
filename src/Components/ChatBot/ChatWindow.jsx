import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getBotReply } from "./chatbotLogic";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import SuggestedReplies from "./SuggestedReplies";

export default function ChatWindow({
  messages,
  setMessages,
  loading,
  setLoading,
}) {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);
  const navigateToCategory = (category) => {
  navigate(`/explore?category=${encodeURIComponent(category)}`);
};
const categoryMap = {
  "Beauty & Wellness": "beauty-wellness",
  "Mehndi & Bridal": "mehndi-bridal",
  "Tailoring & Fashion": "tailoring-fashion",
  "Food & Catering": "food-catering",
  "Education & Tutoring": "education",
  "Yoga & Fitness": "yoga-fitness",
  "Home Services": "home-services",
  "Arts & Crafts": "arts-crafts",
};
const handleCategoryClick = (category) => {

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: category,
    },
    {
      sender: "bot",
      text: `Opening ${category}...`,
    },
  ]);

  setTimeout(() => {
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  }, 800);

};
const handleUserMessage = (text) => {
  if (!text.trim()) return;

  // Add user message
  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text,
    },
  ]);

  // Show typing animation
  setLoading(true);

  setTimeout(() => {
    const reply = getBotReply(text);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: reply,
      },
    ]);

    setLoading(false);

    // Navigate for category-related replies
    if (
      serviceCategories.some(
        (cat) => cat.toLowerCase() === text.toLowerCase()
      )
    ) {
      setTimeout(() => {
        navigate(`/explore?category=${encodeURIComponent(text)}`);
      }, 1000);
    }
  }, 700);
};

  return (
    <>
      <div className="nb-chat-body">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
          />
        ))}

        {messages.length === 1 && (
          <SuggestedReplies
            onSelect={(text) => {
              setMessages((prev) => [
                ...prev,
                {
                  sender: "user",
                  text,
                },
                {
        sender: "bot",
        text: getBotReply(text),
      },
              ]);
            }}
          />
        )}

        {loading && <TypingIndicator />}

        <div ref={bottomRef}></div>
      </div>

      <ChatInput
        onSend={handleUserMessage}
        setMessages={setMessages}
        setLoading={setLoading}
      />
    </>
  );
}