import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Register.css";

function Register() {

  const [showConfirmPopup, setShowConfirmPopup] =
    useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role] = useState(
    searchParams.get("role") === "provider"
      ? "provider"
      : "user"
  );

  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    full_name: "",
    phone: "",
    otp: "",
  });
  const [otpVerified, setOtpVerified] = useState(false);

  const [providerData, setProviderData] = useState({
    full_name: "",
    phone: "",
    city: "",
    pin_code: "",
    otp_code: "",
    category: "",
    service_description: "",
    bio: "",
    id_type: "",
  });

  return (
    <div className="register-container">

      {/* ================= USER ================= */}

      {role === "user" && (
        <div className="user-register-page">

          <div className="left-content">
            <h1>
              Get the <span>Services you Need</span>
            </h1>

            <p>
              Join NaariBazar to discover trusted women entrepreneurs.
            </p>
          </div>

          <div className="register-card">

            <h2>User Registration</h2>

            <label>Full Name</label>
            <input
              type="text"
              value={userData.full_name}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  full_name: e.target.value,
                })
              }
            />

            <label>Phone Number</label>
            <input
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  phone: e.target.value,
                })
              }
            />

            <button
              className="otp-btn"
              onClick={() => setOtpSent(true)}
            >
              Send OTP
            </button>

            {otpSent && (
              <>
                <label>OTP</label>

                <input
                  type="text"
                  value={userData.otp}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      otp: e.target.value,
                    })
                  }
                />

                <button
  className="register-btn"
  onClick={() => {
    alert("Registration Successful 🎉");
    navigate("/login");
  }}
>
  Verify & Register
