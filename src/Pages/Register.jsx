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
  const [packages, setPackages] = useState([
  {
    package_title: "",
    min_price: "",
    max_price: "",
  },
]);
  const [activeTab, setActiveTab] = useState('info');
  const [userData, setUserData] = useState({
  full_name: "credencer",
  phone: "1234567890",
  otp: "123456",
});
  const [otpVerified, setOtpVerified] = useState(false);

 const [providerData, setProviderData] = useState({
  full_name: "credencer ",
  phone: "9876543210",
  city: "Hyderabad",
  pin_code: "123456",

  otp_code: "123456",

  category: "Education & Tutoring",

  service_description:
    "Professional tutoring services for school and college students.",

  
  id_type: "Aadhaar",
});
const addPackage = () => {
  setPackages([
    ...packages,
    {
      package_title: "",
      min_price: "",
      max_price: "",
    },
  ]);
};

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
              Join NariBazar to discover trusted women entrepreneurs.
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

    <div className="button-wrap-container">
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
    </div>
  </>
)}

            
{step === 3 && (
  <div className="service-config-container">
    <h2 className="service-config-heading">
       Service Offered Group Configuration
    </h2>

    <div className="service-config-scroll">

      {/* Category + Cover Image */}
      <div className="service-config-row">
        <div className="service-config-field">
          <label>Core Trade Skill Classification</label>
          <select
            value={providerData.category}
            onChange={(e) =>
              setProviderData({
                ...providerData,
                category: e.target.value,
              })
            }
          >
            <option value="">-- Select Category --</option>
            <option value="mehndi">Mehndi & Bridal</option>
            <option value="catering">Food & Catering</option>
            <option value="Beauty">Beauty & Wellness</option>
            <option value="Fashion">Tailoring & Fashion</option>
            <option value="Study">Education & Tutoring</option>
            <option value="Yoga">Yoga & Fitness</option>
            <option value="Home">Home & Services</option>
            <option value="Arts">Arts & Crafts</option>
          </select>
        </div>

        <div className="service-config-field">
          <label> Upload Service Profile Image</label>
          <input
            type="file"
            onChange={(e) =>
              setProviderData({
                ...providerData,
                cover_image: e.target.files[0],
              })
            }
          />
        </div>
      </div>

      {/* Title */}
      <div className="service-config-field">
        <label>Specific Service Branch Public Title</label>
        <input
          autoComplete="off"
          type="text"
          placeholder="e.g. Royal Rajasthani Mehndi Studio"
          value={providerData.branch_title}
          onChange={(e) =>
            setProviderData({
              ...providerData,
              branch_title: e.target.value,
            })
          }
        />
      </div>

      {/* Bio */}
      <div className="service-config-field">
        <label>Detailed Public Service Summary Description / Bio</label>
        <textarea
          rows="4"
          placeholder="Provide unique training parameters or scope specific details..."
          value={providerData.service_bio}
          onChange={(e) =>
            setProviderData({
              ...providerData,
              service_bio: e.target.value,
            })
          }
        />
      </div>

      {/* Portfolio */}
      <div className="service-config-field">
        <label>Category Portfolio Showcase Samples (0/12)</label>

        <div className="portfolio-box">
          <input
            type="file"
            multiple
            onChange={(e) =>
              setProviderData({
                ...providerData,
                portfolio_images: Array.from(e.target.files),
              })
            }
          />
        </div>
      </div>

      {/* Pricing */}
      {packages.map((pkg, index) => (
  <div className="service-config-package" key={index}>
    <h3>Sub-Offer Package #{index + 1}</h3>

    <input
      autoComplete="off"
      type="text"
      placeholder="Package Title Name"
      value={pkg.package_title}
      onChange={(e) => {
        const updated = [...packages];
        updated[index].package_title = e.target.value;
        setPackages(updated);
      }}
    />

    <div className="service-config-row">
      <input
        autoComplete="off"
        type="number"
        placeholder="Min Price"
        value={pkg.min_price}
        onChange={(e) => {
          const updated = [...packages];
          updated[index].min_price = e.target.value;
          setPackages(updated);
        }}
      />

      <input
        autoComplete="off"
        type="number"
        placeholder="Max Price"
        value={pkg.max_price}
        onChange={(e) => {
          const updated = [...packages];
          updated[index].max_price = e.target.value;
          setPackages(updated);
        }}
      />
    </div>
  </div>
  
))}
<button
  type="button"
  className="add-package-btn"
  onClick={addPackage}
>
  + Add Another Package
</button>

      
    </div>
  </div>
)}
{step === 4 && (
  <>
    <h2>Identity Verification</h2>

    <select
      value={providerData.id_type}
      onChange={(e) =>
        setProviderData({
          ...providerData,
          id_type: e.target.value,
        })
      }
    >
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
      <div className="back-arrow" onClick={() => setStep(4)}>←</div>
    </div>

    <h2>Registration Submitted Successfully</h2>
    
    <div className="summary-card scrollable-summary">
      <h3>Service ID Card</h3>

      {/* List of collected data */}
      <div className="summary-list">
        <div className="summary-item"><label>NAME</label><p>{providerData.full_name}</p></div>
        <div className="summary-item"><label>CONTACT</label><p>{providerData.phone}</p></div>
        <div className="summary-item"><label>LOCATION</label><p>{providerData.city}</p></div>
        <div className="summary-item"><label>PIN CODE</label><p>{providerData.pin_code}</p></div>
        <div className="summary-item"><label>CATEGORY</label><p>{providerData.category}</p></div>
        <div className="summary-item"><label>BRANCH TITLE</label><p>{providerData.branch_title}</p></div>
        <div className="summary-item"><label>BIO</label><p>{providerData.service_bio}</p></div>
        
        {/* File/Image Review Section */}
        <div className="summary-item">
          <label>COVER IMAGE</label>
          <button className="view-btn" onClick={() => window.open(URL.createObjectURL(providerData.cover_image))}>View</button>
        </div>

        <div className="summary-item">
          <label>PORTFOLIO</label>
          <button className="view-btn" onClick={() => alert("Reviewing portfolio images...")}>View</button>
        </div>

        <div className="summary-item">
          <label>IDENTITY</label>
          <p>{providerData.id_type}</p>
          <button className="view-btn">View Document</button>
        </div>
      </div>
    </div>

    <div className="confirmation-buttons">
      <button className="edit-btn" onClick={() => setStep(4)}>Edit Information</button>
      <button className="register-btn" onClick={() => setShowConfirmPopup(true)}>Confirm & Continue</button>
    </div>

    {/* Confirmation Popup */}
    {showConfirmPopup && (
      <div className="popup-overlay">
        <div className="confirm-popup">
          <h3>Are you sure?</h3>
          <p>Are you sure you want to submit your registration?</p>
          <div className="popup-buttons">
            <button className="popup-cancel" onClick={() => setShowConfirmPopup(false)}>Cancel</button>
            <button className="popup-confirm" onClick={() => {
              alert("Registration Submitted Successfully 🎉");
              navigate("/login");
            }}>Yes, Submit</button>
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
                    Back
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