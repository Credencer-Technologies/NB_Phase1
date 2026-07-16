/* ===========================================================
   NARIBAZAR CHATBOT — KNOWLEDGE BASE
   ===========================================================
   This file is the chatbot's "brain" for free-text questions.
   Instead of forcing users through a fixed menu, incoming text
   is scored against each entry's keywords (see searchKnowledgeBase
   below) and the best match's response + action buttons are used.
   This mirrors the "AI Search" pattern: search first, answer
   with a summary + a link/action, fall back to human handoff.
=========================================================== */

// Real routes that exist in the app (see App.jsx). Centralised here so
// every action button points somewhere that actually works.
export const ROUTES = {
  home: "/",
  explore: (category) =>
    category ? `/explore?category=${encodeURIComponent(category)}` : "/explore",
  becomeProvider: "/register?role=provider",
  providerProfile: (id) => `/provider-profile/${id}`,
  contact: "/contact",
};

// Chips shown right under the welcome message — matches workflow §15A.
export const suggestedPrompts = [
  "Find a Service",
  "Become a Provider",
  "Payments",
  "FAQs",
];

// Category chips for the guided booking flow (workflow §15D).
export const CATEGORY_OPTIONS = [
  "💄 Beauty & Wellness",
  "💍 Mehandi & Bridal",
  "👗 Tailoring & Fashion",
  "📚 Education & Tutoring",
  "🧘 Yoga & Fitness",
  "🏠 Home Services",
];

// Emoji-prefixed chip label -> plain category name stored in providers.js
export const CATEGORY_LABELS = {
  "💄 Beauty & Wellness": "Beauty & Wellness",
  "💍 Mehndi & Bridal": "Mehndi & Bridal",
  "👗 Tailoring & Fashion": "tailoring & Fashion",
  "📚 Education & Tutoring": "Education",
  "🧘 Yoga & Fitness": "Yoga & Fitness",
  "🏠 Home Services": "Home Services",
};

export const BUDGET_OPTIONS = ["₹1000-3000", "₹3000-5000", "₹5000+"];
export const DATE_OPTIONS = ["Today", "Tomorrow", "This Week"];

