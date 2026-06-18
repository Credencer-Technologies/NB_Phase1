
import "./FeaturedProviders.css";

const providers = [
  {
    id: 1,
    name: "Priya Sharma",
    category: "Mehndi",
    city: "Hyderabad",
    rating: "4.9",
  },
  {
    id: 2,
    name: "Sneha",
    category: "Tailoring",
    city: "Hyderabad",
    rating: "4.8",
  },
  {
    id: 3,
    name: "Lakshmi",
    category: "Tutor",
    city: "Warangal",
    rating: "4.7",
  },
  {
    id: 4,
    name: "Anjali",
    category: "Yoga",
    city: "Hyderabad",
    rating: "5.0",
  },
];

const FeaturedProviders = () => {
  return (
    <section className="featured">

      <h2>Featured Providers</h2>

      <div className="provider-container">

        {providers.map((provider) => (
          <div className="provider-card" key={provider.id}>

            <img
              src="https://via.placeholder.com/120"
              alt={provider.name}
            />

            <h3>{provider.name}</h3>

            <p>{provider.category}</p>

            <p>{provider.city}</p>

            <p>⭐ {provider.rating}</p>

            <button>View Profile</button>

          </div>
        ))}

      </div>

    </section>
  );
};

export default FeaturedProviders;