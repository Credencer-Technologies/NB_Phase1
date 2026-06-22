import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [showRegisterCard, setShowRegisterCard] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const validPhone = "9876543210";
  const validOtp = "123456";

  const handleLogin = () => {
    if (phone === validPhone && otp === validOtp) {
      navigate("/explore");
    } else {
      alert("Invalid phone or OTP ❌");
    }
  };

  return (
    <div className="login-page">
      <div className="login-right">

        {!showRegisterCard ? (
          <div className="login-card">

            <h2>Welcome</h2>

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="login-btn" onClick={handleLogin}>
              Verify & Explore
            </button>

            <p>
              New to NaariBazar?{" "}
              <span onClick={() => setShowRegisterCard(true)}>
                Register Now
              </span>
            </p>

          </div>
        ) : (
          <div className="login-card">

            <h2>Register</h2>
            <p>Choose registration type</p>

            <button
              className="register-option"
              onClick={() => navigate("/register?role=user")}
            >
              User Registration
            </button>

            <button
              className="register-option"
              onClick={() => navigate("/register?role=provider")}
            >
              Service Provider Registration
            </button>

            <button
  className="back-login-btn"
  onClick={() => setShowRegisterCard(false)}
>
  Back to Login
</button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Login;