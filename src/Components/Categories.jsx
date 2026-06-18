import "./Categories.css";

const categoryList = [
  "Beauty & Wellness",
  "Mehndi & Bridal",
  "Tailoring & Fashion",
  "Food & Catering",
  "Education & Tutoring",
  "Yoga & Fitness",
  "Home Services",
  "Arts & Crafts",
];

const Categories = () => {
  return (
    <section className="categories">

      <h2>Browse Categories</h2>

      <div className="category-grid">

        {categoryList.map((item, index) => (
          <div className="category-card" key={index}>
            <h3>{item}</h3>
          </div>
        ))}

      </div>

    </section>
  );
};

export default Categories;