/* ===============================
   KNOWLEDGE BASE ENTRIES
   Each entry: id, keywords (what a user might type), response text,
   and either `actions` (rich CTA buttons under the message) or
   `startsFlow` + `prefillCategory` (jumps straight into guided booking).
================================ */
export const knowledgeBase = [
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "charge", "fee", "how much", "rate"],
    response:
      "Pricing depends on the provider, service type, and package. 💰\n\nMost bridal makeup ranges ₹3000–₹8000, while mehndi starts around ₹800.\n\nWant me to find providers within your budget?",
    actions: [
      { label: "Find a Service", type: "startFlow" },
      { label: "Browse All Categories", type: "navigate", value: ROUTES.explore() },
    ],
  },
  {
    id: "become-provider",
    keywords: [
      "become provider", "register", "join as", "sell my service",
      "provider registration", "seller", "list my business", "become a provider",
    ],
    response:
      "That's wonderful! 🎉\n\nJoining NariBazar helps you grow your business. You'll need:\n\n• Aadhaar Card\n• Mobile Number\n• Business Details\n• Service Category\n\nReady to get started?",
    actions: [{ label: "Start Registration", type: "navigate", value: ROUTES.becomeProvider }],
  },
  {
    id: "booking-help",
    keywords: ["how to book", "booking help", "book a service", "reserve", "make a booking"],
    response:
      "Booking is simple 😊\n\n1️⃣ Search a Service\n2️⃣ Choose a Provider\n3️⃣ Select a Date\n4️⃣ Confirm Booking\n\nWant me to help you find a service right now?",
    actions: [{ label: "Find a Service", type: "startFlow" }],
  },
  {
    id: "payments",
    keywords: ["payment", "pay", "upi", "debit card", "credit card", "netbanking", "cash"],
    response:
      "Accepted payment methods depend on the provider's choice — most support UPI, debit/credit cards, and net banking, and some also accept cash. 💳\n\nYou'll see the exact options a provider accepts on their profile before you book.\n\nHaving trouble with a specific payment?",
    actions: [{ label: "Talk to Support", type: "contact" }],
  },
  {
    id: "refund-cancellation",
    keywords: ["refund", "cancel", "cancellation", "cancel booking", "money back"],
    response:
      "Cancellations made at least 24 hours before your appointment are fully refundable. Later cancellations may include a small provider fee. 🙂",
    actions: [{ label: "Talk to Support", type: "contact" }],
  },
  {
    id: "security-trust",
    keywords: ["safe", "secure", "verified", "trust", "background check", "genuine"],
    response:
      "Every provider on NariBazar is ID-verified before they can list a service, and all payments are processed securely. 🔒",
    actions: [{ label: "Browse Verified Providers", type: "navigate", value: ROUTES.explore() }],
  },
  {
    id: "faqs",
    keywords: ["faq", "faqs", "questions", "help center", "common questions"],
    response: "Here are some common questions — tap one below. 👇",
    actions: [],
    quickReplies: ["How to Book?", "Payments", "Cancellation Policy", "Become a Provider"],
  },
  {
    id: "contact-human",
    keywords: ["talk to sales", "human", "agent", "representative", "support team", "contact support", "real person"],
    response:
      "Sure thing — I'll connect you with our team. They typically respond within a few hours. 🙋‍♀️",
    actions: [{ label: "Contact Us", type: "navigate", value: ROUTES.contact }],
  },
  // --- Category triggers: jump straight into the guided booking flow ---
  {
    id: "cat-beauty",
    keywords: ["beauty", "makeup", "facial", "skincare", "salon", "hair"],
    response: "Great choice! 😊 Let's find you a Beauty & Wellness provider.",
    startsFlow: true,
    prefillCategory: "Beauty & Wellness",
  },
  {
    id: "cat-mehndi",
    keywords: ["mehndi", "mehendi", "bridal", "henna"],
    response: "Great choice! 💍 Let's find you a Mehndi & Bridal artist.",
    startsFlow: true,
    prefillCategory: "Mehandi & Bridal",
  },
  {
    id: "cat-fashion",
    keywords: ["tailoring", "stitching", "fashion", "boutique", "blouse", "tailor"],
    response: "Great choice! 👗 Let's find you a Fashion provider.",
    startsFlow: true,
    prefillCategory: "Tailoring & Fashion",
  },
  {
    id: "cat-yoga",
    keywords: ["yoga", "fitness", "workout", "trainer", "gym"],
    response: "Great choice! 🧘 Let's find you a Yoga & Fitness provider.",
    startsFlow: true,
    prefillCategory: "Yoga & Fitness",
  },
  {
    id: "cat-home",
    keywords: ["home service", "cleaning", "plumber", "electrician", "repair", "maid"],
    response: "Great choice! 🏠 Let's find you a Home Services provider.",
    startsFlow: true,
    prefillCategory: "Home Services",
  },
  {
    id: "cat-education",
    keywords: ["tutor", "tuition", "education", "classes", "coaching"],
    response: "Great choice! 📚 Let's find you an Education provider.",
    startsFlow: true,
    prefillCategory: "Education & Tutoring",
  },
];

/**
 * Lightweight "AI search": scores every knowledge base entry by how many of
 * its keywords appear in the user's message, and returns the best match.
 * Also resolves simple pronouns ("it"/"this"/"that") to the last topic
 * discussed, so conversations don't feel like they've forgotten context
 * (workflow §8, Conversation Memory).
 */
export function searchKnowledgeBase(rawQuery, lastTopicId) {
  let query = rawQuery.toLowerCase().trim();
  if (!query) return null;

  if (lastTopicId && /\b(it|this|that|them)\b/.test(query)) {
    const lastEntry = knowledgeBase.find((entry) => entry.id === lastTopicId);
    if (lastEntry) query += ` ${lastEntry.keywords[0]}`;
  }

  let bestMatch = null;
  let bestScore = 0;

  knowledgeBase.forEach((entry) => {
    let score = 0;
    entry.keywords.forEach((keyword) => {
      if (query.includes(keyword)) score += keyword.split(" ").length;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  return bestScore > 0 ? bestMatch : null;
}

// Kept for backward compatibility with any older code referencing the
// original simple menu-based replies.
export const botReplies = {
  welcome: {
    text: "👋 Welcome to NariBazar! How can I help you today?",
    options: suggestedPrompts,
  },
};