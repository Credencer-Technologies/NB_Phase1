// chatbotLogic.js

const serviceCategories = {
  beauty: {
    title: "💄 Beauty & Wellness",
    services: [
      "Bridal Makeup",
      "Party Makeup",
      "Hair Styling",
      "Skincare",
      "Spa",
      "Salon at Home",
    ],
  },

  mehndi: {
    title: "🌿 Mehndi & Henna",
    services: [
      "Bridal Mehndi",
      "Arabic Mehndi",
      "Traditional Mehndi",
      "Engagement Mehndi",
    ],
  },

  tailoring: {
    title: "👗 Tailoring & Fashion",
    services: [
      "Blouse Stitching",
      "Boutique",
      "Alterations",
      "Designer Dresses",
      "Kids Wear",
    ],
  },

  food: {
    title: "👩‍🍳 Food & Catering",
    services: [
      "Home Catering",
      "Homemade Food",
      "Snacks",
      "Birthday Cakes",
      "Tiffins",
    ],
  },

  handicrafts: {
    title: "🎨 Handicrafts",
    services: [
      "Handmade Gifts",
      "Paintings",
      "Home Decor",
      "Custom Crafts",
    ],
  },

  education: {
    title: "📚 Education & Tutoring",
    services: [
      "Home Tuition",
      "Online Classes",
      "Computer Courses",
      "Spoken English",
    ],
  },

  fitness: {
    title: "💪 Yoga & Fitness",
    services: [
      "Yoga",
      "Personal Trainer",
      "Zumba",
      "Diet Consultation",
    ],
  },
};
const containsAny = (text, keywords) =>
  keywords.some((word) => text.includes(word));

function formatCategory(category) {
  return `${category.title}

${category.services.map((item) => `• ${item}`).join("\n")}

You can explore these providers from the Explore page. 😊`;
}

export function getBotReply(message) {
  const msg = message.toLowerCase().trim();

  // ---------------- Greetings ----------------

  if (
    msg === "hi" ||
    msg === "hello" ||
    msg === "hey" ||
    msg === "hii" ||
    msg === "good morning" ||
    msg === "good evening"
  ) {
    return `👋 Welcome to NariBazar!
I'm your AI Assistant.

I can help you with:

💄 Find Service Providers
📅 Booking Services
👩 Become a Provider
❓ FAQs
📞 Contact Support

How can I help you today?`;
  }

  // ---------------- Find Services ----------------

  if (
    msg.includes("service") ||
    msg.includes("find") ||
    msg.includes("search") ||
    msg.includes("provider") ||
    msg.includes("looking")
  ) {
    return `✨ Available Categories

💄 Beauty & Wellness
🌿 Mehndi & Henna
👗 Tailoring & Fashion
👩‍🍳 Food & Catering
🎨 Handicrafts
📚 Education & Tutoring
💪 Yoga & Fitness

Type any category name to know more.`;
  }

  // ---------------- Natural Language ----------------

  if (
    msg.includes("makeup") ||
    msg.includes("beauty") ||
    msg.includes("bridal makeup") ||
    msg.includes("salon")
  ) {
    return formatCategory(serviceCategories.beauty);
  }

  if (
    msg.includes("mehndi") ||
    msg.includes("henna")
  ) {
    return formatCategory(serviceCategories.mehndi);
  }

  if (
    msg.includes("tailor") ||
    msg.includes("tailoring") ||
    msg.includes("fashion") ||
    msg.includes("stitch")
  ) {
    return formatCategory(serviceCategories.tailoring);
  }

  if (
    msg.includes("food") ||
    msg.includes("chef") ||
    msg.includes("catering") ||
    msg.includes("cake") ||
    msg.includes("tiffin")
  ) {
    return formatCategory(serviceCategories.food);
  }

  if (
    msg.includes("craft") ||
    msg.includes("gift") ||
    msg.includes("painting") ||
    msg.includes("handmade")
  ) {
    return formatCategory(serviceCategories.handicrafts);
  }

  if (
    msg.includes("education") ||
    msg.includes("tuition") ||
    msg.includes("teacher") ||
    msg.includes("course")
  ) {
    return formatCategory(serviceCategories.education);
  }

  if (
    msg.includes("fitness") ||
    msg.includes("yoga") ||
    msg.includes("gym") ||
    msg.includes("zumba")
  ) {
    return formatCategory(serviceCategories.fitness);
  }

  // ---------------- Booking ----------------

  if (
    msg.includes("book") ||
    msg.includes("appointment") ||
    msg.includes("booking")
  ) {
    return `📅 Booking is very simple.

1️⃣ Open Explore Page
2️⃣ Select a Provider
3️⃣ Click "Book Now"
4️⃣ Choose your preferred date & time
5️⃣ Confirm Booking

Enjoy your service! 😊`;
  }

  // ---------------- Become Provider ----------------

  if (
    msg.includes("become provider") ||
    msg.includes("register") ||
    msg.includes("provider registration") ||
    msg.includes("sell")
  ) {
    return `👩 Become a NariBazar Provider

✔ Register your account
✔ Complete your profile
✔ Upload portfolio
✔ Wait for verification
✔ Start receiving customers

We're excited to have you onboard!`;
  }

  // ---------------- Contact ----------------

  if (
    msg.includes("contact") ||
    msg.includes("support") ||
    msg.includes("help")
  ) {
    return `📞 Contact Support

📧support@naribazar.in
We'll be happy to help you.`;
  }

  // ---------------- FAQ ----------------

  if (
    msg.includes("faq") ||
    msg.includes("question")
  ) {
    return `❓ Frequently Asked Questions

• How to book a service?
• How to become a provider?
• Payment methods?
• How to contact support?

Just ask me any question. 😊`;
  }

  // ---------------- Thanks ----------------

  if (
    msg.includes("thanks") ||
    msg.includes("thank you")
  ) {
    return `😊 You're welcome!

Happy to help.

Have a wonderful day! 🌸`;
  }

  // Small conversation replies

if (["ok", "okay", "kk", "k"].includes(msg)) {
  return "😊 Great! Let me know if you need anything else.";
}

if (
  ["yes", "yeah", "yep", "sure", "continue"].includes(msg)
) {
  return "👍 Awesome! What would you like to do next?";
}

if (
  ["no", "nope", "not now"].includes(msg)
) {
  return "😊 No problem. I'm here whenever you need me.";
}

if (
  ["thanks", "thank you", "thx", "thanku"].includes(msg)
) {
  return "😊 You're welcome!";
}

if (
  ["bye", "goodbye", "see you"].includes(msg)
) {
  return "👋 Bye! Have a wonderful day.";
}
 // ---------------- Default ----------------
return `🤔 Sorry, I didn't understand.

Try asking about:
• Makeup
• Mehndi
• Tailoring
• Food
• Booking
• Payments`;
}