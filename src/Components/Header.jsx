import "./Header.css";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  return (
    <header className="header">

      <div className="logo">
        <span>Naari</span>Bazar
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search services, providers, categories..."
        />
      </div>

      <div className="nav-actions">
        <button className="login-btn">
          Login
        </button>

        <button className="register-btn">
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