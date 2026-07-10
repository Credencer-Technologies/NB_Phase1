const conversationFlow = {
  welcome: {
    message:
      "👋 Hi! Welcome to NariBazar.\n\nI'm your virtual assistant.\n\nHow can I help you today?",
    options: [
      "🔍 Find a Service",
      "👩 Become a Provider",
      "📅 Booking Help",
      "💳 Payments",
      "❓ FAQs"
    ]
  },

  serviceCategory: {
    message:
      "Great! 😊\n\nWhich service are you looking for?",
    options: [
      "💄 Beauty & Wellness",
      "💍 Mehndi & Bridal",
      "👗 Fashion",
      "📚 Education",
      "🧘 Yoga & Fitness",
      "📸 Photography",
      "🏠 Home Services"
    ]
  },

  askCity: {
    message:
      "Perfect!\n\nWhich city are you looking in?",
    input: true
  },

  askBudget: {
    message:
      "What's your approximate budget?",
    options: [
      "₹1000-3000",
      "₹3000-5000",
      "₹5000+"
    ]
  },

  askDate: {
    message:
      "When do you need the service?",
    options: [
      "Today",
      "Tomorrow",
      "This Week"
    ]
  }
};

export default conversationFlow;