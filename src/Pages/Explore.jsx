import "./Explore.css";

import bannerWomen from "../assets/Images/bannerWomen.png";

import provider1 from "../assets/Images/provider1.jpg";
import provider2 from "../assets/Images/provider2.jpg";
import provider3 from "../assets/Images/provider3.jpg";
import provider4 from "../assets/Images/provider4.jpg";
import provider5 from "../assets/Images/provider5.jpg";
import provider6 from "../assets/Images/provider6.jpg";
import provider7 from "../assets/Images/provider7.jpg";
import provider8 from "../assets/Images/provider8.jpg";
import customer1 from "../assets/Images/customer1.jpg";
import customer2 from "../assets/Images/customer2.jpg";
import customer3 from "../assets/Images/customer3.jpg";


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
FaSearch,
FaMapMarkerAlt,
FaHeart,
FaRegHeart,
FaStar,
FaShieldAlt,
FaAward,
FaUsers,
FaHeadset,
FaRedoAlt,
FaChevronDown,
FaThLarge,
FaLeaf,
FaBars,
FaSpa,
FaPaintBrush,
FaTshirt,
FaUtensils,
FaGraduationCap,
FaBook,
FaDumbbell,
FaHome,
FaPalette,
FaEllipsisH
} from "react-icons/fa";

const providers = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Beauty Expert",
    city: "Hyderabad",
    rating: 4.9,
    reviews: 120,
    price: 500,
    image: provider1,
    badge: "Top Rated",
    skills: ["Makeup", "Hair Style", "Skin Care"],
     experience: 6,
    available: true,
    category: "Beauty & Wellness",
  },

  {
    id: 2,
    name: "Nashra Fatima",
    role: "Mehndi Artist",
    city: "Bengaluru",
    rating: 4.8,
    reviews: 95,
    price: 300,
    image: provider2,
    badge: "Trending",
    skills: ["Bridal Mehndi", "Arabic", "Mehndi"],
     experience: 3,
    available: true,
    category: "Mehndi & Henna",
  },

  {
    id: 3,
    name: "Reshma Tailors",
    role: "Tailoring Expert",
    city: "Hyderabad",
    rating: 4.9,
    reviews: 150,
    price: 250,
    image: provider3,
    badge: "Highly Rated",
    skills: ["Blouse", "Saree Falls", "Alterations"],
     experience: 8,
    available: true,
    category: "Tailoring & Fashion",
  },

  {
    id: 4,
    name: "Lakshmi Devi",
    role: "Home Chef",
    city: "Secunderabad",
    rating: 4.7,
    reviews: 80,
    price: 400,
    image: provider4,
    badge: "Rising Star",
    skills: ["South Indian", "North Indian", "Snacks"],
     experience: 2,
    available: true,
    category: "Food & Catering",
  },

  {
    id: 5,
    name: "Kavya Tutor",
    role: "Private Tutor",
    city: "Nizamabad",
    rating: 4.8,
    reviews: 110,
    price: 600,
    image: provider5,
    badge: "Verified",
    skills: ["Maths", "Science", "English"],
     experience: 5,
    available: true,
    category: "Education & Tutoring",
  },

  {
    id: 6,
    name: "Sneha Rao",
    role: "Trainer",
    city: "Mumbai",
    rating: 4.8,
    reviews: 170,
    price: 1500,
    image: provider6,
    badge: "Top Rated",
    skills: ["Diet Counselling", "Aerobics", "Home Sessions"],
     experience: 9,
    available: true,
    category: "Yoga & Fitness",
  },

  {
    id: 7,
    name: "Anjali Services",
    role: "Home Care Services ",
    city: "Bengaluru",
    rating: 4.9,
    reviews: 130,
    price: 2000,
    image: provider7,
    badge: "Popular",
    skills: ["Cleaning", "Cooking", "Babysitting"],
     experience: 1,
    available: true,
    category: "Home Services",
  },

  {
    id: 8,
    name: "Aarti Creations",
    role: "Handicraft Artist",
    city: "Hyderabad",
    rating: 4.6,
    reviews: 60,
    price: 350,
    image: provider8,
    badge: "New",
    skills: ["Pottery", "Thread Work", "Handmade Jewellery"],
     experience: 7,
    available: true,
    category: "Handicrafts",
  }
];  



function Explore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

const [selectedLocation, setSelectedLocation] =useState("All");
const [sortBy, setSortBy] =useState("topRated");
const [wishlist, setWishlist] =useState([]);
const [viewMode, setViewMode] =useState("grid");
const [selectedCategories, setSelectedCategories] =useState([]);
const [selectedRating, setSelectedRating] =useState(0);
const [selectedServiceMode, setSelectedServiceMode] = useState("all");

const [openSections, setOpenSections] = useState({
  category: true,
  serviceMode: true,
  rating: true,
  price: true,
  experience: true,
  availability: true,
});

