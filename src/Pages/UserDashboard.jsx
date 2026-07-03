import service1 from "../assets/Images/service1.jpeg";
import service2 from "../assets/Images/service2.jpeg";

import { useState } from "react";
import { useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import "./UserDashboard.css";

function UserDashboard() {
  const initialUser = {
    full_name: "Ruman",
    phone: "+91 9876543210",
    city: "Hyderabad",
  };

  const sampleServices = [
  {
    id: 1,
    title: "Bridal Makeup",
    category: "Beauty Services",
    city: "Hyderabad",
    price: 3000,
    image: service1
  },
  {
    id: 2,
    title: "Mehendi Design",
    category: "Beauty Services",
    city: "Warangal",
    price: 1500,
    image: service2
  },
  {
    id: 3,
    title: "Home Catering",
    category: "Food Services",
    city: "Karimnagar",
    price: 5000,
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
  },
];

  const [user, setUser] = useState(initialUser);
  const [services, setServices] = useState(sampleServices);
  const [saved, setSaved] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Never");
  const [wishlistItems, setWishlistItems] = useState([]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });

    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    setSaved(true);

    const currentTime = new Date().toLocaleString();

    setLastUpdated(currentTime);

    // Backend API
    // PUT /api/v1/users/me
  };

  const handleReset = () => {
    setUser(initialUser);
    setSaved(false);
  };

  const completion =
    user.full_name && user.city ? 100 : 50;

 const handleDeleteService = (id) => {

  // Remove from UI
  const updatedServices = services.filter(
    (service) => service.id !== id
  );

  setServices(updatedServices);

  // Remove from localStorage
  const dashboardServices =
    JSON.parse(
      localStorage.getItem("providerDashboardServices")
    ) || [];

  const updatedDashboardServices =
    dashboardServices.filter(
      (service) => service.id !== id
    );

  localStorage.setItem(
    "providerDashboardServices",
    JSON.stringify(updatedDashboardServices)
  );
};
useEffect(() => {
  const savedWishlist =
    JSON.parse(
      localStorage.getItem("wishlistServices")
    ) || [];
  setWishlistItems(savedWishlist);
}, []);

useEffect(() => {

const providerServices =
JSON.parse(
localStorage.getItem("providerDashboardServices")
) || [];

setServices([
...sampleServices,
...providerServices
]);

}, []);
const removeWishlistItem = (id) => {

  const updated =
    wishlistItems.filter(
      item => item.id !== id
    );
  setWishlistItems(updated);
  localStorage.setItem(
    "wishlistServices",
    JSON.stringify(updated)
  );};

  return (

    <div className="user-dashboard">
      <div className="dashboard-wrapper">

        {/* Banner */}

        <div className="dashboard-banner">
          <div>
            <h1>Welcome Back 👋</h1>
            <p>
              Manage your personal information securely.
            </p>
          </div>

          <div className="avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Status Cards */}

        <div className="stats-grid">

          <div className="stat-card">
            <h3>Account Status</h3>
            <span className="verified">
              Verified
            </span>
          </div>

          <div className="stat-card">
            <h3>Profile Completion</h3>
            <p>{completion}%</p>
          </div>

          <div className="stat-card">
            <h3>Last Updated</h3>
            <p>{lastUpdated}</p>
          </div>

        </div>

        {/* Personal Details */}

        <div className="details-card">

          <div className="card-header">
            <h2>Personal Details</h2>

            {!saved && (
              <span className="edit-warning">
                Unsaved Changes
              </span>
            )}
          </div>

          <form onSubmit={handleSave}>

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                value={user.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
  <label>Email Address</label>

  <input
    type="email"
    name="email"
    value={user.email}
    onChange={handleChange}
    placeholder="Enter your email"
  />

  <small>
    This email will be used for notifications and account updates.
  </small>
</div>


            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                value={user.phone}
                disabled
              />

              <small>
                Phone number is used for login and
                cannot be edited.
              </small>
            </div>


            <div className="form-group">
              <label>City</label>

              <input
                type="text"
                name="city"
                value={user.city}
                onChange={handleChange}
              />
            </div>

            <div className="button-group">

              <button
                type="submit"
                className="save-btn"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
              >
                Reset
              </button>

            </div>

            {saved && (
              <div className="success-message">
                Profile updated successfully ✅
              </div>
            )}

          </form>
        </div>

        <div className="services-section">

  <div className="services-header">
    <h2>Service Listings</h2>

    <span>
      {services.length} Services
    </span>
  </div>

  <div className="services-grid">

    {services.map((service) => (

      <div
        className="service-card"
        key={service.id}
      >

        <img
          src={service.image}
          alt={service.title}
          className="service-image"
        />

        <div className="service-content">

          <h3>{service.title}</h3>

          <p>{service.category}</p>

          <div className="service-location">
  <FaMapMarkerAlt />
  {service.city?.split(",")[0]}
</div>

          <div className="service-price">
            ₹ {service.price}
            <div className="service-actions">
  <button
    type="button"
    className="delete-service"
    onClick={() => handleDeleteService(service.id)}
  >
    <FaTrash />
  </button>
</div>
          </div>
        </div>

      </div>

    ))}

  </div>

</div>
   {/* ===========================
        MY WISHLIST
=========================== */}

<div className="wishlist-dashboard-section">

<div className="wishlist-dashboard-header">

<h2>
<FaHeart />
My Favourite 
</h2>

<span>

{wishlistItems.length} Saved

</span>

</div>

{wishlistItems.length===0 ? (

<div className="wishlist-empty">

No favourite services yet ❤️

</div>

):(

<div className="wishlist-dashboard-grid">

{wishlistItems.map((item)=>(

<div
className="wishlist-dashboard-card"
key={item.id}
>

<img
src={item.image}
alt={item.name}
/>

<div className="wishlist-dashboard-content">

<h3>{item.name}</h3>

<p>{item.category}</p>

<div className="wishlist-dashboard-location">

<FaMapMarkerAlt />

{item.city}

</div>

<div className="wishlist-dashboard-bottom">

<div>

⭐ {item.rating}

</div>

<div>

₹{item.price}

</div>

</div>

<button
className="wishlist-remove-btn"
onClick={()=>
removeWishlistItem(item.id)
}
>

Remove

</button>

</div>

</div>

))}

</div>
)}

</div>  

       <div className="quick-actions">

    <h2>Support Center</h2>
    
    <div className="action-buttons">

        <button
            className="action-btn"
            onClick={() => setShowSupport(true)}
        >
            Contact Support
        </button>

    </div>

    {showSupport && (

<div className="support-modal">

<div className="support-card">

<button
className="close-btn"
onClick={() => setShowSupport(false)}
>
×
</button>

<h2>Customer Support</h2>

<p>
Our team is happy to assist you.
</p>

<div className="support-item">
<strong>Support Email</strong>
<span>support@naribazar.in</span>
</div>

<div className="support-item">
<strong>Business Enquiries</strong>
<span>info@naribazar.in</span>
</div>

<div className="support-item">
<strong>Customer Care</strong>
<span>+91 9490594867</span>
</div>

<div className="support-item">
<strong>Corporate Office</strong>

<span>
8th Floor, Vaishnavi's Cynosure,
<br />
2-48/5/6,
<br />
Gachibowli Road,
Opp. RTTC,
<br />
Telecom Nagar,
Hyderabad,
Telangana - 500032
</span>

</div>

</div>

</div>

)}

</div> 


      </div>
    </div>
  );
}

export default UserDashboard;