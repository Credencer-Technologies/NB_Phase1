import { useState } from "react";
import "./Register.css";

function Register() {

  const role = "user"; 

  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState(1);

  const [providerData, setProviderData] = useState({
    full_name: "",
    phone: "",
    city: "",
    pin_code: "",
    otp_code: "",
    category_id: "",
    service_description: "",
    bio: "",
    id_type: "",
    id_document: null,
  });

  /* ---------------- USER ---------------- */

  if (role === "user") {
    return (
      <div className="user-register-page">

        <div className="left-content">
          <h1>
            Get the
            <span> Services you need</span>
          </h1>

          <p>
            Join NaariBazar to find trusted women entrepreneurs.
          </p>
        </div>

        <div className="register-card">

          <div className="user-icon">👤</div>

          <h2>User Registration</h2>

          <label>Full Name</label>
          <input type="text" />

          <label>Phone Number</label>

          <div className="phone-box">
            <input type="text" />

            <button
              className="otp-btn"
              onClick={() => setOtpSent(true)}
            >
              Send OTP
            </button>
          </div>

          {otpSent && (
            <>
              <label>OTP</label>

              <input
                type="text"
                placeholder="Enter 6 digit OTP"
              />

              <button className="register-btn">
                Verify & Register
              </button>
            </>
          )}

          <p className="login-link">
            Already registered?
            <a href="/login"> Login here</a>
          </p>

        </div>

      </div>
    );
  }

  /* ---------------- PROVIDER ---------------- */

  return (
    <div className="user-register-page">

      {/* LEFT GUIDE */}

      <div className="provider-guide">

        <h2>Become a Service Provider</h2>

        <p>
          Complete all 5 steps to start receiving
          customer enquiries.
        </p>

        <div className="step-list">

          <div className={step >= 1 ? "active-step" : ""}>
            {step > 1 ? "✓" : "1"} Basic Details
          </div>

          <div className={step >= 2 ? "active-step" : ""}>
            {step > 2 ? "✓" : "2"} OTP Verification
          </div>

          <div className={step >= 3 ? "active-step" : ""}>
            {step > 3 ? "✓" : "3"} Service Details
          </div>

          <div className={step >= 4 ? "active-step" : ""}>
            {step > 4 ? "✓" : "4"} Identity Verification
          </div>

          <div className={step >= 5 ? "active-step" : ""}>
            5 Confirmation
          </div>

        </div>

      </div>

      {/* CARD */}

      <div className="register-card provider-card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${step * 20}%` }}
          ></div>
        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <>
            <h2>Basic Details</h2>

            <input placeholder="Full Name" />
            <input placeholder="Phone Number" />
            <input placeholder="City" />
            <input placeholder="PIN Code" />
          </>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <>
            <h2>OTP Verification</h2>

            <input placeholder="Enter OTP" />

            <button className="otp-btn">
              Verify OTP
            </button>

            <p className="resend-link">
              Resend OTP
            </p>
          </>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <>
            <h2>Service Details</h2>

            <select>
              <option>Select Category</option>
              <option>Beauty & Salon</option>
              <option>Photography</option>
              <option>Tailoring</option>
              <option>Mehendi Artist</option>
              <option>Home Food</option>
              <option>Handicrafts</option>
              <option>Tutoring</option>
              <option>Event Decoration</option>
            </select>

            <textarea
              placeholder="Service Description"
            ></textarea>

            <textarea
              maxLength="200"
              placeholder="Bio"
            ></textarea>
          </>
        )}

        {/* STEP 4 */}

        {step === 4 && (
          <>
            <h2>Identity Verification</h2>

            <select>
              <option>Select ID Type</option>
              <option>Aadhaar</option>
              <option>PAN Card</option>
              <option>Voter ID</option>
            </select>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
            />
          </>
        )}

        {/* STEP 5 */}

        {step === 5 && (
          <>
            <h2>Confirmation</h2>

            <div className="summary-box">
              <p>Name</p>
              <p>Phone</p>
              <p>City</p>
              <p>Category</p>
              <p>ID Uploaded ✓</p>
            </div>

            <p>
              Your registration has been submitted.
              Our team will review and approve
              your profile within 24–48 hours.
            </p>

            <button className="register-btn">
              Go To Login
            </button>
          </>
        )}

        {step < 5 && (
          <div className="navigation-buttons">

            {step > 1 && (
              <button
                className="otp-btn"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </button>
            )}

            <button
              className="register-btn"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Register;