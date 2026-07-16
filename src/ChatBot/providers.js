const providers = [
  { id: 1, name: "Priya Makeovers", category: "Beauty & Wellness", city: "Hyderabad", rating: 4.9, experience: "6 Years", price: "₹3500", image: "/image/provider1.jpg" },
  { id: 2, name: "Glam Studio", category: "Beauty & Wellness", city: "Hyderabad", rating: 4.8, experience: "5 Years", price: "₹2800", image: "/image/provider2.jpg" },
  { id: 3, name: "Sana's Mehndi Art", category: "Mehndi & Bridal", city: "Hyderabad", rating: 4.9, experience: "5 Years", price: "₹2500", image: "/image/provider3.jpg" },
  { id: 4, name: "Royal Henna Studio", category: "Mehndi & Bridal", city: "Bangalore", rating: 4.7, experience: "4 Years", price: "₹4000", image: "/image/provider4.jpg" },
  { id: 5, name: "StitchCraft Boutique", category: "Fashion", city: "Hyderabad", rating: 4.6, experience: "7 Years", price: "₹1500", image: "/image/provider5.jpg" },
  { id: 6, name: "Trendy Tailors", category: "Fashion", city: "Chennai", rating: 4.5, experience: "3 Years", price: "₹1800", image: "/image/provider6.jpg" },
  { id: 7, name: "Bloom Yoga Studio", category: "Yoga & Fitness", city: "Hyderabad", rating: 4.8, experience: "6 Years", price: "₹1200", image: "/image/provider7.jpg" },
  { id: 8, name: "FitLife Wellness", category: "Yoga & Fitness", city: "Mumbai", rating: 4.7, experience: "4 Years", price: "₹2000", image: "/image/provider8.jpg" },
  { id: 9, name: "Momentz Photography", category: "Photography", city: "Hyderabad", rating: 4.9, experience: "8 Years", price: "₹6000", image: "/image/provider9.jpg" },
  { id: 10, name: "Frame Story Studio", category: "Photography", city: "Bangalore", rating: 4.6, experience: "5 Years", price: "₹5500", image: "/image/provider10.jpg" },
  { id: 11, name: "QuickFix Home Services", category: "Home Services", city: "Hyderabad", rating: 4.5, experience: "3 Years", price: "₹900", image: "/image/provider11.jpg" },
  { id: 12, name: "CleanNest Services", category: "Home Services", city: "Delhi", rating: 4.4, experience: "2 Years", price: "₹1100", image: "/image/provider12.jpg" },
  { id: 13, name: "BrightMinds Tutorials", category: "Education", city: "Hyderabad", rating: 4.8, experience: "5 Years", price: "₹1000", image: "/image/provider13.jpg" },
  { id: 14, name: "SkillUp Academy", category: "Education", city: "Pune", rating: 4.6, experience: "4 Years", price: "₹1500", image: "/image/provider14.jpg" },
];

// "₹1000-3000" -> [1000, 3000], "₹5000+" -> [5000, Infinity]
export function parseBudgetRange(budgetLabel) {
  if (!budgetLabel) return [0, Infinity];
  if (budgetLabel.includes("+")) {
    const min = Number(budgetLabel.replace(/[^\d]/g, ""));
    return [min, Infinity];
  }
  const [min, max] = budgetLabel.replace(/[₹]/g, "").split("-").map(Number);
  return [min || 0, max || Infinity];
}

/**
 * Filters providers by the collected conversational-booking context.
 * Falls back gracefully — a city with no exact match still shows the
 * category's providers rather than returning nothing, and the same
 * applies to budget — so the user always sees *something* relevant.
 */
export function findMatchingProviders(context = {}) {
  const { category, city, budget } = context;

  let list = category ? providers.filter((p) => p.category === category) : [...providers];

  if (city) {
    const cityLower = city.trim().toLowerCase();
    const cityMatches = list.filter((p) => p.city.toLowerCase().includes(cityLower));
    if (cityMatches.length) list = cityMatches;
  }

  if (budget) {
    const [min, max] = parseBudgetRange(budget);
    const priceOf = (p) => Number(String(p.price).replace(/[^\d]/g, ""));
    const budgetMatches = list.filter((p) => priceOf(p) >= min && priceOf(p) <= max);
    if (budgetMatches.length) list = budgetMatches;
  }

  return list.slice(0, 3);
}

export default providers;