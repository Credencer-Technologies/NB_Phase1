export const faqCategories = {

  "👤 Account & Registration": [
    "What is Nari Bazar?",
    "Who can use Nari Bazar?",
    "How do I create an account?",
    "Do I need to register before using Nari Bazar?"
  ],


  "🔍 Finding Services": [
    "How do I find the right service provider?",
    "Are all service providers verified?",
    "What information can I see on a provider's profile?",
    "Can I compare different providers?"
  ],


  "📅 Booking & Enquiries": [
    "How do I contact a provider?",
    "Can I choose my preferred date and time?",
    "How can I track my enquiries?",
    "Can I edit or cancel an enquiry?",
    "What if a provider does not respond?"
  ],


  "💰 Pricing & Reviews": [
    "How do I know the service charges?",
    "Can I negotiate the price?",
    "Can I save my favourite providers?",
    "Can I rate and review a provider?"
  ],


  "🛡️ Security & Support": [
    "Is my personal information secure?",
    "How do I report a complaint or incorrect information?",
    "Does Nari Bazar provide customer support?"
  ]

};

export const faqData = {

  "What is Nari Bazar?":
  "Nari Bazar is a digital platform that connects customers with verified women entrepreneurs offering services across multiple categories such as beauty, tailoring, food, education, fitness, and home services.",


  "Who can use Nari Bazar?":
  "Anyone looking for trusted local services can use Nari Bazar, while women entrepreneurs can register as service providers.",


  "How do I create an account?":
  "Register using your mobile number, verify it with an OTP, and complete your profile.",


  "Do I need to register before using Nari Bazar?":
  "You can browse providers without registering, but you need an account to send enquiries, save providers, and manage bookings.",



  "How do I find the right service provider?":
  "Use the search bar, categories, city filters, and provider profiles to find services that match your requirements.",


  "Are all service providers verified?":
  "Yes. Every provider undergoes document verification before appearing on the platform.",


  "What information can I see on a provider's profile?":
  "You can view their biography, services offered, experience, portfolio, pricing (if available), ratings, reviews, and verification status.",


  "Can I compare different providers?":
  "Yes. You can compare providers based on ratings, reviews, pricing, experience, services offered, and customer feedback.",



  "How do I contact a provider?":
  "Open the provider's profile and submit an enquiry. The provider will receive your request and respond accordingly.",


  "Can I choose my preferred date and time?":
  "Yes. Mention your preferred schedule while sending the enquiry.",


  "How can I track my enquiries?":
  "Your User Dashboard displays all current and previous enquiries along with their status.",


  "Can I edit or cancel an enquiry?":
  "Yes. You can modify or cancel an enquiry before it is accepted by the provider.",


  "What if a provider does not respond?":
  "You can contact another verified provider or report the issue to the Nari Bazar support team.",



  "How do I know the service charges?":
  "Service charges are displayed on the provider's profile or discussed during the enquiry process.",


  "Can I negotiate the price?":
  "Yes. Customers and providers can mutually discuss pricing before confirming the service.",


  "Can I save my favourite providers?":
  "Yes. You can bookmark providers for quick access later.",


  "Can I rate and review a provider?":
  "Yes. After completing a service, you can leave ratings and reviews to help other customers.",



  "Is my personal information secure?":
  "Yes. Nari Bazar protects your personal information and only shares essential details when required.",


  "How do I report a complaint or incorrect information?":
  "Use the Help & Support or Contact Us section to report fake profiles, incorrect details, or service-related issues.",


  "Does Nari Bazar provide customer support?":
  "Yes. Our support team is available to assist users with enquiries, complaints, technical issues, and general assistance."

};



export const botReplies = {

  welcome: {
    text: "👋 Welcome to NariBazar! How can I help you today?",
    options: [
      "Find a Service",
      "Become a Provider",
      "Booking Help",
      "FAQs"
    ]
  },


  "Find a Service": {
    text: "Please choose a category.",
    options: [
      "Beauty & Wellness",
      "Mehndi & Bridal",
      "Tailoring & Fashion",
      "Food & Catering",
      "Education & Tutoring",
      "Yoga & Fitness",
      "Home Services",
      "Arts & Crafts"
    ]
  },


  "Booking Help": {
    text:
    "📅 To book a service:\n\n1️⃣ Choose a category\n2️⃣ Select a provider\n3️⃣ Send an enquiry\n4️⃣ Confirm your booking.",
    
    options:[
      "Find a Service",
      "FAQs"
    ]
  },


  "FAQs": {
    text: "❓ Please select a FAQ category.",
    options: Object.keys(faqCategories)
  }

};