import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

// ---------------------------------------------------------------------
// Backend-connected registration build.
// Email OTP send/verify, user/provider registration, file uploads,
// service creation, portfolio uploads and offers are connected to the
// FastAPI backend through ../services/api.
// ---------------------------------------------------------------------

// Static replacement for the /categories/ API response.
const STATIC_CATEGORIES = [
  { id: 1, name: "Beauty & Wellness" },
  { id: 2, name: "Mehendi & Bridal" },
  { id: 3, name: "Tailoring & Fashion" },
  { id: 4, name: "Food & Catering" },
  { id: 5, name: "Education & Tutoring" },
  { id: 6, name: "Yoga & Fitness" },
  { id: 7, name: "Home Services" },
  { id: 8, name: "Arts & Crafts" },
  { id: 9, name: "Hospitality" },
  { id: 10, name: "Others" },
];


const sortCategoriesWithOthersLast = (items = []) => {
  return [...items].sort((a, b) => {
    const aName = String(a?.name || "").trim();
    const bName = String(b?.name || "").trim();

    const aIsOthers = aName.toLowerCase() === "others";
    const bIsOthers = bName.toLowerCase() === "others";

    if (aIsOthers && !bIsOthers) return 1;
    if (!aIsOthers && bIsOthers) return -1;

    return aName.localeCompare(bName, undefined, {
      sensitivity: "base",
    });
  });
};

