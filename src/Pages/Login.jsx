import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const location = useLocation();
  const [showRegisterCard, setShowRegisterCard] = useState(
    location.state?.openRegister === true
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  // Static admin credentials for your team/demo login.
  const ADMIN_EMAIL = "info@naribazar.in";
  const ADMIN_PASSWORD = "594867";

  const isAdminEmail =
    email.trim().toLowerCase() === ADMIN_EMAIL;

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleAdminLogin = () => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== ADMIN_EMAIL) {
      alert("Invalid admin email.");
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      alert("Invalid admin password.");
      return;
    }

    localStorage.clear();

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "admin");
    localStorage.setItem("email", ADMIN_EMAIL);
    localStorage.setItem("full_name", "NariBazar Admin");

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "admin",
        full_name: "NariBazar Admin",
        email: ADMIN_EMAIL,
        role: "admin",
      })
    );

    window.dispatchEvent(new Event("authChange"));

    alert("Admin Login Successful");

    navigate("/admin-dashboard");
  };

  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/send-otp", {
        email: cleanEmail,
      });

      if (response.data.success) {
        setEmail(cleanEmail);
        setOtpSent(true);
      }

      alert(response.data.message || "OTP sent.");
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const cleanOtp = otp.replace(/\D/g, "").slice(0, 6);

    if (cleanOtp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-otp", {
        email,
        otp: cleanOtp,
      });

      const data = response.data || {};

      if (!data.success) {
        alert(data.message || "Login failed.");
        return;
      }

      if (data.role === "unregistered") {
        alert("No account found for this email. Please register first.");
        setShowRegisterCard(true);
        return;
      }

      const role = data.role;
      const userId = data.user_id ?? data.id ?? data.user?.id ?? null;
      const providerId =
        data.provider_id ?? data.id ?? data.provider?.id ?? null;

      const loggedInAccount = {
        ...(data.user || data.provider || {}),
        id: role === "provider" ? providerId : userId,
        user_id: role === "user" ? userId : undefined,
        provider_id: role === "provider" ? providerId : undefined,
        full_name:
          data.full_name ??
          data.user?.full_name ??
          data.provider?.full_name ??
          "",
        email:
          data.email ??
          data.user?.email ??
          data.provider?.email ??
          email,
        phone:
          data.phone ??
          data.user?.phone ??
          data.provider?.phone ??
          "",
        city:
          data.city ??
          data.user?.city ??
          data.provider?.city ??
          "",
        role,
      };

      localStorage.clear();

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role);
      localStorage.setItem("email", loggedInAccount.email || email);
      localStorage.setItem(
        "full_name",
        loggedInAccount.full_name || ""
      );
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInAccount)
      );

      if (role === "provider" && providerId) {
        localStorage.setItem("provider_id", String(providerId));
      }

      if (role === "user" && userId) {
        localStorage.setItem("user_id", String(userId));
      }

      window.dispatchEvent(new Event("authChange"));

      alert("Login Successful");

      navigate(
        role === "provider"
          ? "/provider-dashboard"
          : "/user-dashboard"
      );
    } catch (error) {
      console.error("Login error:", error);
      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-card">
        <div className="login-avatar">
          <img src="/image/logo2.jpeg" alt="NariBazar" />
        </div>

        {!showRegisterCard ? (
          <>
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>
                Access your NariBazar account and continue exploring
                services and opportunities.
              </p>
            </div>

            <div className="field-label">Email Address</div>

            <div className="input-box email-entry-box">
              <span className="login-field-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setPassword("");
                  setOtp("");
                  setOtpSent(false);
                }}
              />
            </div>

            {isAdminEmail ? (
              <>
                <div className="field-label">
                  Admin Password
                </div>

                <div className="input-box">
                  <span
                    className="login-field-icon"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      <circle cx="12" cy="15" r="1" />
                    </svg>
                  </span>

                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAdminLogin();
                      }
                    }}
                  />
                </div>

                <button
                  className="main-btn"
                  onClick={handleAdminLogin}
                >
                  Login as Admin
                </button>
              </>
            ) : (
              <>
                <button
                  className="otp-btn"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                {otpSent && (
                  <>
                    <div className="input-box otp-entry-box">
                      <span
                        className="login-field-icon"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="5"
                            y="10"
                            width="14"
                            height="10"
                            rx="2"
                          />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                          <circle cx="12" cy="15" r="1" />
                        </svg>
                      </span>

                      <input
                        className="login-otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                      />
                    </div>

                    <div className="login-options">
                      <label>
                        <input type="checkbox" />
                        Remember Me
                      </label>
                    </div>

                    <button
                      className="main-btn"
                      onClick={handleLogin}
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                  </>
                )}
              </>
            )}

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="switch-link">
              New to NariBazar?{" "}
              <span onClick={() => setShowRegisterCard(true)}>
                Register Now
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="login-header">
              <h2>Create Account</h2>
              <p>Select how you want to join NariBazar</p>
            </div>

            <div className="register-options">
              <div
                className="register-option-card"
                onClick={() => navigate("/register?role=user")}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>

                <h4>User Registration</h4>
              </div>

              <div
                className="register-option-card"
                onClick={() => navigate("/register?role=provider")}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9a4 4 0 0 0 0 8h8a4 4 0 0 1 0 8H7" />
                </svg>

                <h4>Service Provider</h4>
              </div>
            </div>

            <p className="switch-link">
              Already have an account?{" "}
              <span onClick={() => setShowRegisterCard(false)}>
                Login Here
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;