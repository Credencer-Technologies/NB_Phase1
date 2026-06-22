import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { FaSearch, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();

  // Change to true after successful login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);

    // localStorage.removeItem("isLoggedIn");
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link to="/">
          <img
            src="/image/Logo.jpeg"
            alt="NaariBazar Logo"
          />

          <div className="logo-text">
            <span>Naari</span>Bazar
          </div>
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact Us</Link>
      </nav>

      {/* Search */}
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search services..."
        />
      </div>

      {/* Login / Profile */}
      <div className="nav-actions">
        {!isLoggedIn ? (
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        ) : (
          <div
            className="profile-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaUserCircle className="profile-icon" />

            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>

                <button onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;