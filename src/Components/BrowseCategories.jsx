import { useNavigate } from "react-router-dom";
import "./BrowseCategories.css";

const baseCategories = [
  {
    title: "Beauty & Wellness",
    image: "/image/Beauty.png",
  },
  {
    title: "Mehandi & Bridal",
    image: "/image/Mehandi.png",
  },
  {
    title: "Tailoring & Fashion",
    image: "/image/Tailoring.png",
  },
  {
    title: "Food & Catering",
    image: "/image/Cooking.png",
  },
  {
    title: "Education & Tutoring",
    image: "/image/Teaching.png",
  },
  {
    title: "Yoga & Fitness",
    image: "/image/Yoga.png",
  },
];

export default function BrowseCategories() {
  // Duplicate categories for infinite scrolling
  const categories = [...baseCategories, ...baseCategories];

  return (
    <section className="browse-categories micro-section glass">
      <div className="browse-header">
        <span className="section-tag">EXPLORE</span>

        <h2>Browse Categories</h2>

        <p>Discover premium services</p>
      </div>

      {/* Scroll Wrapper */}
      <div className="scroll-wrapper">
        <div className="auto-scroll-track">
          {categories.map((item, index) => (
            <div
              key={index}
              className="category-card micro-card"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
              />

              <div className="category-content">
                <h3>{item.title}</h3>
              </div>

              <div className="card-overlay"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}