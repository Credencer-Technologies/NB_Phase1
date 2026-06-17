import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <span>NAARI</span>BAZAR
      </div>

      <nav>
        <ul className="nav-links">
          <li>Home</li>
          <li>Explore</li>
          <li>Providers</li>
          <li>About</li>
        </ul>
      </nav>

      <button className="login-btn">
        Login
      </button>
    </header>
  );
};

export default Header;