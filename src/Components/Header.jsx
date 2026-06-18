import { useState } from "react";
import "./Header.css";
import { FaSearch, FaUserCircle } from "react-icons/fa";

const Header = () => {
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
        <span>Naari</span>Bazar
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
          <>
            <button className="login-btn">Login</button>
            <button className="register-btn">Register</button>
          </>
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