// TOGGLE FILTER SECTION
   const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

// WISHLIST
  const toggleWishlist = (id) => {
  setWishlist((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};

  // CATEGORY FILTER
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter(
          (item) => item !== category
        )
      );
    } else {
      setSelectedCategories([
        ...selectedCategories,
        category,
      ]);
    }

    };

    const applyFilters = () => {

setAppliedFilters({
price:selectedPrice,
experience:selectedExperience,
availability:selectedAvailability
});

};

  // RESET
  const resetFilters = () => {
  setSearchTerm("");
  setSelectedLocation("All");
  setSelectedCategories([]);
  setSelectedRating(0);
  setSortBy("topRated");
  setWishlist([]);
  setViewMode("grid");
  setSelectedPrice("all");
setSelectedExperience("all");
setSelectedAvailability(false);

setAppliedFilters({
price:"all",
experience:"all",
availability:false,
});
};

const [selectedPrice, setSelectedPrice] = useState("all");
const [selectedExperience, setSelectedExperience] = useState("all");
const [selectedAvailability, setSelectedAvailability] = useState(false);

const [appliedFilters, setAppliedFilters] = useState({
  price: "all",
  experience: "all",
  availability: false,
});

  // FILTERED DATA
  const filteredProviders = providers
    .filter((provider) => {
      const searchMatch =
        provider.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

  const serviceModeMatch =
  selectedServiceMode === "all" ||
  provider.serviceMode === selectedServiceMode;    

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(provider.category);
        const ratingMatch =
        provider.rating >= selectedRating;
        const priceMatch =
appliedFilters.price==="all" ||

(appliedFilters.price==="0-499" &&
provider.price<=499) ||

(appliedFilters.price==="500-999" &&
provider.price>=500 &&
provider.price<=999) ||

(appliedFilters.price==="1000+" &&
provider.price>=1000);

const experienceMatch =
appliedFilters.experience==="all" ||
provider.experience>=appliedFilters.experience;

const availabilityMatch =
!appliedFilters.availability ||
provider.available;

      return (
        searchMatch &&
        categoryMatch &&
        ratingMatch &&
        serviceModeMatch &&
        priceMatch &&
experienceMatch &&
availabilityMatch
      );

      
       })
  .sort((a, b) => {

    if (sortBy === "topRated")
      return b.rating - a.rating;

    if (sortBy === "priceLow")
      return a.price - b.price;

    if (sortBy === "priceHigh")
      return b.price - a.price;

    return 0;
  });
  
  return (
    <div className="explore-page">

      {/* SEARCH */}

      <section className="search-section">

        <div className="search-box">
          <FaSearch />
          <input
type="text"
placeholder="Search service provider..."
value={searchTerm}
onChange={(e)=>
setSearchTerm(e.target.value)
}
/>
        </div>

        <div className="location-box">
          <FaMapMarkerAlt />

          <select
value={selectedLocation}
onChange={(e)=>
setSelectedLocation(e.target.value)
}
>
<option value="All">
All Locations
</option>

<option value="Hyderabad">
Hyderabad
</option>

<option value="Bengaluru">
Bengaluru
</option>

<option value="Mumbai">
Mumbai
</option>

<option value="Secunderabad">
Secunderabad
</option>

<option value="Nizamabad">
Nizamabad
</option>

</select>
        </div>

      </section>


      {/* HEADER */}

      {/* HEADER */}

<section className="service-header">

  <div className="header-left">

    <span className="hero-tag">
      🌸 EMPOWERING WOMEN, BUILDING FUTURES
    </span>

    <h1 className="hero-title">
      Our Service Providers
    </h1>

    <div className="title-line"></div>

    <p className="hero-desc">
      Discover skilled and trusted women
      professionals near you.
    </p>

    <div className="hero-features">

      <div className="feature-box">
        <FaAward />
        <span>Verified Experts</span>
      </div>

      <div className="feature-box">
        <FaStar />
        <span>Quality Services</span>
      </div>

      <div className="feature-box">
        <FaMapMarkerAlt />
        <span>Available Near You</span>
      </div>

      <div className="feature-box">
        <FaShieldAlt />
        <span>Safe & Reliable</span>
      </div>

    </div>

  </div>

  <div className="header-right">
    <img src={bannerWomen} alt="Providers Banner" />
  </div>

</section>

      {/* CATEGORY PILLS */}

      <section className="category-row">
        <button className="category-pill active"> 
          <FaThLarge />All Categories</button>

        <button className="category-pill">
          <FaSpa />Beauty & Wellness</button>

<button className="category-pill">
<FaPaintBrush />
Mehndi & Henna
</button>

<button className="category-pill">
<FaTshirt />
Tailoring & Fashion
</button>

<button className="category-pill">
<FaUtensils />
Home Chef
</button>

<button className="category-pill">
<FaPalette />
Handicrafts
</button>

<button className="category-pill">
<FaBook />
Education
</button>

<button className="category-pill">
<FaDumbbell />
Fitness
</button>

<button className="category-pill">
<FaEllipsisH />
More
</button>

</section>

      {/* MAIN SECTION */}

      <section className="main-layout">

        {/* SIDEBAR */}

        <aside className="filters">

          <div className="filter-header">
            <h3>Filters</h3>
<span
  className="reset"
  onClick={resetFilters}
>
  <FaRedoAlt />
  Reset
</span>         </div>

          <div className="filter-group">

<h4 onClick={() => toggleSection("category")}>
  Category
  <FaChevronDown />
</h4>

{openSections.category && (
  <>

            <label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Beauty & Wellness")
    }
  />
  Beauty & Wellness
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Mehndi & Henna")
    }
  />
  Mehndi & Henna
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Tailoring & Fashion")
    }
  />
  Tailoring & Fashion
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Food & Catering")
    }
  />
  Food & Catering
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Education & Tutoring")
    }
  />
  Education & Tutoring
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Yoga & Fitness")
    }
  />
  Yoga & Fitness
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Home Services")
    }
  />
  Home Services
