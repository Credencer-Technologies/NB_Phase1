import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [showRegisterCard, setShowRegisterCard] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const validPhone = "1234567890";
  const validOtp = "123456";

  const handleLogin = () => {
    if (phone === validPhone && otp === validOtp) {
      alert("Login Successful");
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("storage"));
      navigate("/explore");
    } else {
      alert("Invalid Phone Number or OTP");
    }
  };

  const handleSendOtp = () => {
    if (phone === validPhone) {
      alert("OTP Sent Successfully\nUse OTP: 123456");
    } else {
      alert("Use Demo Number: 1234567890");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-card">

        <div className="login-avatar">
          <img
            src="/image/logo2.jpeg"
            alt="NariBazar"
          />
        </div>

        {!showRegisterCard ? (
          <>
            <div className="login-header">
              <h2>Welcome Back</h2>

              <p>
                Access your NariBazar account and continue
                exploring services and opportunities.
              </p>
            </div>

            <div className="field-label">
              Mobile Number
            </div>

            <div className="input-box">
              <i className="fas fa-phone"></i>

              <input
                type="tel"
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </div>

            <button
              className="otp-btn"
              onClick={handleSendOtp}
            >
              Send OTP
            </button>

            <div className="input-box">
              <i className="fas fa-lock"></i>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
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
            >
              Verify & Login
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="switch-link">
              New to NariBazar?

              <span
                onClick={() =>
                  setShowRegisterCard(true)
                }
              >
                Register Now
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="login-header">
              <h2>Create Account</h2>

              <p>
                Select how you want to join
                NariBazar
              </p>
            </div>

            <div className="register-options">

              <div
                className="register-option-card"
                onClick={() =>
                  navigate("/register?role=user")
                }
              >
                <i className="fas fa-user"></i>

                <h4>User Registration</h4>

              </div>

              <div
                className="register-option-card"
                onClick={() =>
                  navigate("/register?role=provider")
                }
              >
                <i className="fas fa-briefcase"></i>

                <h4>Service Provider</h4>

                
              </div>

            </div>

            <p className="switch-link">
              Already have an account?

              <span
                onClick={() =>
                  setShowRegisterCard(false)
                }
              >
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