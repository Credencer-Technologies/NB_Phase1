import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBotReply } from "./chatbotLogic";
import { speakText, stopSpeaking } from "./speech";
import { PLACEHOLDER } from "./constants";
import { FaPaperPlane, FaMicrophone, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

export default function ChatInput({
  onSend,
  setMessages,
  setLoading,
}) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [speakerOn, setSpeakerOn] = useState(true);
const [isListening, setIsListening] = useState(false);
 const startListening = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition is not supported.");
    return;
  }

  const recognition = new window.webkitSpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
setIsListening(true);
  recognition.start();

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;

    setInput(text);

    setTimeout(() => {

      setInput("");

      // SAME LOGIC USED FOR VOICE
      executeChatLogic(text);

    }, 200);
  };

  recognition.onerror = (err) => {
    console.log(err);
  };
  recognition.onend = () => {
  setIsListening(false);
};
};
const handleSend = () => {
  executeChatLogic();
};
const containsAny = (text, keywords) =>
  keywords.some((word) => text.includes(word));
const executeChatLogic = (voiceMessage = null) => {
const userMessage = voiceMessage || input.trim();

if (!userMessage.trim()) return;

const msg = userMessage.toLowerCase();

  setInput("");
  setLoading(true);

  // User message
  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: userMessage,
    },
  ]);

  // Redirect helper
  const redirectWithMessage = (reply, path) => {
    setTimeout(() => {
      setLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: reply,
        },
      ]);

      if (speakerOn) {
        speakText(reply);
      }

      navigate(path);
    }, 1000);
  };
// Home Page
if (
  containsAny(msg, [
    "home",
    "homepage",
    "home page",
    "go home",
    "main page",
    "back to home",
    "landing page"
  ])
) {
  return redirectWithMessage(
    "🏠 Opening Home Page...",
    "/"
  );
}
  // Categories
  if (
  containsAny(msg, [
    "beauty",
    "makeup",
    "bridal",
    "bridal makeup",
    "party makeup",
    "salon",
    "hair",
    "facial",
    "beautician",
    "beauty parlour",
    "spa",
    "skin care",
    "wedding makeup"
  ])
) {
  return redirectWithMessage(
    `💄 Great! I'll help you find
     Beauty & Wellness professionals.

Steps:
1. Open Explore page...
2. Beauty category will be selected.
3. Browse providers.
4. Open a profile.
5. Click Book Now.`,
    "/explore?category=beauty-wellness"
  );
}
if (
  containsAny(msg, [
    "mehndi",
    "henna",
    "bridal mehndi",
    "arabic mehndi",
    "engagement mehndi",
    "mehendi"
  ])
){
  return redirectWithMessage(
    "🌿 Opening Mehndi & Henna services...",
    "/explore?category=mehndi-bridal"
  );
}
  if (
  containsAny(msg, [
    "tailor",
    "tailoring",
    "stitch",
    "blouse",
    "dress",
    "designer",
    "fashion",
    "boutique",
    "alteration"
  ])
){
  return redirectWithMessage(
    "👗 Opening Tailoring & Fashion...",
    "/explore?category=tailoring-fashion"
  );
}
 if (
  containsAny(msg, [
    "food",
    "chef",
    "cook",
    "home food",
    "cake",
    "birthday cake",
    "catering",
    "tiffin",
    "snacks"
  ])
) {
  return redirectWithMessage(
    "👩‍🍳 Opening Food & Catering...",
    "/explore?category=food-catering"
  );
}
if (
  containsAny(msg, [
    "teacher",
    "tuition",
    "tutor",
    "education",
    "course",
    "spoken english",
    "computer",
    "class",
    "trainer"
  ])
){
  return redirectWithMessage(
    "📚 Opening Education & Tutoring...",
    "/explore?category=education"
  );
}
if (
  containsAny(msg, [
    "fitness",
    "gym",
    "trainer",
    "zumba",
    "exercise",
    "workout",
    "yoga"
  ])
){
  return redirectWithMessage(
    "💪 Opening Yoga & Fitness...",
    "/explore?category=yoga-fitness"
  );
}
// Provider Dashboard
if (
  containsAny(msg, [
    "provider dashboard",
    "service provider dashboard",
    "my provider dashboard",
    "seller dashboard",
    "vendor dashboard",
    "provider panel",
    "provider profile"
  ])
) {
  setTimeout(() => {
    setLoading(false);

    const reply = `🌸 The Provider Dashboard is exclusively for registered Service Providers.

If you are already a Service Provider:
• Login to your provider account.
• Then open your Provider Dashboard.

If you are not registered yet:
• Register as a Service Provider first.
• Complete your profile.
• Login to access your dashboard.`;

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: reply,
      },
    ]);

    if (speakerOn) {
      speakText(
        "The Provider Dashboard is available only for registered service providers. Please register or login with your provider account."
      );
    }
  }, 700);

  return;
}
// User Dashboard
if (
  containsAny(msg, [
    "user dashboard",
    "my dashboard",
    "my profile",
    "my account",
    "user profile",
    "customer dashboard"
  ])
) {
  return redirectWithMessage(
    `👤 Opening your User Dashboard...

From here you can:
• View your profile
• Manage your services
• Check your wishlist
• Update your details`,
    "/user-dashboard"
  );
}
// Login
if (
  containsAny(msg, [
    "login",
    "log in",
    "sign in",
    "signin",
    "user login"
  ])
) {
  return redirectWithMessage(
    `🔐 Opening Login Page...

Please enter your mobile number and verify with OTP.`,
    "/login"
  );
}

