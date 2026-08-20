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
  // Duplicate cards so the horizontal animation looks continuous
  const categories = [...baseCategories, ...baseCategories];

  return (
    <section className="browse-categories">
      {/* HEADER */}
      <div className="browse-header">
        <span className="section-tag">EXPLORE</span>

        <h2>Browse Categories</h2>

        <p>Discover premium services</p>
      </div>

      {/* AUTO SCROLL */}
      <div className="scroll-wrapper">
        <div className="auto-scroll-track">
          {categories.map((item, index) => (
            <article
              className="category-card"
              key={`${item.title}-${index}`}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
              />

              <div className="card-overlay"></div>

              <div className="category-content">
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}