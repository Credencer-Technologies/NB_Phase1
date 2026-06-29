import service1 from "../assets/Images/service1.jpg";
import service2 from "../assets/Images/service2.jpg";

import { useState } from "react";
import { FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
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
  const [lastUpdated, setLastUpdated] = useState("Never");
  const [editingService, setEditingService] = useState(null);
const [serviceForm, setServiceForm] = useState({
  title: "",
  category: "",
  city: "",
  price: "",
});

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

const handleEditService = (service) => {
  setEditingService(service.id);

  setServiceForm({
    title: service.title,
    category: service.category,
    city: service.city,
    price: service.price,
  });
};

const handleUpdateService = () => {
  setServices(
    services.map((service) =>
      service.id === editingService
        ? {
            ...service,
            title: serviceForm.title,
            category: serviceForm.category,
            city: serviceForm.city,
            price: serviceForm.price,
          }
        : service
    )
  );

  setEditingService(null);
};

  const completion =
    user.full_name && user.city ? 100 : 50;

  const handleDeleteService = (id) => {
  setServices(services.filter((service) => service.id !== id));
};

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
    <h2>My Services</h2>

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
            {service.city}
          </div>

          <div className="service-price">
            ₹ {service.price}
          </div>

          <div className="service-actions">

            <button
  type="button"
  className="edit-service"
  onClick={() => handleEditService(service)}
>
              <FaEdit />
            </button>

            <button
             type="button"
              className="delete-service"
              onClick={() =>
                handleDeleteService(service.id)
              }
            >
              <FaTrash />
            </button>

          </div>

        </div>

      </div>

    ))}

  </div>

  {editingService && (

  <div className="edit-modal">

    <div className="edit-box">

      <h2>Edit Service</h2>

      <input
        type="text"
        value={serviceForm.title}
        onChange={(e) =>
          setServiceForm({
            ...serviceForm,
            title: e.target.value,
          })
        }
      />

      <input
        type="text"
        value={serviceForm.category}
        onChange={(e) =>
          setServiceForm({
            ...serviceForm,
            category: e.target.value,
          })
        }
      />

      <input
        type="text"
        value={serviceForm.city}
        onChange={(e) =>
          setServiceForm({
            ...serviceForm,
            city: e.target.value,
          })
        }
      />

      <input
        type="number"
        value={serviceForm.price}
        onChange={(e) =>
          setServiceForm({
            ...serviceForm,
            price: e.target.value,
          })
        }
      />

      <div className="modal-buttons">

        <button
          onClick={handleUpdateService}
        >
          Update
        </button>

        <button
          onClick={() =>
            setEditingService(null)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}

</div>      


        <div className="quick-actions">
  <h2>Quick Actions</h2>

  <div className="action-buttons">

    <button className="action-btn">
      Contact Support
    </button>

    <button className="action-btn">
      Help Center
    </button>

  </div>
</div>


      </div>
    </div>
  );
}

export default UserDashboard;