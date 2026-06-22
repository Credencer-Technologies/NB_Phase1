import { useNavigate } from "react-router-dom";
import "./BrowseCategories.css";

const categories = [
  {
    title: "Beauty & Wellness",
    image: "/images/categories/beauty.jpg",
    path: "/explore/beauty",
  },
  {
    title: "Mehndi & Bridal",
    image: "/images/categories/mehndi.jpg",
    path: "/explore/mehndi",
  },
  {
    title: "Tailoring & Fashion",
    image: "/images/categories/fashion.jpg",
    path: "/explore/fashion",
  },
  {
    title: "Food & Catering",
    image: "/images/categories/catering.jpg",
    path: "/explore/catering",
  },
  {
    title: "Education & Tutoring",
    image: "/images/categories/tutor.jpg",
    path: "/explore/education",
  },
  {
    title: "Yoga & Fitness",
    image: "/images/categories/yoga.jpg",
    path: "/explore/yoga",
  },
];

export default function BrowseCategories() {
  const navigate = useNavigate();

  return (
    <section className="browse-categories">
      <h2>Browse Categories</h2>

      <div className="category-row">
        {categories.map((item, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => navigate(item.path)}
          >
            <img src={item.image} alt={item.title} />

            <div className="category-content">
              <h3>{item.title}</h3>

              <button className="arrow-btn">
                →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}