import provider1 from "../assets/Images/provider1.jpg";
import provider2 from "../assets/Images/provider2.jpg";
import provider3 from "../assets/Images/provider3.jpg";
import provider4 from "../assets/Images/provider4.jpg";
import provider5 from "../assets/Images/provider5.jpg";
import provider6 from "../assets/Images/provider6.jpg";
import provider7 from "../assets/Images/provider7.jpg";
import provider8 from "../assets/Images/provider8.jpg";
import provider9 from "../assets/Images/provider9.jpg";
import provider10 from "../assets/Images/provider10.jpg";
import provider11 from "../assets/Images/provider11.jpg";
import customer1 from "../assets/Images/customer1.jpg";
import customer2 from "../assets/Images/customer2.jpg";
import customer3 from "../assets/Images/customer3.jpg";

import { useState } from "react";
import "./Explore.css";
import {
FaSearch,
FaMapMarkerAlt,
FaStar
} from "react-icons/fa";

const providers = [
{
id:1,
name:"Priya Das",
category:"Beauty & Wellness",
icon:"💄",
city:"Hyderabad",
rating:4.9,
completed:186,
image:provider1
},
{
id:2,
name:"Nashra Mehendi Artist",
category:"Mehndi & Bridal",
icon:"🌿",
city:"Bengaluru",
rating:4.8,
completed:140,
image:provider2
},
{
id:3,
name:"Sharma Tailoring",
category:"Tailoring & Fashion",
icon:"✂️",
city:"Bengaluru",
rating:4.7,
completed:210,
image:provider3
},
{
id:4,
name:"Lakshmi caterers",
category:"Food & Catering",
icon:"🍽️",
city:"Hyderabad",
rating:5,
completed:310,
image:provider4
},
{
id:5,
name:"BrainSpark Academy",
category:"Education & Tutoring",
icon:"📚",
city:"Karimnagar",
rating:4.6,
completed:120,
image:provider5
},
{
id:6,
name:"Yoga By Kavya",
category:"Yoga & Fitness",
icon:"🧘",
city:"Hyderabad",
rating:4.9,
completed:165,
image:provider6
},
{
id:7,
name:"Home Care Services",
category:"Home Services",
icon:"🏠",
city:"Nizamabad",
rating:4.8,
completed:240,
image:provider7
},
{
id:8,
name:"Creative Arts Hub",
category:"Arts & Crafts",
icon:"🎨",
city:"hyderabad",
rating:4.7,
completed:98,
image:provider8
},
{
  id:9,
  name:"Ananya Beauty Studio",
  category:"Beauty & Wellness",
  icon:"💄",
  city:"Mumbai",
  rating:4.8,
  completed:150,
  image:provider9
},
{
  id:10,
 name:"Bridal Makeovers",
 category:"Beauty & Wellness",
 icon:"💄",
 city:"hyderabad",
 rating:5.0,
 completed:210,
 image:provider10
},
{
  id:11,
  name:"Homely Foods",
  category:"Food & Catering",
  icon:"🍽️",
  city:"Bengaluru",
  rating:4.0,
  completed:280,
  image:provider11
}

];