// Register Menu
if (
  containsAny(msg, [
    "register",
    "registration",
    "signup",
    "sign up"
  ]) &&
  !containsAny(msg, ["user", "provider", "service provider"])
) {
  setTimeout(() => {
    setLoading(false);

    const reply = `📝 What would you like to register as?

1️⃣ User Registration
2️⃣ Provider Registration

Type:
• User or • Service Provider`;

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: reply,
      },
    ]);

    if (speakerOn) {
      speakText(
        "Would you like to register as a user or a service provider?"
      );
    }
  }, 700);

  return;
}

// User Registration
if (
  containsAny(msg, [
    "user register",
    "user registration",
    "user",
    "register as user",
    "customer registration",
    "customer signup"
  ])
) {
  return redirectWithMessage(
    "👤 Opening User Registration...",
    "/register?role=user"
  );
}
// Provider Registration
if (
  containsAny(msg, [
    "provider register",
    "provider registration",
    "register provider",
    "register as provider",
    "provider",
    "become provider",
    "join as provider",
    "sell services",
    "start business",
    "become a seller",
    "service provider"
  ])
) {
  return redirectWithMessage(
    "🌸 Opening Provider Registration...",
    "/register?role=provider"
  );
}

  // Normal chatbot reply
  const reply = getBotReply(userMessage);

  setTimeout(() => {
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: reply,
      },
    ]);

    if (speakerOn) {
      speakText(reply);
    }
  }, 800);
};
  
  const toggleSpeaker = () => {
    if (speakerOn) stopSpeaking();
    setSpeakerOn(!speakerOn);
  };

  return (
    <div className="nb-chat-footer">
<input
  type="text"
  value={input}
  placeholder={isListening ? "🎤 Listening..." : PLACEHOLDER}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  }}
/>
    <button
  className="footer-icon"
  onClick={startListening}
>
  <FaMicrophone />
</button>  
      <button
  className={`footer-speaker ${speakerOn ? "" : "off"}`}
  onClick={toggleSpeaker}
>
  {speakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
</button>
<button
  className="footer-send"
  onClick={handleSend}
>
  <FaPaperPlane />
</button>
    </div>
  );
}