import { useNavigate } from "react-router-dom";
import "./BrowseCategories.css";

const baseCategories = [
  { title: "Beauty & Wellness", image: "/image/Beauty.png", path: "/explore/beauty" },
  { title: "Mehandi & Bridal", image: "/image/Mehandi.png", path: "/explore/mehndi" },
  { title: "Tailoring & Fashion", image: "/image/Tailoring.png", path: "/explore/fashion" },
  { title: "Food & Catering", image: "/image/Cooking.png", path: "/explore/catering" },
  { title: "Education & Tutoring", image: "/image/Teaching.png", path: "/explore/education" },
  { title: "Yoga & Fitness", image: "/image/Yoga.png", path: "/explore/yoga" },
];

export default function BrowseCategories() {
  const navigate = useNavigate();

  // duplicate for infinite loop effect
  const categories = [...baseCategories, ...baseCategories];

  return (
    <section className="browse-categories micro-section glass">

      <div className="browse-header">
        <span className="section-tag">EXPLORE</span>
        <h2>Browse Categories</h2>
        <p>Discover premium services</p>
      </div>

      <div className="auto-scroll-track">

        {categories.map((item, index) => (
          <div
            key={index}
            className="category-card micro-card"
            onClick={() => navigate(item.path)}
          >
            <img src={item.image} alt={item.title} />

            <div className="category-content">
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}

      </div>

    </section>
  );
}