function Register() {
  const [showConfirmPopup, setShowConfirmPopup] =
    useState(false);

  const [previewModal, setPreviewModal] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role] = useState(
    searchParams.get("role") === "provider"
      ? "provider"
      : "user"
  );

  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState(1);

  const [otpStage, setOtpStage] = useState("idle");

  const [userOtpStage, setUserOtpStage] = useState("idle");

  const [packages, setPackages] = useState([
    {
      package_title: "",
      min_price: "",
      max_price: "",
    },
  ]);

  const [activeTab, setActiveTab] = useState("info");

  // ---------------- INPUT SANITIZERS ----------------

  const onlyAlpha = (value) =>
    value.replace(/[^a-zA-Z\s]/g, "");

  const onlyDigits = (value) =>
    value.replace(/\D/g, "");

  const onlyAlphaNumeric = (value) =>
    value.replace(/[^a-zA-Z0-9\s]/g, "");

  const maskEmail = (email) => {
    const [local, domain] = email.split("@");

    if (!local || !domain) return email;

    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }

    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // ---------------- USER DATA ----------------

  const [userData, setUserData] = useState({
    full_name: "",
    phone: "",
    email: "",
    otp: "",
  });

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [categories, setCategories] =
    useState(sortCategoriesWithOthersLast(STATIC_CATEGORIES));

  // ---------------- PROVIDER DATA ----------------

  const [providerData, setProviderData] =
    useState({
      full_name: "",
      phone: "",
      email: "",
      city: "",
      pincode: "",

      otp_code: "",

      category: "",

      branch_title: "",
      service_bio: "",

      cover_image: null,
      portfolio_images: [],

      id_type: "",
      id_document: null,
    });

  // ---------------- ERROR / TOUCHED TRACKING ----------------

  const [touched, setTouched] = useState({});
  const [triedNext, setTriedNext] =
    useState({});

  const markTouched = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

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

  // ==================================================================
  // VALIDATION HELPERS
  // ==================================================================

  const isOtpValid = (otp) =>
    /^\d{6}$/.test(otp.trim());

  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );

  const isPincodeValid = (pincode) =>
    /^\d{6}$/.test(pincode.trim());

  // ---- USER FLOW ----

  const userStep1Errors = () => {
    const errs = {};

    if (!userData.full_name.trim()) {
      errs.full_name =
        "Full name is mandatory";
    }

    if (!userData.email.trim()) {
      errs.email =
        "Email address is mandatory";
    } else if (
      !isEmailValid(userData.email)
    ) {
      errs.email =
        "Enter a valid email address";
    }

    return errs;
  };

  const userOtpErrors = () => {
    const errs = {};

    if (!userData.otp.trim()) {
      errs.otp = "OTP is mandatory";
    } else if (
      !isOtpValid(userData.otp)
    ) {
      errs.otp =
        "Enter a valid 6-digit OTP";
    }

    return errs;
  };

  const isUserBasicValid =
    Object.keys(userStep1Errors()).length ===
    0;

  // ---- PROVIDER FLOW ----

  const step1Errors = () => {
    const errs = {};

    if (!providerData.full_name.trim()) {
      errs.full_name =
        "Full name is mandatory";
    }

    if (!providerData.email.trim()) {
      errs.email =
        "Email address is mandatory";
    } else if (
      !isEmailValid(providerData.email)
    ) {
      errs.email =
        "Enter a valid email address";
    }

    if (!providerData.city.trim()) {
      errs.city = "City is mandatory";
    }

    if (!providerData.pincode.trim()) {
      errs.pincode =
        "Pincode is mandatory";
    } else if (
      !isPincodeValid(
        providerData.pincode
      )
    ) {
      errs.pincode =
        "Enter a valid 6-digit pincode";
    }

    return errs;
  };

  const step2Errors = () => {
    const errs = {};

    if (!otpVerified) {
      errs.otp_code =
        "OTP verification is mandatory";
    }

    return errs;
  };

  const step3Errors = () => {
    const errs = {};

    if (!providerData.category) {
      errs.category =
        "Category is mandatory";
    }

    if (!providerData.cover_image) {
      errs.cover_image =
        "Service profile image is mandatory";
    }

    if (
      !providerData.branch_title.trim()
    ) {
      errs.branch_title =
        "Service title is mandatory";
    }

    if (
      !providerData.service_bio.trim()
    ) {
      errs.service_bio =
        "Service description is mandatory";
    }

    if (
      !providerData.portfolio_images ||
      providerData.portfolio_images
        .length === 0
    ) {
      errs.portfolio_images =
        "At least one portfolio sample is mandatory";
    }

    packages.forEach((pkg, index) => {
      if (!pkg.package_title.trim()) {
        errs[`pkg_title_${index}`] =
          "Package title is mandatory";
      }

      if (!pkg.min_price) {
        errs[`pkg_min_${index}`] =
          "Min price is mandatory";
      }

      if (!pkg.max_price) {
        errs[`pkg_max_${index}`] =
          "Max price is mandatory";
      }

      if (
        pkg.min_price &&
        pkg.max_price &&
        Number(pkg.min_price) >
          Number(pkg.max_price)
      ) {
        errs[`pkg_range_${index}`] =
          "Min price cannot exceed max price";
      }
    });

    return errs;
  };

  const step4Errors = () => {
    const errs = {};

    if (!providerData.id_type) {
      errs.id_type =
        "ID type is mandatory";
    }

    if (!providerData.id_document) {
      errs.id_document =
        "ID document upload is mandatory";
    }

    return errs;
  };

  const getStepErrors = (stepNum) => {
    if (stepNum === 1)
      return step1Errors();

    if (stepNum === 2)
      return step2Errors();

    if (stepNum === 3)
      return step3Errors();

    if (stepNum === 4)
      return step4Errors();

    return {};
  };

  const isStepValid = (stepNum) =>
    Object.keys(
      getStepErrors(stepNum)
    ).length === 0;

  const shouldShowError = (field) =>
    touched[field] ||
    triedNext[step];

  const handleNextClick = (
    currentStep
  ) => {
    if (isStepValid(currentStep)) {
      setStep(currentStep + 1);

      setTriedNext((prev) => ({
        ...prev,
        [currentStep]: false,
      }));
    } else {
      setTriedNext((prev) => ({
        ...prev,
        [currentStep]: true,
      }));
    }
  };

  // ---------------- PREVIEW ----------------

  const openPreview = (kind) => {
    if (kind === "cover") {
      if (!providerData.cover_image)
        return;

      setPreviewModal({
        title: "Cover Image",
        kind: "image",
        urls: [
          URL.createObjectURL(
            providerData.cover_image
          ),
        ],
      });
    } else if (
      kind === "portfolio"
    ) {
      if (
        !providerData.portfolio_images
          .length
      )
        return;

      setPreviewModal({
        title: "Portfolio Samples",
        kind: "gallery",
        urls:
          providerData.portfolio_images.map(
            (f) =>
              URL.createObjectURL(f)
          ),
      });
    } else if (
      kind === "document"
    ) {
      if (!providerData.id_document)
        return;

      const isPdf =
        providerData.id_document.type ===
        "application/pdf";

      const rawUrl =
        URL.createObjectURL(
          providerData.id_document
        );

      setPreviewModal({
        title: `${
          providerData.id_type || "ID"
        } Document`,
        kind: isPdf
          ? "pdf"
          : "image",
        urls: [
          isPdf
            ? `${rawUrl}#toolbar=0&navpanes=0&scrollbar=0`
            : rawUrl,
        ],
      });
    }
  };

  const [showModal, setShowModal] =
    useState(false);

  const [
    modalMessage,
    setModalMessage,
  ] = useState("");

  const [otpTimer, setOtpTimer] =
    useState(0);

  const formatOtpTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (seconds === 0) {
      return `${minutes} mnts`;
    }

    return `${minutes} mnts ${seconds} secs`;
  };

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let interval;

    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(
          (prev) => prev - 1
        );
      }, 1000);
    }

    return () =>
      clearInterval(interval);
  }, [otpTimer]);

  // Load categories from backend so categories added by admin
  // are reflected in provider registration.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(
          "/categories/"
        );

        const raw =
          response.data?.data ??
          response.data;

        if (
          Array.isArray(raw) &&
          raw.length > 0
        ) {
          setCategories(sortCategoriesWithOthersLast(raw));
        }
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );

        // Keep STATIC_CATEGORIES as a safe UI fallback.
      }
    };

    loadCategories();
  }, []);

  // Upload one file using the backend /api/v1/upload endpoint.
  const uploadFile = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    const url = response.data?.url;

    if (!url) {
      throw new Error(
        "Upload succeeded but file URL was not returned."
      );
    }

    return url;
  };

  // USER OTP

  const handleUserSendOtp = async () => {
    if (!isUserBasicValid) {
      setTouched((prev) => ({
        ...prev,
        full_name: true,
        email: true,
      }));

      return;
    }

    const cleanEmail =
      userData.email.trim().toLowerCase();

    try {
      const response = await api.post(
        "/auth/send-otp",
        {
          email: cleanEmail,
        }
      );

      const data = response.data || {};

      if (!data.success) {
        alert(
          data.message ||
            "Unable to send OTP."
        );
        return;
      }

      setUserData((prev) => ({
        ...prev,
        email: cleanEmail,
        otp: "",
      }));

      setOtpSent(true);
      setUserOtpStage("sent");
      setOtpTimer(300);

      setModalMessage(
        "OTP sent to your email successfully."
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "User OTP send error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to send OTP."
      );
    }
  };

  const handleUserResendOtp = async () => {
    if (otpTimer > 0) return;

    const cleanEmail =
      userData.email.trim().toLowerCase();

    if (!isEmailValid(cleanEmail)) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      const response = await api.post(
        "/auth/send-otp",
        {
          email: cleanEmail,
        }
      );

      const data = response.data || {};

      if (!data.success) {
        alert(
          data.message ||
            "Unable to resend OTP."
        );
        return;
      }

      setUserData((prev) => ({
        ...prev,
        otp: "",
      }));

      setUserOtpStage("sent");
      setOtpTimer(300);

      setModalMessage(
        "A new OTP was sent to your email."
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "User OTP resend error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to resend OTP."
      );
    }
  };

  const handleUserRegister = async () => {
    const errs = userOtpErrors();

    if (
      Object.keys(errs).length > 0
    ) {
      setTouched((prev) => ({
        ...prev,
        otp: true,
      }));

      return;
    }

    const cleanEmail =
      userData.email.trim().toLowerCase();

    const cleanOtp =
      userData.otp
        .replace(/\D/g, "")
        .slice(0, 6);

    try {
      const verifyResponse =
        await api.post(
          "/auth/verify-otp",
          {
            email: cleanEmail,
            otp: cleanOtp,
          }
        );

      const verifyData =
        verifyResponse.data || {};

      if (!verifyData.success) {
        alert(
          verifyData.message ||
            "Invalid OTP."
        );
        return;
      }

      if (
        verifyData.role === "user" ||
        verifyData.role === "provider"
      ) {
        alert(
          "An account already exists with this email. Please login."
        );
        navigate("/login");
        return;
      }

      const registerResponse =
        await api.post(
          "/users/register",
          {
            full_name:
              userData.full_name.trim(),
              phone: userData.phone.trim(),
            email: cleanEmail,
          }
        );

      const registerData =
        registerResponse.data || {};

      if (
        registerData.success === false
      ) {
        alert(
          registerData.message ||
            "Unable to register."
        );
        return;
      }

      setUserOtpStage("verified");

      alert(
        "Registration Successful 🎉"
      );

      navigate("/login");
    } catch (error) {
      console.error(
        "User registration error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : error.response?.data
              ?.message ||
            "Registration failed."
      );
    }
  };

  // PROVIDER OTP

  const handleSendOtp = async () => {
    const cleanEmail =
      providerData.email
        .trim()
        .toLowerCase();

    if (!isEmailValid(cleanEmail)) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      const response = await api.post(
        "/auth/send-otp",
        {
          email: cleanEmail,
        }
      );

      const data = response.data || {};

      if (!data.success) {
        alert(
          data.message ||
            "Unable to send OTP."
        );
        return;
      }

      setProviderData((prev) => ({
        ...prev,
        email: cleanEmail,
        otp_code: "",
      }));

      setOtpVerified(false);
      setOtpStage("sent");
      setOtpTimer(300);

      setModalMessage(
        "OTP sent to your email successfully."
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "Provider OTP send error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to send OTP."
      );
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    const cleanEmail =
      providerData.email
        .trim()
        .toLowerCase();

    if (!isEmailValid(cleanEmail)) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      const response = await api.post(
        "/auth/send-otp",
        {
          email: cleanEmail,
        }
      );

      const data = response.data || {};

      if (!data.success) {
        alert(
          data.message ||
            "Unable to resend OTP."
        );
        return;
      }

      setProviderData((prev) => ({
        ...prev,
        otp_code: "",
      }));

      setOtpVerified(false);
      setOtpStage("sent");
      setOtpTimer(300);

      setModalMessage(
        "A new OTP was sent to your email."
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "Provider OTP resend error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to resend OTP."
      );
    }
  };

  const handleVerifyOtp = async () => {
    const cleanEmail =
      providerData.email
        .trim()
        .toLowerCase();

    const cleanOtp =
      providerData.otp_code
        .replace(/\D/g, "")
        .slice(0, 6);

    if (cleanOtp.length !== 6) {
      alert(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    try {
      const response = await api.post(
        "/auth/verify-otp",
        {
          email: cleanEmail,
          otp: cleanOtp,
        }
      );

      const data = response.data || {};

      if (!data.success) {
        setOtpVerified(false);

        alert(
          data.message ||
            "Invalid OTP."
        );
        return;
      }

      if (
        data.role === "user" ||
        data.role === "provider"
      ) {
        setOtpVerified(false);

        alert(
          "An account already exists with this email. Please login."
        );
        return;
      }

      setOtpVerified(true);
      setOtpStage("verified");

      setModalMessage(
        "Email is Verified"
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "Provider OTP verify error:",
        error
      );

      setOtpVerified(false);

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to verify OTP."
      );
    }
  };

  // Complete provider registration:
  // 1. Upload cover image + ID document + portfolio images.
  // 2. Create provider.
  // 3. Create service.
  // 4. Save portfolio rows for the created service.
  // 5. Save package/offers for the created service.
  const handleProviderSubmit = async () => {
    if (submitting) return;

    if (!otpVerified) {
      alert(
        "Please verify your email OTP first."
      );
      return;
    }

    setSubmitting(true);

    try {
      const cleanEmail =
        providerData.email
          .trim()
          .toLowerCase();

      const categoryId = Number(
        providerData.category
      );

      if (!categoryId) {
        throw new Error(
          "Please select a valid category."
        );
      }

      // Upload required provider/service files first.
      const [
        coverImageUrl,
        idDocumentUrl,
      ] = await Promise.all([
        uploadFile(
          providerData.cover_image
        ),
        uploadFile(
          providerData.id_document
        ),
      ]);

      // Upload portfolio files.
      const portfolioUrls = [];

      for (
        const file of
        providerData.portfolio_images
      ) {
        const url =
          await uploadFile(file);

        portfolioUrls.push(url);
      }

      // Create provider.
      const providerResponse =
        await api.post(
          "/providers/register",
          {
            full_name:
              providerData.full_name.trim(),
            phone: null,
            email: cleanEmail,
            city:
              providerData.city.trim(),
            pin_code:
              providerData.pincode.trim(),
            category_id: categoryId,
            bio:
              providerData.service_bio.trim(),
            service_description:
              providerData.service_bio.trim(),
            id_type:
              providerData.id_type,
            id_document_url:
              idDocumentUrl,
            profile_image:
              coverImageUrl,
          }
        );

      const providerId =
        providerResponse.data
          ?.provider_id ??
        providerResponse.data
          ?.provider?.id;

      if (!providerId) {
        throw new Error(
          "Provider was created but provider_id was not returned."
        );
      }

      const selectedCategory =
        categories.find(
          (cat) =>
            Number(cat.id) ===
            categoryId
        );

      // ServiceCreateSchema requires service_name.
      // Use the selected category name as the main service name,
      // while branch_title is stored as custom_service_title.
      const serviceName =
        selectedCategory?.name ||
        providerData.branch_title.trim();

      const serviceResponse =
        await api.post(
          "/services/",
          {
            provider_id:
              Number(providerId),
            category_id:
              categoryId,
            service_name:
              serviceName,
            custom_service_title:
              providerData.branch_title.trim(),
            service_bio:
              providerData.service_bio.trim(),
            service_profile_image:
              coverImageUrl,
            is_item_available: true,
            service_mode: null,
          }
        );

      const serviceId =
        serviceResponse.data?.data?.id;

      if (!serviceId) {
        throw new Error(
          "Service was created but service id was not returned."
        );
      }

      // Save portfolio image records.
      for (
        let index = 0;
        index < portfolioUrls.length;
        index += 1
      ) {
        await api.post(
          "/portfolio/upload",
          {
            service_id:
              Number(serviceId),
            image_url:
              portfolioUrls[index],
            sort_order: index,
          }
        );
      }

      // Save each pricing package as an Offer.
      for (
        const pkg of packages
      ) {
        await api.post(
          "/offers/",
          {
            service_id:
              Number(serviceId),
            offer_name:
              pkg.package_title.trim(),
            price_min:
              Number(pkg.min_price),
            price_max:
              Number(pkg.max_price),
          }
        );
      }

      setShowConfirmPopup(false);

      alert(
        "Registration Submitted Successfully 🎉"
      );

      navigate("/login");
    } catch (error) {
      console.error(
        "Provider registration error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      let message =
        error.response?.data?.message ||
        error.message ||
        "Provider registration failed.";

      if (
        typeof detail === "string"
      ) {
        message = detail;
      } else if (
        Array.isArray(detail)
      ) {
        message = detail
          .map(
            (item) =>
              item?.msg ||
              JSON.stringify(item)
          )
          .join("\n");
      }

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const closePreview = () =>
    setPreviewModal(null);

  const ErrorText = ({ field }) => {
    const errs =
      getStepErrors(step);

    if (!errs[field]) return null;

    if (!shouldShowError(field))
      return null;

    return (
      <p className="field-error">
        {errs[field]}
      </p>
    );
  };

  return (
    <div className="register-container">
      {/* ================= USER ================= */}

      {role === "user" && (
        <div className="user-register-page">
          <div className="left-content">
            <h1>
              Get the{" "}
              <span>
                Services you Need
              </span>
            </h1>

            <p>
              Join NariBazar to
              discover trusted women
              entrepreneurs.
            </p>
          </div>

          <div className="register-card">

  <h2>User Registration</h2>

{/* FULL NAME */}
<div className="input-icon-wrap">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>

  <input
    type="text"
    placeholder="Enter your full name"
    value={userData.full_name}
    autoComplete="name"
    onBlur={() => markTouched("full_name")}
    className={
      (touched.full_name || otpSent) &&
      userStep1Errors().full_name
        ? "input-error"
        : ""
    }
    onChange={(e) =>
      setUserData({
        ...userData,
        full_name: onlyAlpha(e.target.value),
      })
    }
  />

</div>

{(touched.full_name || otpSent) && (
  <p className="field-error">
    {userStep1Errors().full_name}
  </p>
)}


{/* PHONE NUMBER */}
<div className="input-icon-wrap">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
  </svg>

  <input
    type="tel"
    placeholder="Phone Number"
    autoComplete="tel"
    inputMode="numeric"
    maxLength={10}
    value={userData.phone}
    onChange={(e) =>
      setUserData({
        ...userData,
        phone: onlyDigits(e.target.value).slice(0, 10),
      })
    }
  />

</div>


{/* EMAIL */}
<div className="input-icon-wrap">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>

  <input
    type="email"
    placeholder="Enter your email address"
    autoComplete="email"
    value={userData.email}
    onBlur={() => markTouched("email")}
    className={
      (touched.email || otpSent) &&
      userStep1Errors().email
        ? "input-error"
        : ""
    }
    onChange={(e) =>
      setUserData({
        ...userData,
        email: e.target.value.replace(/\s/g, ""),
      })
    }
  />

</div>

{(touched.email || otpSent) && (
  <p className="field-error">
    {userStep1Errors().email}
  </p>
)}

  <div className="otp-step">

  <h2 className="step-heading">
    OTP Verification
  </h2>

  <div className="otp-phone-row">

    <input
      type="text"
      readOnly
      className="masked-phone-input"
      value={
        userData.email
          ? maskEmail(userData.email)
          : ""
      }
    />

    <button
      className="send-otp-small-btn"
      onClick={handleUserSendOtp}
    >
      Send OTP
    </button>

  </div>


  {/* NO LOCK ICON HERE */}
  <input
    type="text"
    maxLength={6}
    inputMode="numeric"
    placeholder="Enter 6-digit OTP"
    value={userData.otp}
    disabled={userOtpStage === "idle"}
    className="otp-input"
    onChange={(e) =>
      setUserData({
        ...userData,
        otp: onlyDigits(e.target.value),
      })
    }
  />


  <button
    className="verify-otp-btn"
    disabled={
      Object.keys(userOtpErrors()).length > 0 ||
      userOtpStage === "verified"
    }
    onClick={handleUserRegister}
  >
    Verify & Register
  </button>

              {userOtpStage !==
                "idle" &&
                userOtpStage !==
                  "verified" && (
                  <p className="resend-link">
                    Didn't get the
                    code?

                    <span
                      onClick={() => {
                        if (
                          otpTimer === 0
                        ) {
                          handleUserResendOtp();
                        }
                      }}
                    >
                      {otpTimer > 0
                         ? ` Resend (${formatOtpTimer(otpTimer)})`
                         : " Resend"}
                    </span>
                  </p>
                )}

              {showModal && (
                <div className="otp-modal-overlay">
                  <div className="otp-modal">
                    <h3>
                      {
                        modalMessage
                      }
                    </h3>

                    <button
                      onClick={() =>
                        setShowModal(
                          false
                        )
                      }
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= PROVIDER ================= */}

      {role === "provider" && (
        <div className="provider-layout">
          <div className="provider-guide">
            <h2>
              Become a Service
              Provider
            </h2>

            <p>
              Complete all steps to
              start receiving
              enquiries.
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
                <span>
                  {step > 1
                    ? "✓"
                    : "1"}
                </span>

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
                <span>
                  {step > 2
                    ? "✓"
                    : "2"}
                </span>

                <p>
                  OTP Verification
                </p>
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
                <span>
                  {step > 3
                    ? "✓"
                    : "3"}
                </span>

                <p>
                  Service Details
                </p>
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
                <span>
                  {step > 4
                    ? "✓"
                    : "4"}
                </span>

                <p>
                  Identity
                  Verification
                </p>
              </div>

              <div
                className={`step-item ${
                  step === 5
                    ? "complete"
                    : ""
                }`}
              >
                <span>
                  {step === 5
                    ? "✓"
                    : "5"}
                </span>

                <p>Confirmation</p>
              </div>
            </div>
          </div>

          <div className="register-card provider-card">
            {/* STEP 1 */}

            {step === 1 && (
              <>
                <h2>Basic Details</h2>


{/* ================= FULL NAME ================= */}

<div className="input-icon-wrap provider-input">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>

  <input
    type="text"
    placeholder="Full Name"
    value={providerData.full_name}

    onBlur={() =>
      markTouched("full_name")
    }

    className={
      shouldShowError("full_name") &&
      step1Errors().full_name
        ? "input-error"
        : ""
    }

    onChange={(e) =>
      setProviderData({
        ...providerData,
        full_name: onlyAlpha(
          e.target.value
        ),
      })
    }
  />

</div>

<ErrorText field="full_name" />


{/* ================= PHONE NUMBER ================= */}

<div className="input-icon-wrap provider-input">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 0 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
  </svg>

  <input
    type="tel"
    placeholder="Phone Number"
    autoComplete="tel"
    inputMode="numeric"
    maxLength={10}
    value={providerData.phone || ""}

    onChange={(e) => {
      const value =
        e.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

      setProviderData({
        ...providerData,
        phone: value,
      });
    }}
  />

</div>

<ErrorText field="phone" />


{/* ================= EMAIL ================= */}

<div className="input-icon-wrap provider-input">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
    />

    <path d="m3 7 9 6 9-6" />
  </svg>

  <input
    type="email"
    placeholder="Email Address"
    autoComplete="email"
    value={providerData.email}

    onBlur={() =>
      markTouched("email")
    }

    className={
      shouldShowError("email") &&
      step1Errors().email
        ? "input-error"
        : ""
    }

    onChange={(e) =>
      setProviderData({
        ...providerData,
        email:
          e.target.value.replace(
            /\s/g,
            ""
          ),
      })
    }
  />

</div>

<ErrorText field="email" />


{/* ================= CITY ================= */}

<div className="input-icon-wrap provider-input">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>

  <input
    type="text"
    placeholder="City"
    value={providerData.city}

    onBlur={() =>
      markTouched("city")
    }

    className={
      shouldShowError("city") &&
      step1Errors().city
        ? "input-error"
        : ""
    }

    onChange={(e) =>
      setProviderData({
        ...providerData,
        city: onlyAlpha(
          e.target.value
        ),
      })
    }
  />

</div>

<ErrorText field="city" />


{/* ================= PINCODE ================= */}

<div className="input-icon-wrap provider-input">

  <svg
    className="input-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 3 8 21" />
    <path d="M16 3 14 21" />
    <path d="M4 9h16" />
    <path d="M3 15h16" />
  </svg>

  <input
    type="text"
    placeholder="Pincode"
    value={providerData.pincode}
    maxLength={6}
    inputMode="numeric"

    onBlur={() =>
      markTouched("pincode")
    }

    className={
      shouldShowError("pincode") &&
      step1Errors().pincode
        ? "input-error"
        : ""
    }

    onChange={(e) =>
      setProviderData({
        ...providerData,
        pincode:
          onlyDigits(
            e.target.value
          ).slice(0, 6),
      })
    }
  />

</div>

<ErrorText field="pincode" />
              </>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <div className="otp-step">
                <h2 className="step-heading">
                  OTP verification
                </h2>

                <div className="otp-phone-row">
                  <input
                    type="text"
                    readOnly
                    className="masked-phone-input"
                    value={maskEmail(
                      providerData.email
                    )}
                  />

                  <button
                    className="send-otp-small-btn"
                    onClick={
                      handleSendOtp
                    }
                  >
                    Send OTP
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={
                    providerData.otp_code
                  }
                  disabled={
                    otpStage === "idle"
                  }
                  className="otp-input"
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      otp_code:
                        e.target.value.replace(
                          /\D/g,
                          ""
                        ),
                    })
                  }
                />

                <button
                  className="verify-otp-btn"
                  disabled={
                    providerData
                      .otp_code.length !==
                      6 ||
                    otpStage ===
                      "verified"
                  }
                  onClick={
                    handleVerifyOtp
                  }
                >
                  Verify OTP
                </button>

                {otpStage !== "idle" &&
                  otpStage !==
                    "verified" && (
                    <p className="resend-link">
                      Didn't get the
                      code?

                      <span
                        onClick={() => {
                          if (
                            otpTimer ===
                            0
                          ) {
                            handleResendOtp();
                          }
                        }}
                      >
                        {otpTimer > 0
                         ? ` Resend (${formatOtpTimer(otpTimer)})`
                         : " Resend"}
                      </span>
                    </p>
                  )}

                {showModal && (
                  <div className="otp-modal-overlay">
                    <div className="otp-modal">
                      <h3>
                        {
                          modalMessage
                        }
                      </h3>

                      <button
                        onClick={() => {
                          setShowModal(
                            false
                          );

                          if (
                            modalMessage ===
                            "Email is Verified"
                          ) {
                            setOtpStage(
                              "verified"
                            );

                            setOtpVerified(
                              true
                            );
                          }
                        }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <div className="service-config-container">
                <h2 className="service-config-heading">
                  Service Offered Group
                  Configuration
                </h2>

                <div className="service-config-scroll">
                  <div className="service-config-row">
                    <div className="service-config-field">
                      <label>
                        Core Trade Skill
                        Classification
                      </label>

                      <select
                        value={
                          providerData.category
                        }
                        onBlur={() =>
                          markTouched(
                            "category"
                          )
                        }
                        className={
                          shouldShowError(
                            "category"
                          ) &&
                          step3Errors()
                            .category
                            ? "input-error"
                            : ""
                        }
                        onChange={(e) =>
                          setProviderData(
                            {
                              ...providerData,
                              category:
                                e
                                  .target
                                  .value,
                            }
                          )
                        }
                      >
                        <option value="">
                          -- Select
                          Category --
                        </option>

                        {categories.map(
                          (cat) => (
                            <option
                              key={
                                cat.id
                              }
                              value={
                                cat.id
                              }
                            >
                              {
                                cat.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      <ErrorText field="category" />
                    </div>

                    <div className="service-config-field">
                      <label>
                        Upload Service
                        Profile Image
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onBlur={() =>
                          markTouched(
                            "cover_image"
                          )
                        }
                        onChange={(e) => {
                          setProviderData(
                            {
                              ...providerData,
                              cover_image:
                                e
                                  .target
                                  .files[0] ||
                                null,
                            }
                          );

                          markTouched(
                            "cover_image"
                          );
                        }}
                      />

                      <ErrorText field="cover_image" />
                    </div>
                  </div>

                  <div className="service-config-field">
                    <label>
                      Specific Service
                      Branch Public Title
                    </label>

                    <input
                      autoComplete="off"
                      type="text"
                      placeholder="e.g. Royal Rajasthani Mehndi Studio"
                      value={
                        providerData.branch_title
                      }
                      onBlur={() =>
                        markTouched(
                          "branch_title"
                        )
                      }
                      className={
                        shouldShowError(
                          "branch_title"
                        ) &&
                        step3Errors()
                          .branch_title
                          ? "input-error"
                          : ""
                      }
                      onChange={(e) =>
                        setProviderData({
                          ...providerData,
                          branch_title:
                            onlyAlphaNumeric(
                              e.target
                                .value
                            ),
                        })
                      }
                    />

                    <ErrorText field="branch_title" />
                  </div>

                  <div className="service-config-field">
                    <label>
                      Detailed Public
                      Service Summary
                      Description / Bio
                    </label>

                    <textarea
                      rows="4"
                      placeholder="Provide unique training parameters or scope specific details..."
                      value={
                        providerData.service_bio
                      }
                      onBlur={() =>
                        markTouched(
                          "service_bio"
                        )
                      }
                      className={
                        shouldShowError(
                          "service_bio"
                        ) &&
                        step3Errors()
                          .service_bio
                          ? "input-error"
                          : ""
                      }
                      onChange={(e) =>
                        setProviderData({
                          ...providerData,
                          service_bio:
                            onlyAlphaNumeric(
                              e.target
                                .value
                            ),
                        })
                      }
                    />

                    <ErrorText field="service_bio" />
                  </div>

                  <div className="service-config-field">
                    <label>
                      Category Portfolio
                      Showcase Samples (
                      {
                        providerData
                          .portfolio_images
                          .length
                      }
                      /12)
                    </label>

                    <div className="portfolio-box">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onBlur={() =>
                          markTouched(
                            "portfolio_images"
                          )
                        }
                        onChange={(e) => {
                          const selected =
                            Array.from(
                              e
                                .target
                                .files
                            );

                          if (
                            selected.length >
                            12
                          ) {
                            alert(
                              "You can upload a maximum of 12 portfolio images. Only the first 12 selected will be kept."
                            );
                          }

                          setProviderData(
                            {
                              ...providerData,
                              portfolio_images:
                                selected.slice(
                                  0,
                                  12
                                ),
                            }
                          );

                          markTouched(
                            "portfolio_images"
                          );
                        }}
                      />
                    </div>

                    <ErrorText field="portfolio_images" />
                  </div>

                  <p className="optional-note">
                    Sub-Offer Packages —
                    add at least one
                    pricing package with a
                    title, min price and max
                    price.
                  </p>

                  {packages.map(
                    (pkg, index) => (
                      <div
                        className="service-config-package"
                        key={index}
                      >
                        <h3>
                          Sub-Offer
                          Package #
                          {index + 1}
                        </h3>

                        <input
                          autoComplete="off"
                          type="text"
                          placeholder="Package Title Name"
                          value={
                            pkg.package_title
                          }
                          onBlur={() =>
                            markTouched(
                              `pkg_title_${index}`
                            )
                          }
                          className={
                            shouldShowError(
                              `pkg_title_${index}`
                            ) &&
                            step3Errors()[
                              `pkg_title_${index}`
                            ]
                              ? "input-error"
                              : ""
                          }
                          onChange={(
                            e
                          ) => {
                            const updated =
                              [
                                ...packages,
                              ];

                            updated[
                              index
                            ].package_title =
                              onlyAlphaNumeric(
                                e
                                  .target
                                  .value
                              );

                            setPackages(
                              updated
                            );
                          }}
                        />

                        <ErrorText
                          field={`pkg_title_${index}`}
                        />

                        <div className="service-config-row">
                          <div>
                            <input
                              autoComplete="off"
                              type="number"
                              placeholder="Min Price"
                              value={
                                pkg.min_price
                              }
                              onBlur={() =>
                                markTouched(
                                  `pkg_min_${index}`
                                )
                              }
                              className={
                                shouldShowError(
                                  `pkg_min_${index}`
                                ) &&
                                step3Errors()[
                                  `pkg_min_${index}`
                                ]
                                  ? "input-error"
                                  : ""
                              }
                              onChange={(
                                e
                              ) => {
                                const updated =
                                  [
                                    ...packages,
                                  ];

                                updated[
                                  index
                                ].min_price =
                                  e.target.value;

                                setPackages(
                                  updated
                                );
                              }}
                            />

                            <ErrorText
                              field={`pkg_min_${index}`}
                            />
                          </div>

                          <div>
                            <input
                              autoComplete="off"
                              type="number"
                              placeholder="Max Price"
                              value={
                                pkg.max_price
                              }
                              onBlur={() =>
                                markTouched(
                                  `pkg_max_${index}`
                                )
                              }
                              className={
                                shouldShowError(
                                  `pkg_max_${index}`
                                ) &&
                                step3Errors()[
                                  `pkg_max_${index}`
                                ]
                                  ? "input-error"
                                  : ""
                              }
                              onChange={(
                                e
                              ) => {
                                const updated =
                                  [
                                    ...packages,
                                  ];

                                updated[
                                  index
                                ].max_price =
                                  e.target.value;

                                setPackages(
                                  updated
                                );
                              }}
                            />

                            <ErrorText
                              field={`pkg_max_${index}`}
                            />
                          </div>
                        </div>

                        <ErrorText
                          field={`pkg_range_${index}`}
                        />
                      </div>
                    )
                  )}

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

            {/* STEP 4 */}

            {step === 4 && (
              <>
                <h2>
                  Identity
                  Verification
                </h2>

                <select
                  value={
                    providerData.id_type
                  }
                  onBlur={() =>
                    markTouched(
                      "id_type"
                    )
                  }
                  className={
                    shouldShowError(
                      "id_type"
                    ) &&
                    step4Errors()
                      .id_type
                      ? "input-error"
                      : ""
                  }
                  onChange={(e) =>
                    setProviderData({
                      ...providerData,
                      id_type:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    -- Select ID Type
                    --
                  </option>

                  <option value="Aadhaar">
                    Aadhaar
                  </option>

                  <option value="PAN Card">
                    PAN Card
                  </option>

                  <option value="Voter ID">
                    Voter ID
                  </option>
                </select>

                <ErrorText field="id_type" />

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onBlur={() =>
                    markTouched(
                      "id_document"
                    )
                  }
                  onChange={(e) => {
                    setProviderData({
                      ...providerData,
                      id_document:
                        e.target
                          .files[0] ||
                        null,
                    });

                    markTouched(
                      "id_document"
                    );
                  }}
                />

                <ErrorText field="id_document" />
              </>
            )}

            {/* STEP 5 */}

            {step === 5 && (
              <div className="confirmation-screen">
                <div className="confirmation-top">
                  <div
                    className="back-arrow"
                    onClick={() =>
                      setStep(4)
                    }
                  >
                    ←
                  </div>
                </div>

                <h2>
                  Registration
                  Submitted
                  Successfully
                </h2>

                <div className="summary-card scrollable-summary">
                  <h3>
                    Service ID Card
                  </h3>

                  <div className="summary-list">
                    <div className="summary-item">
                      <label>
                        NAME
                      </label>

                      <p>
                        {
                          providerData.full_name
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        CONTACT
                      </label>

                      <p>
                        {
                          providerData.email
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        LOCATION
                      </label>

                      <p>
                        {
                          providerData.city
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        PINCODE
                      </label>

                      <p>
                        {
                          providerData.pincode
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        CATEGORY
                      </label>

                      <p>
                        {categories.find(
                          (cat) =>
                            String(
                              cat.id
                            ) ===
                            String(
                              providerData.category
                            )
                        )?.name ||
                          providerData.category}
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        BRANCH TITLE
                      </label>

                      <p>
                        {
                          providerData.branch_title
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        BIO
                      </label>

                      <p>
                        {
                          providerData.service_bio
                        }
                      </p>
                    </div>

                    <div className="summary-item">
                      <label>
                        COVER IMAGE
                      </label>

                      <button
                        className="view-btn"
                        disabled={
                          !providerData.cover_image
                        }
                        onClick={() =>
                          openPreview(
                            "cover"
                          )
                        }
                      >
                        View
                      </button>
                    </div>

                    <div className="summary-item">
                      <label>
                        PORTFOLIO
                      </label>

                      <button
                        className="view-btn"
                        disabled={
                          providerData
                            .portfolio_images
                            .length ===
                          0
                        }
                        onClick={() =>
                          openPreview(
                            "portfolio"
                          )
                        }
                      >
                        View
                      </button>
                    </div>

                    <div className="summary-item">
                      <label>
                        IDENTITY
                      </label>

                      <p>
                        {
                          providerData.id_type
                        }
                      </p>

                      <button
                        className="view-btn"
                        disabled={
                          !providerData.id_document
                        }
                        onClick={() =>
                          openPreview(
                            "document"
                          )
                        }
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                </div>

                <div className="confirmation-buttons">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      setStep(4)
                    }
                  >
                    Edit Information
                  </button>

                  <button
                    className="register-btn"
                    onClick={() =>
                      setShowConfirmPopup(
                        true
                      )
                    }
                  >
                    Confirm & Continue
                  </button>
                </div>

                {showConfirmPopup &&
                  createPortal(
                    <div className="popup-overlay">
                      <div className="confirm-popup">
                        <h3>
                          Are you sure?
                        </h3>

                        <p>
                          Are you sure
                          you want to
                          submit your
                          registration?
                        </p>

                        <div className="popup-buttons">
                          <button
                            className="popup-cancel"
                            onClick={() =>
                              setShowConfirmPopup(
                                false
                              )
                            }
                          >
                            Cancel
                          </button>

                          <button
                            className="popup-confirm"
                            onClick={
                              handleProviderSubmit
                            }
                            disabled={
                              submitting
                            }
                          >
                            {submitting
                              ? "Submitting..."
                              : "Yes, Submit"}
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}

                {previewModal &&
                  createPortal(
                    <div
                      className="popup-overlay"
                      onClick={
                        closePreview
                      }
                    >
                      <div
                        className="preview-modal"
                        onClick={(
                          e
                        ) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="preview-close-btn"
                          onClick={
                            closePreview
                          }
                          aria-label="Close preview"
                        >
                          ✕
                        </button>

                        <h3>
                          {
                            previewModal.title
                          }
                        </h3>

                        <div className="preview-body">
                          {previewModal.kind ===
                            "image" && (
                            <img
                              src={
                                previewModal
                                  .urls[0]
                              }
                              alt={
                                previewModal.title
                              }
                              className="preview-image"
                            />
                          )}

                          {previewModal.kind ===
                            "pdf" && (
                            <iframe
                              src={
                                previewModal
                                  .urls[0]
                              }
                              title={
                                previewModal.title
                              }
                              className="preview-pdf"
                            />
                          )}

                          {previewModal.kind ===
                            "gallery" && (
                            <div className="preview-gallery">
                              {previewModal.urls.map(
                                (
                                  u,
                                  i
                                ) => (
                                  <img
                                    key={
                                      i
                                    }
                                    src={
                                      u
                                    }
                                    alt={`Portfolio sample ${
                                      i +
                                      1
                                    }`}
                                    className="preview-gallery-img"
                                  />
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            )}

            {/* NAVIGATION */}

            {step < 5 && (
              <div className="navigation-buttons">
                {step > 1 && (
                  <button
                    className="register-btn back-btn"
                    onClick={() =>
                      setStep(
                        step - 1
                      )
                    }
                  >
                    Back
                  </button>
                )}

                <button
                  className="register-btn"
                  disabled={
                    step === 2 &&
                    !otpVerified
                  }
                  onClick={() =>
                    handleNextClick(
                      step
                    )
                  }
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