function Explore() {

const [category,setCategory] = useState("");
const [city,setCity] = useState("");

const filteredProviders = providers.filter(provider => {

const categoryMatch =
category === "" ||
provider.category === category;

const cityMatch =
city === "" ||
provider.city.toLowerCase().includes(
city.toLowerCase()
);

return categoryMatch && cityMatch;
});

return (
<div className="explore">

{/* FILTER BAR FIRST */}

<div className="filter-wrapper">
  <div className="filter-bar">

    <select
      value={category}
      onChange={(e)=>setCategory(e.target.value)}
    >
      <option value="">All Categories</option>
      <option>Beauty & Wellness</option>
      <option>Mehndi & Bridal</option>
      <option>Tailoring & Fashion</option>
      <option>Food & Catering</option>
      <option>Education & Tutoring</option>
      <option>Yoga & Fitness</option>
      <option>Home Services</option>
      <option>Arts & Crafts</option>
      <option>Others</option>
    </select>

    <input
      type="text"
      placeholder="Search city..."
      value={city}
      onChange={(e)=>setCity(e.target.value)}
    />

    <button>
      <FaSearch />
      Search
    </button>

  </div>
</div>


<div className="hero">
  <h1>
Every Service Tells a Story of Empowerment
</h1>

<p>
Connecting talented women professionals with customers who value quality, trust, and excellence.
</p>
</div>


{/* IMPACT SECTION */}

<section className="impact-section">

  <div className="impact-tag">
    <span></span>
    OUR IMPACT
    <span></span>
  </div>

  <h2 className="impact-main-title">
    Our Impact
  </h2>

  <p className="impact-description">
    Every connection on NaariBazar creates more than just a transaction —
    it creates confidence, independence, and a stronger community.
  </p>

  <div className="impact-grid">

    <div className="impact-card pink">
      <div className="impact-icon">🚀</div>
      <h3>500+</h3>
      <p>WOMEN ENTREPRENEURS</p>
      <div className="impact-line"></div>
    </div>

    <div className="impact-card orange">
      <div className="impact-icon">👜</div>
      <h3>120+</h3>
      <p>BUSINESS LISTINGS</p>
      <div className="impact-line"></div>
    </div>

    <div className="impact-card purple">
      <div className="impact-icon">🏪</div>
      <h3>15+</h3>
      <p>CATEGORIES</p>
      <div className="impact-line"></div>
    </div>

    <div className="impact-card green">
      <div className="impact-icon">👥</div>
      <h3>10K+</h3>
      <p>HAPPY CUSTOMERS</p>
      <div className="impact-line"></div>
    </div>

    <div className="impact-card blue">
      <div className="impact-icon">🏅</div>
      <h3>98%</h3>
      <p>SATISFACTION RATE</p>
      <div className="impact-line"></div>
    </div>

  </div>

  <div className="impact-footer">

    <p className="impact-quote">
      We’re building a thriving ecosystem where women grow,
      businesses flourish, and communities prosper together.
    </p>

    <p className="impact-heart">
      ❤️ Proudly creating impact, together.
    </p>

  </div>

</section>

<div className="providers-grid">

{filteredProviders.length === 0 ? (

<div className="empty-state">
No providers found for your search.
Try a different category or city.
</div>

) : (

filteredProviders.map((provider)=>(
  <div className="provider-card" key={provider.id}>
  <div className="provider-card-inner">

    {/* FRONT */}

    <div className="provider-front">

      <div className="cloud-image">
        <img
          src={provider.image}
          alt={provider.name}
        />
      </div>

      <div className="provider-info">

        <div className="service-icon">
  {provider.icon}
</div>

        <h3>{provider.name}</h3>

        <span className="category-tag">
          {provider.category}
        </span>

      </div>

    </div>

    {/* BACK */}

    <div className="provider-back">

      <h3>{provider.name}</h3>

      <p>
        <FaMapMarkerAlt />
        {provider.city}
      </p>

      <div className="provider-rating">
        ⭐ {provider.rating}
      </div>

      <div className="completed-badge">
        {provider.completed} Services Completed
      </div>

      {provider.rating >= 4.8 && (
        <span className="verified-badge">
          ✔ Verified Provider
        </span>
      )}

      <button
        className="view-btn"
        onClick={() =>
          alert(`${provider.name} Profile Page Coming Soon`)
        }
      >
        View Profile
      </button>

    </div>

  </div>
</div> 
))
)}

</div>

<section className="testimonial-section">

  <div className="testimonial-wave"></div>

  <h2 className="testimonial-title">
    🌿 What Our Customers Say 🌿
  </h2>

  <div className="testimonial-grid">

    <div className="testimonial-card">
      <div className="stars">★★★★★</div>

      <p>
        Found an amazing bridal artist within minutes.
        The process was smooth and trustworthy.
      </p>

      <div className="customer-info">
        <img src={customer1} alt="Ayesha Khan" />

        <div>
          <h4>Ayesha Khan</h4>
          <span>Hyderabad</span>
        </div>
      </div>
    </div>

    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p>
         Excellent tailoring service.
        The quality exceeded my expectations.
      </p>
      <div className="customer-info">
        <img src={customer2} alt="Sneha Reddy" />

        <div>
          <h4>Sneha Reddy</h4>
          <span>Hyderabad</span>
        </div>
      </div>
    </div>

    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p>
        NaariBazar helped me discover local women-led businesses
        I never knew existed.
      </p>
      <div className="customer-info">
        <img src={customer3} alt="Kavya Sharma" />

        <div>
          <h4>Kavya Sharma</h4>
          <span>Hyderabad</span>
        </div>
      </div>
    </div>

  </div>

</section>

</div>
);
}

export default Explore;