</label>

<label>
  <input
    type="checkbox"
    onChange={() =>
      handleCategoryChange("Handicrafts")
    }
  />
  Handicrafts
</label>
</>
)}
          </div>

          <div className="filter-group">

  <h4 onClick={() => toggleSection("serviceMode")}>
    Service Mode
    <FaChevronDown />
  </h4>

  {openSections.serviceMode && (
    <>
      <label>
        <input
          type="checkbox"
          checked={selectedServiceMode === "Home Visit"}
          onChange={() =>
            setSelectedServiceMode(
              selectedServiceMode === "Home Visit"
                ? "all"
                : "Home Visit"
            )
          }
        />
        🏠 Home Visit
      </label>

      <label>
        <input
          type="checkbox"
          checked={selectedServiceMode === "At Shop"}
          onChange={() =>
            setSelectedServiceMode(
              selectedServiceMode === "At Shop"
                ? "all"
                : "At Shop"
            )
          }
        />
        🏪 At Shop
      </label>

      <label>
        <input
          type="checkbox"
          checked={selectedServiceMode === "Online"}
          onChange={() =>
            setSelectedServiceMode(
              selectedServiceMode === "Online"
                ? "all"
                : "Online"
            )
          }
        />
        💻 Online
      </label>

    </>
  )}

</div>

          <div className="filter-group">

  <h4 onClick={() => toggleSection("rating")}>
    Rating
    <FaChevronDown />
  </h4>

  {openSections.rating && (
    <>
      <label>
        <input
          type="checkbox"
          onChange={() => setSelectedRating(4.5)}
        />
        <FaStar className="star" />
        4.5 & Above
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setSelectedRating(4.0)}
        />
        <FaStar className="star" />
        4.0 & Above
      </label>

      <label>
        <input
          type="checkbox"
          onChange={() => setSelectedRating(3.5)}
        />
        <FaStar className="star" />
        3.5 & Above
      </label>
    </>
  )}

</div>
         <div className="filter-group">

  <h4 onClick={() => toggleSection("price")}>
    Price Range
    <FaChevronDown />
  </h4>

  {openSections.price && (
    <div className="price-tags">

<span
className={selectedPrice==="0-499" ? "active-tag":""}
onClick={()=>setSelectedPrice("0-499")}
>
₹0-499
</span>

<span
className={selectedPrice==="500-999" ? "active-tag":""}
onClick={()=>setSelectedPrice("500-999")}
>
₹500-999
</span>

<span
className={selectedPrice==="1000+" ? "active-tag":""}
onClick={()=>setSelectedPrice("1000+")}
>
₹1000+
</span>

</div>
  )}

</div> 

<div className="filter-group">

  <h4 onClick={() => toggleSection("experience")}>
    Experience
    <FaChevronDown />
  </h4>

  {openSections.experience && (
    <div className="price-tags">

<span
className={selectedExperience==="all" ? "active-tag":""}
onClick={()=>setSelectedExperience("all")}
>
All
</span>

<span
className={selectedExperience===1 ? "active-tag":""}
onClick={()=>setSelectedExperience(1)}
>
1+ Years
</span>

<span
className={selectedExperience===3 ? "active-tag":""}
onClick={()=>setSelectedExperience(3)}
>
3+ Years
</span>

<span
className={selectedExperience===5 ? "active-tag":""}
onClick={()=>setSelectedExperience(5)}
>
5+ Years
</span>

<span
className={selectedExperience===10 ? "active-tag":""}
onClick={()=>setSelectedExperience(10)}
>
10+ Years
</span>

</div>
  )}