</button>
              </>
            )}

          </div>

        </div>
      )}

      {/* ================= PROVIDER ================= */}

      {role === "provider" && (
        <div className="provider-layout">

          <div className="provider-guide">

            <h2>Become a Service Provider</h2>

            <p>
              Complete all steps to start receiving enquiries.
            </p>

            <div className="step-list">

              <div
                className={`step-item ${
                  step > 1
                    ? "complete"
                    : step === 1
                    ? "active"
                    : ""
                }`}
              >
                <span>{step > 1 ? "✓" : "1"}</span>
                <p>Basic Details</p>
              </div>

              <div
                className={`step-item ${
                  step > 2
                    ? "complete"
                    : step === 2
                    ? "active"
                    : ""
                }`}
              >
                <span>{step > 2 ? "✓" : "2"}</span>
                <p>OTP Verification</p>
              </div>

              <div
                className={`step-item ${
                  step > 3
                    ? "complete"
                    : step === 3
                    ? "active"
                    : ""
                }`}
              >
                <span>{step > 3 ? "✓" : "3"}</span>
                <p>Service Details</p>
              </div>

              <div
                className={`step-item ${
                  step > 4
                    ? "complete"
                    : step === 4
                    ? "active"
                    : ""
                }`}
              >
                <span>{step > 4 ? "✓" : "4"}</span>
                <p>Identity Verification</p>
              </div>

              <div
                className={`step-item ${
                  step === 5 ? "complete" : ""
                }`}
              >
                <span>{step === 5 ? "✓" : "5"}</span>
                <p>Confirmation</p>
              </div>

            </div>

          </div>

          <div className="register-card provider-card">

            {step === 1 && (
              <>
                <h2>Basic Details</h2>

                <input
                  placeholder="Full Name"
                  value={providerData.full_name}
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      full_name: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Phone Number"
                  value={providerData.phone}
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      phone: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="City"
                  value={providerData.city}
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      city: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="PIN Code"
                  value={providerData.pin_code}
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      pin_code: e.target.value,
                    })
                  }
                />
              </>
            )}

            {step === 2 && (
  <>
    <h2>OTP Verification</h2>

    <p className="otp-info">
      Enter the OTP sent to your phone number.
    </p>

    <input
      type="text"
      maxLength={6}
      placeholder="Enter 6-digit OTP"
      value={providerData.otp_code}
      onChange={(e) =>
        setProviderData({
          ...providerData,
          otp_code: e.target.value,
        })
      }
      className="otp-input"
    />

    <button
  className="register-btn"
  onClick={() => {
    if (providerData.otp_code === "123456") {
      alert("OTP Verified Successfully!");
      setOtpVerified(true);
    } else {
      alert("Invalid OTP. Use 123456");
      setOtpVerified(false);
    }
  }}
>
  Verify OTP
</button>

    <button
      className="resend-btn"
      onClick={() => {
        setProviderData({
          ...providerData,
          otp_code: "",
        });
        alert("OTP Sent Again!");
      }}
    >
      Resend OTP
    </button>
    
    
  </>
)}

            {step === 3 && (
              <>
                <h2>Service Details</h2>

                <select>
                  <option>Select Category</option>
                  <option>Beauty & Wellness</option>
                  <option>Mehendi & Bridal</option>
                  <option>Tailoring & Fashion</option>
                  <option>Food & Catering Artist</option>
                  <option>Education & Tutoring</option>
                  <option>Yoga  Fitness </option>
                
                </select>

                <textarea placeholder="Service Description" />
                <textarea placeholder="Bio" />
              </>
            )}

            {step === 4 && (
              <>
                  <h2>Identity Verification</h2>

                <select>
                  <option>Select ID Type</option>
                  <option>Aadhaar</option>
                  <option>PAN Card</option>
                  <option>Voter ID</option>
                </select>

                <input type="file" />
              </>
            )}

          {step === 5 && (
  <div className="confirmation-screen">

    <div className="confirmation-top">
      <div
        className="back-arrow"
        onClick={() => setStep(4)}
      >
        ←
      </div>
    </div>

    <h2>Registration Submitted Successfully</h2>

    <p className="confirmation-message">
      Thank you for registering as a Service Provider on
      NaariBazar.
    </p>

    <div className="summary-card">

      <h3>Registration Summary</h3>

      {providerData.full_name && (
        <div className="summary-item">
          {providerData.full_name}
        </div>
      )}

      {providerData.phone && (
        <div className="summary-item">
          {providerData.phone}
        </div>
      )}

      {providerData.city && (
        <div className="summary-item">
          {providerData.city}
        </div>
      )}

      {providerData.category && (
        <div className="summary-item">
          {providerData.category}
        </div>
      )}

      <div className="summary-item">
        ID Verification Uploaded
      </div>

    </div>

    <div className="approval-box">

      <h4>Profile Review In Progress</h4>

      <p>
        Your registration has been submitted successfully.
        Our team will review and approve your profile
        within 24 to 48 hours.
      </p>

      <p>
        You will receive an SMS notification once your
        profile is approved.
      </p>

    </div>

    <div className="confirmation-buttons">

      <button
        className="edit-btn"
        onClick={() => setStep(4)}
      >
        Edit Information
      </button>

      <button
        className="register-btn"
        onClick={() => setShowConfirmPopup(true)}
      >
        Confirm & Continue
      </button>

    </div>

    {showConfirmPopup && (
      <div className="popup-overlay">

        <div className="confirm-popup">

          <h3>Are you sure?</h3>

          <p>
            Are you sure you want to submit your
            registration?
          </p>

          <div className="popup-buttons">

            <button
              className="popup-cancel"
              onClick={() =>
                setShowConfirmPopup(false)
              }
            >
              Cancel
            </button>

            <button
              className="popup-confirm"
              onClick={() => {
                alert(
                  "Registration Submitted Successfully 🎉"
                );
                navigate("/login");
              }}
            >
              Yes, Submit
            </button>

          </div>

        </div>

      </div>
    )}

  </div>
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
  disabled={step === 2 && !otpVerified}
  onClick={() => setStep(step + 1)}
>
  Next
</button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Register;