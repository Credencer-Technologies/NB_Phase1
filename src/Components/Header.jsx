import { useState } from "react";
import "./Header.css";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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

      <div className={`nav-actions ${menuOpen ? "active" : ""}`}>
        <button className="login-btn">Login</button>
        <button className="register-btn">Register</button>
        <button className="dashboard-btn">Dashboard</button>
      </div>

      
    </header>
  );
};

export default Header;