</div>
          <div className="filter-group">

  <h4 onClick={() => toggleSection("availability")}>
    Availability
    <FaChevronDown />
  </h4>

  {openSections.availability && (
    <>
      <label>
        <input type="checkbox" />
        Available Today
      </label>

      <label>
        <input type="checkbox" />
        Available This Week
      </label>
    </>
  )}

</div>
        <button
className="apply-btn"
onClick={applyFilters}
>
Apply Filters
</button>  

        </aside>

        {/* CONTENT */}

        <div className="provider-section">

          <div className="top-bar">

            <p>
              Showing 1-8 of 120+ providers
            </p>

            <div className="sort-area">

<div className="sort-box">
<span>Sort by:</span>

<select
value={sortBy}
onChange={(e)=>
setSortBy(e.target.value)
}
>

<option value="topRated">
Top Rated
</option>

<option value="priceLow">
Price Low To High
</option>

<option value="priceHigh">
Price High To Low
</option>

</select>
</div>

<div className="view-buttons">
<button
onClick={() =>
setViewMode("grid")
}
className={
viewMode === "grid"
? "active-view"
: ""
}
>
<FaThLarge />
</button>

<button
onClick={() =>
setViewMode("list")
}
className={
viewMode === "list"
? "active-view"
: ""
}
>
<FaBars />
</button>
</div>

</div>
          </div>

<div
  className={`providers-grid ${
    viewMode === "list"
    ? "list"
      : ""
  }`}
>
            {filteredProviders.map((provider) => (

              <div className="provider-card" key={provider.id}>

                <div className="card-overlay">

  <div
    className={`hover-badge ${
      provider.badge === "Top Rated"
        ? "top"
        : provider.badge === "Trending"
        ? "trending"
        : provider.badge === "Highly Rated"
        ? "high"
        : provider.badge === "Rising Star"
        ? "rising"
        : "new"
    }`}
  >
    {provider.badge}
  </div>

  <button
  className={`wishlist-btn ${
    wishlist.includes(provider.id) ? "active" : ""
  }`}
  onClick={() => toggleWishlist(provider.id)}
>
  {wishlist.includes(provider.id) ? (
    <FaHeart />
  ) : (
    <FaRegHeart />
  )}
</button>

</div>


                <img
  src={provider.image}
  alt={provider.name}
/>
<div className="card-wave">

</div>

  <div
    className={`hover-badge ${
      provider.badge === "Top Rated"
        ? "top"
        : provider.badge === "Trending"
        ? "trending"
        : provider.badge === "Highly Rated"
        ? "high"
        : provider.badge === "Rising Star"
        ? "rising"
        : "new"
    }`}
  >
    {provider.badge}
  </div>



<div className="provider-hover-info">

  <h4>{provider.name}</h4>

  <p>
    ⭐ {provider.rating} Rating
  </p>

  <p>
    {provider.reviews}+ Reviews
  </p>

  <button
    className="hover-profile-btn"
    onClick={() => navigate("/coming-soon")}
  >
    View Profile
  </button>

</div>

<div className="available-tag">
  ✓ Available Today
</div>


                <div className="card-content">

                  <h3>{provider.name}</h3>

                  <p className="role">{provider.role}</p>

                  <div className="meta-row">

  <span className="rating">
    ⭐ {provider.rating}
    <small>
      ({provider.reviews})
    </small>
  </span>

  <span className="location">
    📍 {provider.city}
  </span>

</div>

                  <p className="price">
Starting from ₹{provider.price}
</p>

<div className="skills">

{provider.skills.map((skill,index)=>(
<span key={index}>
{skill}
</span>
))}

</div>

               <button
  className="profile-btn"
  onClick={() => navigate("/coming-soon")}
>
  View Profile →
</button>



                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      <div
style={{
display:"flex",
justifyContent:"center",
gap:"10px",
marginTop:"30px"
}}
>

<button className="category-pill active">
1
</button>

<button className="category-pill">
2
</button>

<button className="category-pill">
3
</button>

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


{/* TRUST SECTION */}

<section className="trust-section">

<div className="trust-card">

<FaShieldAlt size={30} />

<h4>Verified & Trusted</h4>

<p>
All service providers are verified for your safety.
</p>

</div>

<div className="trust-card">

<FaAward size={30} />

<h4>Top Quality Service</h4>
<p>
We ensure the best quality services.
</p>

</div>

<div className="trust-card">

<FaUsers size={30} />

<h4>Empowering Women</h4>

<p>
Every booking supports women entrepreneurs.
</p>

</div>

<div className="trust-card">

<FaHeadset size={30} />

<h4>24/7 Support</h4>
<p>
We are here to help anytime.
</p>

</div>

</section>

    </div>
  );
}

export default Explore;