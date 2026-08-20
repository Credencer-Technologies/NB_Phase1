import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const Logo = "/image/logo2.jpeg";

import {
  FaSearch,
  FaUserCircle,
  FaTimes,
  FaMicrophoneAlt,
} from "react-icons/fa";
import LogoRevealOverlay from "./LogoRevealOverlay";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  /* =========================
     STATE
  ========================= */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logo animation
  const [showLogoAnim, setShowLogoAnim] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
const recognitionRef = useRef(null);
const [isListening, setIsListening] = useState(false);

/* =========================
   VOICE SEARCH
========================= */
const handleVoiceSearch = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Voice search is not supported in this browser. Please use Google Chrome."
    );
    return;
  }

  // Stop listening if already active
  if (isListening && recognitionRef.current) {
    recognitionRef.current.stop();
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
  const voiceText =
    event.results[0][0].transcript.trim().toLowerCase();

  console.log("Voice command:", voiceText);

  // LOGIN
  if (
    voiceText === "login" ||
    voiceText.includes("log in") ||
    voiceText.includes("login")
  ) {
    setQuery("");
    setSearchOpen(false);
    navigate("/login");
    return;
  }

  // REGISTRATION
  if (
    voiceText === "register" ||
    voiceText.includes("registration") ||
    voiceText.includes("register") ||
    voiceText.includes("sign up") ||
    voiceText.includes("signup")
  ) {
    setQuery("");
    setSearchOpen(false);
    // Open the existing registration selection page
  navigate("/login", {
    state: { openRegister: true },
  });
    return;
  }

  // NORMAL SEARCH
  setQuery(voiceText);
};

  recognition.onerror = (event) => {
    console.error(
      "Voice search error:",
      event.error
    );
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognitionRef.current = recognition;
  recognition.start();
};
  /* =========================
     SEARCH
  ========================= */
  const handleSearch = () => {
  const value = query.trim().toLowerCase();

  if (!value) return;

  setSearchOpen(false);
  setQuery("");

  // LOGIN
  if (
    value === "login" ||
    value.includes("log in")
  ) {
    navigate("/login");
    return;
  }

  // REGISTER
  if (
    value === "register" ||
    value.includes("registration") ||
    value.includes("sign up") ||
    value.includes("signup")
  ) {
    navigate("/login", {
      state: { openRegister: true },
    });
    return;
  }

  // NORMAL SEARCH
  navigate(`/explore?search=${encodeURIComponent(value)}`);
};
  /* =========================
     AUTH SYNC
  ========================= */
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(
        localStorage.getItem("isLoggedIn") === "true"
      );
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

  /* =========================
     SCROLL EFFECT
  ========================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================
     OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================
     KEYBOARD SHORTCUTS
  ========================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }

      // Escape
      if (e.key === "Escape") {
        setCommandOpen(false);
        setSearchOpen(false);
        setShowDropdown(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =========================
     BODY SCROLL LOCK
  ========================= */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* =========================
     DASHBOARD
  ========================= */
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

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");

    setIsLoggedIn(false);
    setRole(null);
    setShowDropdown(false);

    navigate("/login");
  };

  /* =========================
     COMMAND PALETTE
  ========================= */
  const handleCommandClick = (path) => {
    setCommandOpen(false);
    setQuery("");
    navigate(path);
  };

  /* =========================
     LOGO ANIMATION
  ========================= */
  const handleLogoClick = (e) => {
    e.preventDefault();

    if (showLogoAnim) return;

    setShowLogoAnim(true);
  };

  const handleLogoAnimationClose = () => {
    setShowLogoAnim(false);
    navigate("/");
  };

  /* =========================
     MOBILE MENU TOGGLE
  ========================= */
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header
        className={`header ${
          scrolled ? "scrolled" : ""
        }`}
      >
        {/* =================================================
            LOGO
        ================================================= */}
        <div className="logo">
          <Link
            to="/"
            className="logo-link"
            onClick={handleLogoClick}
            aria-label="NariBazar Home"
          >
            <img
              src={Logo}
              alt="NariBazar Logo"
            />

            <h4 className="logo-text">
              <span className="nari">Nari</span>
              <span className="bazar">Bazar</span>
            </h4>
          </Link>
        </div>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}
        <nav className="nav-links">
          <Link
            to="/"
            className={
              isActive("/") ? "active" : ""
            }
          >
            Home
          </Link>

          <Link
            to="/explore"
            className={
              isActive("/explore")
                ? "active"
                : ""
            }
          >
            Explore
          </Link>

          <Link
            to="/about"
            className={
              isActive("/about")
                ? "active"
                : ""
            }
          >
            About
          </Link>

          <Link
            to="/contact"
            className={
              isActive("/contact")
                ? "active"
                : ""
            }
          >
            Contact
          </Link>
        </nav>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}
        <div className="nav-actions">

          {/* SEARCH */}
          <div
            ref={searchRef}
            className={`search-container ${
              searchOpen ? "active" : ""
            }`}
          >
            <FaSearch
              className="search-icon"
              onClick={() => {
                if (!searchOpen) {
                  setSearchOpen(true);
                } else {
                  handleSearch();
                }
              }}
            />

            {searchOpen && (
              <>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search services..."
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();

                      if (query.trim()) {
                        handleSearch();
                     }
                   }

                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setQuery("");
                    }
                  }}
                />

           <button
  type="button"
  className={`mic-button ${isListening ? "listening" : ""}`}
  onClick={handleVoiceSearch}
  title="Voice Search"
  aria-label="Voice Search"
