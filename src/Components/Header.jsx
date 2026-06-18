import { useState } from "react";
import "./Header.css";
import { FaSearch } from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
        <button className="login-btn">
          Login
        </button>
<button
  className="register-btn"
  onClick={() => navigate("/register")}
>
  Register
</button>

        <button className="dashboard-btn">
          Dashboard
        </button>
      </div>

    </header>
  );
};

export default Header;