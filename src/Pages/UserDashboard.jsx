import { useState } from "react";
import "./UserDashboard.css";

function UserDashboard() {
  const initialUser = {
    full_name: "Ruman",
    phone: "+91 9876543210",
    city: "Hyderabad",
  };

  const [user, setUser] = useState(initialUser);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Never");

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