>
  <FaMicrophoneAlt className="mic-icon" />
</button>

<FaTimes
  className="close-icon"
  onClick={() => {
    if (
      recognitionRef.current &&
      isListening
    ) {
      recognitionRef.current.stop();
    }

    setSearchOpen(false);
    setQuery("");
  }}
/>
              </>
            )}
          </div>

          {/* DASHBOARD */}
          <button
            className={`dashboard-btn ${
              !isLoggedIn ? "disabled" : ""
            }`}
            disabled={!isLoggedIn}
            onClick={handleDashboard}
          >
            Dashboard
          </button>

          {/* LOGIN / PROFILE */}
          {!isLoggedIn ? (
            <button
              className="login-btn"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>
          ) : (
            <div
              ref={profileRef}
              className="profile-menu"
            >
              <FaUserCircle
                className="profile-icon"
                onClick={() =>
                  setShowDropdown(
                    !showDropdown
                  )
                }
              />

              {showDropdown && (
                <div className="dropdown-menu">
                  <button
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            ANIMATED HAMBURGER
        ================================================= */}
        <button
          className={`hamburger-btn ${
            mobileMenuOpen ? "is-open" : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          <span className="hamburger-line line-one" />
          <span className="hamburger-line line-two" />
          <span className="hamburger-line line-three" />
        </button>
      </header>

      {/* =====================================================
          MOBILE GLASS MENU
      ===================================================== */}
      <div
        className={`mobile-nav-container ${
          mobileMenuOpen ? "open" : ""
        }`}
      >
        {/* BLURRED BACKGROUND */}
        <div
          className="mobile-nav-overlay"
          onClick={closeMobileMenu}
        />

        {/* GLASS MENU */}
        <nav
          className="mobile-nav-menu"
          aria-hidden={!mobileMenuOpen}
        >
          {/* MENU HEADER */}
          <div className="mobile-menu-header">
            <div className="mobile-menu-brand">
              <img
                src={Logo}
                alt=""
              />

              <span>
                Nari<span>Bazar</span>
              </span>
            </div>

            <button
              className="mobile-nav-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          {/* LINKS */}
          <div className="mobile-nav-links">

            <Link
              to="/"
              className={
                isActive("/")
                  ? "active"
                  : ""
              }
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">
                
              </span>
              <span>Home</span>
            </Link>

            <Link
              to="/explore"
              className={
                isActive("/explore")
                  ? "active"
                  : ""
              }
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">
                
              </span>
              <span>Explore</span>
            </Link>

           

            <Link
              to="/about"
              className={
                isActive("/about")
                  ? "active"
                  : ""
              }
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">
                
              </span>
              <span>About</span>
            </Link>

            <Link
              to="/contact"
              className={
                isActive("/contact")
                  ? "active"
                  : ""
              }
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">
                
              </span>
              <span>Contact</span>
            </Link>
          </div>

          {/* ACTIONS */}
          <div className="mobile-nav-actions">

            {!isLoggedIn ? (
              <button
                className="mobile-login-btn"
                onClick={() => {
                  navigate("/login");
                  closeMobileMenu();
                }}
                type="button"
              >
                Login
              </button>
            ) : (
              <button
                className="mobile-logout-btn"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                type="button"
              >
                Logout
              </button>
            )}

            <button
              className={`mobile-dashboard-btn ${
                !isLoggedIn ? "disabled" : ""
              }`}
              disabled={!isLoggedIn}
              onClick={() => {
                handleDashboard();
                closeMobileMenu();
              }}
              type="button"
            >
              Dashboard
            </button>
          </div>

          {/* MENU FOOTER */}
          <div className="mobile-menu-footer">
            <span>Discover. Connect. Grow.</span>
          </div>
        </nav>
      </div>

      {/* =====================================================
          COMMAND PALETTE
      ===================================================== */}
      {commandOpen && (
        <div
          className="command-overlay"
          onClick={() =>
            setCommandOpen(false)
          }
        >
          <div
            className="command-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <input
              autoFocus
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search categories..."
            />

            <div className="command-results">

              <div
                onClick={() =>
                  handleCommandClick(
                    "/explore/beauty"
                  )
                }
              >
                Beauty & Wellness
              </div>

              <div
                onClick={() =>
                  handleCommandClick(
                    "/explore/mehndi"
                  )
                }
              >
                Mehndi & Bridal
              </div>

              <div
                onClick={() =>
                  handleCommandClick(
                    "/explore/fashion"
                  )
                }
              >
                Fashion
              </div>

              <div
                onClick={() =>
                  handleCommandClick(
                    "/explore/yoga"
                  )
                }
              >
                Yoga & Fitness
              </div>

              <div
                onClick={() =>
                  handleCommandClick(
                    "/explore/education"
                  )
                }
              >
                Education
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CINEMATIC LOGO ANIMATION
      ===================================================== */}
      <LogoRevealOverlay
        visible={showLogoAnim}
        onClose={
          handleLogoAnimationClose
        }
      />
    </>
  );
};

export default Header;