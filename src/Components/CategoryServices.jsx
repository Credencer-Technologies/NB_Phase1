import "./CategoryServices.css";
import { useNavigate } from "react-router-dom";

const services = [
  {
    title: "Beauty & Wellness",
    desc: "Professional salons, skincare, spa, makeup, haircare, and wellness services to help you look and feel your best.",
    path: "/category/beauty-wellness",
    icon: "💄",
  },
  {
    title: "Mehendi & Bridal",
    desc: "Expert bridal makeup artists, mehendi designers, hairstylists, and wedding beauty professionals for your special day.",
    path: "/category/mehendi-bridal",
    icon: "👰",
  },
  {
    title: "Tailoring & Fashion",
    desc: "Custom tailoring, boutique services, designer wear, alterations, embroidery, and personalized fashion solutions.",
    path: "/category/tailoring-fashion",
    icon: "👗",
  },
  {
    title: "Food & Catering",
    desc: "Home chefs, catering services, bakers, event catering, and delicious homemade food for every occasion.",
    path: "/category/food-catering",
    icon: "🍽️",
  },
  {
    title: "Education & Tutoring",
    desc: "Experienced tutors, online classes, skill development, language learning, and academic coaching for all ages.",
    path: "/category/education-tutoring",
    icon: "📚",
  },
  {
    title: "Yoga & Fitness",
    desc: "Certified yoga instructors, personal trainers, Zumba, meditation, physiotherapy, and wellness coaching.",
    path: "/category/yoga-fitness",
    icon: "🧘‍♀️",
  },
  {
    title: "Home Services",
    desc: "Trusted professionals for home cleaning, plumbing, electrical work, appliance repairs, and maintenance services.",
    path: "/category/home-services",
    icon: "🏠",
  },
  {
    title: "Arts & Crafts",
    desc: "Handmade gifts, paintings, handicrafts, DIY creations, customized art, and creative workshops by talented artisans.",
    path: "/category/arts-crafts",
    icon: "🎨",
  },
];

export default function CategoryServices() {
  const navigate = useNavigate();

  return (
    <section className="category-section">
      <h2 className="category-title">Explore Categories</h2>

      <div className="category-grid">
        {services.map((item, index) => (
          <div
            key={index}
            className="category-card"
            style={{ "--i": index }}
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>

            <div className="card-hover-line"></div>
          </div>
        ))}
      </div>
    </section>
  );
}