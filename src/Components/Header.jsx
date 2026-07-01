import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaTimes, FaBars } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const handleSearch = () => {
    const value = query.trim();
    if (!value) return;
    navigate(`/explore?search=${encodeURIComponent(value)}`);
  };

  /* AUTH SYNC */
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setRole(localStorage.getItem("role"));
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
    };
  }, []);

  /* SCROLL EFFECT */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* KEYBOARD SHORTCUTS */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }

      if (e.key === "Escape") {
        setCommandOpen(false);
        setSearchOpen(false);
        setShowDropdown(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* BODY SCROLL LOCK */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileMenuOpen]);

  const handleDashboard = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (role === "provider") {
      navigate("/provider-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/login");
  };

  const handleCommandClick = (path) => {
    setCommandOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <>
      {/* HEADER */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>

        {/* LOGO */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src="/image/Logo.jpeg" alt="Logo" />
            <h4 className="logo-text">
              <span className="nari">Nari</span>
              <span className="bazar">Bazar</span>
            </h4>
          </Link>
        </div>

        {/* NAV LINKS (DESKTOP ONLY via CSS) */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* RIGHT ACTIONS (DESKTOP ONLY CONTENT) */}
        <div className="nav-actions">

          {/* SEARCH */}
          <div
            ref={searchRef}
            className={`search-container ${searchOpen ? "active" : ""}`}
          >
            <FaSearch
              className="search-icon"
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
                else handleSearch();
              }}
            />

            {searchOpen && (
              <>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search services..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />

                <FaTimes
                  className="close-icon"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                />
              </>
            )}
          </div>

          {/* DASHBOARD */}
          <button
            className={`dashboard-btn ${!isLoggedIn ? "disabled" : ""}`}
            disabled={!isLoggedIn}
            onClick={handleDashboard}
          >
            Dashboard
          </button>

          {/* LOGIN / PROFILE */}
          {!isLoggedIn ? (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          ) : (
            <div ref={profileRef} className="profile-menu">
              <FaUserCircle
                className="profile-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />

              {showDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ HAMBURGER (MOVED OUTSIDE NAV ACTIONS - FIXED) */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(true)}
        >
          <FaBars />
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="mobile-menu">
            <button
              className="mobile-close"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaTimes />
            </button>

            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

            {isLoggedIn && (
              <button
                onClick={() => {
                  handleDashboard();
                  setMobileMenuOpen(false);
                }}
              >
                Dashboard
              </button>
            )}

            {!isLoggedIn ? (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            )}
          </div>
        </>
      )}

      {/* COMMAND PALETTE */}
      {commandOpen && (
        <div className="command-overlay" onClick={() => setCommandOpen(false)}>
          <div className="command-box" onClick={(e) => e.stopPropagation()}>

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
            />

            <div className="command-results">
              <div onClick={() => handleCommandClick("/explore/beauty")}>
                Beauty & Wellness
              </div>

              <div onClick={() => handleCommandClick("/explore/mehndi")}>
                Mehndi & Bridal
              </div>

              <div onClick={() => handleCommandClick("/explore/fashion")}>
                Fashion
              </div>

              <div onClick={() => handleCommandClick("/explore/yoga")}>
                Yoga & Fitness
              </div>

              <div onClick={() => handleCommandClick("/explore/education")}>
                Education
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;