import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  // Change to true after successful login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);

    // Later you can also do:
    // localStorage.removeItem("isLoggedIn");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img
            src="/image/Logo.jpeg"
            alt="Logo"
          />
          <div className="logo-text">
            <span>NarriBazar</span>
          </div>
        </Link>
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search services..."
        />
      </div>

      <div className="nav-actions">
        {!isLoggedIn ? (
<<<<<<< HEAD
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
=======
          <>
        <button
  className="login-btn"
  onClick={() => navigate("/login")}
>
  Login
</button>

            <button className="register-btn">Register</button>
          </>
>>>>>>> 56220394ce3c640e650d24c4886b1cb72a7de0c7
        ) : (
          <div
            className="profile-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaUserCircle className="profile-icon" />

            {showDropdown && (
              <div className="dropdown-menu">
                <button>Dashboard</button>
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