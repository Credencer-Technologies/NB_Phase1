import { CATEGORY_OPTIONS, BUDGET_OPTIONS, DATE_OPTIONS } from "./chatbotData";

/**
 * Step-by-step guided flow used for Conversational Booking (workflow §15D):
 *   category -> city -> budget -> date -> results
 * Steps without `options` expect free-text input (e.g. city name).
 * The bot always remembers answers already given (see ChatBot.jsx's
 * conversation context), so a category picked from a knowledge-base
 * answer skips straight to the next unanswered step.
 */
const conversationFlow = {
  category: {
    message: "What type of service are you looking for?",
    options: CATEGORY_OPTIONS,
  },
  city: {
    message: "Which city are you looking in? 📍",
    input: true,
  },
  budget: {
    message: "What's your approximate budget? 💰",
    options: BUDGET_OPTIONS,
  },
  date: {
    message: "When do you need the service? 📅",
    options: DATE_OPTIONS,
  },
};

export default conversationFlow;