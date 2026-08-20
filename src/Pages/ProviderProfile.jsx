import React, { useState, useEffect, useRef } from "react";
import "./ProviderProfile.css";
import api from "../services/api";
import { useParams, useSearchParams } from "react-router-dom";


// 🔴 REMOVED DATABASE_PERSISTED_PROVIDER_ROW (the hardcoded "Mehendi by Sana" /
// +919876543210 seed row). Every profile was reading id/phone/full_name/
// is_available from this single fixed object, so ALL providers showed the
// same WhatsApp number and the same "Available Now" status. The component
// now uses the real fetched `provider` object everywhere instead.

// Maps provider.category_id (from the `providers` table) -> category name
// (from the real `categories` table). Same mapping used in Explore.jsx, so
// category names stay consistent across the app.
const CATEGORY_MAP = {
  1: "Beauty & Wellness",
  2: "Mehndi & Bridal",
  3: "Tailoring & Fashion",
  4: "Food & Catering",
  5: "Education & Tutoring",
  6: "Yoga & Fitness",
  7: "Home Services",
  8: "Arts & Crafts",
  9: "Beauty",
  11: "House Cleaning",
  12: "Yoga Trainer",
  14: "Dance Trainer",
  15: "Bridal Makeup",
  16: "Mehendi Artist",
};

const FRONTEND_UI_DISPLAY_METRICS = {
  // Visual fallback only. Availability is never seeded/hardcoded here.
  profile_image: "/1.jpeg",
};

// 🔴 REMOVED hardcoded SEED_SERVICES_TABLE_ROWS (Bridal Mehndi ₹500-1500, etc.)
// Real services now come from GET /services/provider/:id inside Explore's
// component below. ⚠️ Note: the real `services` table has NO price_min/
// price_max columns (schema: service_name, custom_service_title, service_bio,
// service_profile_image, is_item_available, service_mode) — pricing isn't
// tracked per-service in the backend yet, so it's dropped from the display
// below rather than showing fake numbers.

// 🔴 REMOVED SEED_PORTFOLIO_IMAGES_ROWS (12 hardcoded /1.jpeg../4.jpeg rows,
// all provider_id: 42). This was the main bug the user reported — every
// provider's PORTFOLIO section showed this same fixed set of local images
// instead of that provider's own uploaded work. Portfolio images are now
// fetched per-provider from the backend below (see fetchPortfolio).
// ⚠️ ASSUMPTION: no portfolio endpoint was visible in the files provided, so
// this calls GET /portfolio/provider/:id, matching the existing
// GET /services/provider/:id convention used just below it. If your backend
// route is named differently (e.g. /providers/:id/portfolio or
// /portfolio-images/provider/:id), update the URL in fetchPortfolio to match.


const ProviderProfile = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const selectedServiceId = searchParams.get("service");

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uiExtensions] = useState(FRONTEND_UI_DISPLAY_METRICS);
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Every Explore card sends its service id as:
  // /provider-profile/:providerId?service=:serviceId
  // This keeps one dashboard/provider account while giving each service its
  // own public profile view.
  const selectedService = selectedServiceId
    ? servicesList.find(
        (service) =>
          Number(service.id) === Number(selectedServiceId)
      )
    : servicesList[0];

  const visibleServices = selectedService
    ? [selectedService]
    : [];

  // 🟢 Sub-offer packages (e.g. "Minimal / Finger Design", "Bridal Mehndi
  // Full Hand") belonging to the currently viewed service — the same list
  // shown in the SERVICES OFFERED card above. The review form's "Service
  // Selected" dropdown used to just repeat the single service name (since
  // this page only ever shows one service at a time via ?service=), which
  // gave the visitor nothing meaningful to pick. It now lists the actual
  // packages so a reviewer can say which one they booked.
  const subOfferOptions = selectedService?.offers?.length
    ? selectedService.offers.map((offer) => offer.offer_name)
    : selectedService
    ? [selectedService.custom_service_title || selectedService.service_name]
    : [];

  const categoryName =
    CATEGORY_MAP[
      selectedService?.category_id ||
        provider?.category_id
    ] || "Uncategorized";

  const displayName =
    selectedService?.custom_service_title ||
    selectedService?.service_name ||
    provider?.full_name;

  // 🔴 FIX: portfolioList now starts empty and is populated per-provider by
  // fetchPortfolio() below, instead of always being the hardcoded seed rows.
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [serviceReviewStats, setServiceReviewStats] = useState({
    average_rating: 0,
    total_reviews: 0,
  });

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showCalendarInLine, setShowCalendarInLine] = useState(false); 
  const [showWriteReviewInLine, setShowWriteReviewInLine] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewFormSuccess, setReviewFormSuccess] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);

  // Refs used purely to scroll each panel into view (centered) when it opens — no effect on existing logic below.
  const calendarSectionRef = useRef(null);
  const reviewSectionRef = useRef(null);

  const [reviewForm, setReviewForm] = useState({ author: "", rating: "5", service_tag: "", text: "" });
  const [currentDate, setCurrentDate] = useState(new Date());
  // 🔴 FIX: removed the hardcoded "Priya Rao" / "+919876543210" default values.
  // Every visitor's enquiry form was pre-filled with this same fake customer's
  // name and phone number regardless of who they actually were. The form now
  // starts blank so each visitor enters their own real details.
  const [enquiryFormData, setEnquiryFormData] = useState({ customer_name: "", customer_phone: "", message: "" });

  // --- 📅 READ-ONLY HOURLY AVAILABILITY (mirrors what the provider sets in their Dashboard) ---
  const BUSINESS_HOURS = Array.from({ length: 12 }, (_, i) => i * 2); // 2-hour slots, midnight to midnight (next day)
  const formatHourSlotLabel = (h) => {
    const toClock = (hr) => {
      const normalized = hr % 24;
      const period = normalized >= 12 ? "PM" : "AM";
      const display = normalized % 12 === 0 ? 12 : normalized % 12;
      return `${display}:00 ${period}`;
    };
    return `${toClock(h)} - ${toClock(h + 2)}`;
  };
  const AVAILABILITY_STORAGE_KEY =
    `naaribazar_provider_availability_${provider?.id ?? id}`;

  const [busyHoursMap, setBusyHoursMap] = useState({});
  const [expandedReadOnlyDate, setExpandedReadOnlyDate] = useState(null);

  const loadAvailabilityFromStorage = () => {
    try {
      const stored = localStorage.getItem(AVAILABILITY_STORAGE_KEY);

      if (!stored) {
        setBusyHoursMap({});
        return;
      }

      const parsed = JSON.parse(stored);

      setBusyHoursMap(
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {}
      );
    } catch (error) {
      console.error("Failed to read provider availability:", error);
      setBusyHoursMap({});
    }
  };

  useEffect(() => {
    loadAvailabilityFromStorage();
  }, [provider?.id, id]);

  // Re-read every time the visitor opens the calendar.
  useEffect(() => {
    if (showCalendarInLine) {
      loadAvailabilityFromStorage();
      setExpandedReadOnlyDate(null);
    }
  }, [showCalendarInLine, AVAILABILITY_STORAGE_KEY]);

  // Dynamic same-browser synchronization:
  // 1. "storage" => updates from another browser tab/window.
  // 2. custom event => updates from another route/component in the same SPA.
  useEffect(() => {
    const activeProviderId = Number(provider?.id ?? id);

    const handleStorageChange = (event) => {
      if (event.key !== AVAILABILITY_STORAGE_KEY) return;
      loadAvailabilityFromStorage();
    };

    const handleAvailabilityUpdate = (event) => {
      if (Number(event.detail?.providerId) !== activeProviderId) return;

      const nextMap = event.detail?.map;

      setBusyHoursMap(
        nextMap && typeof nextMap === "object" && !Array.isArray(nextMap)
          ? nextMap
          : {}
      );
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "naaribazar-availability-updated",
      handleAvailabilityUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "naaribazar-availability-updated",
        handleAvailabilityUpdate
      );
    };
  }, [provider?.id, id, AVAILABILITY_STORAGE_KEY]);

  // Center the availability calendar in the viewport whenever it's opened via the "Check Availability" button.
  useEffect(() => {
    if (showCalendarInLine && calendarSectionRef.current) {
      calendarSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showCalendarInLine]);

  // Center the "Write a Review" form in the viewport whenever it's opened via the "Add Review" button.
  useEffect(() => {
    if (showWriteReviewInLine && reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showWriteReviewInLine]);

  // Normalizes availability flags coming back from the API, which can arrive
  // as real booleans, 1/0 integers, or "1"/"0" strings depending on the
  // route (MySQL TINYINT columns often serialize as ints/strings). Matches
  // the same helper used in ProviderDashboard.jsx / Explore.jsx so the
  // "available" concept stays consistent across the app.
  const normalizeAvailabilityFlag = (value, fallback = true) => {
    if (value === true || value === 1 || value === "1") return true;
    if (value === false || value === 0 || value === "0") return false;
    return fallback;
  };

  // 🟢 DYNAMIC STATUS: the hero badge used to read only provider?.is_available,
  // so a provider who paused one specific service (is_item_available = false)
  // still showed "● Available" on every one of their service profile pages.
  // The badge now reflects BOTH:
  //   1) the provider's master availability toggle (providers.is_available)
  //   2) the currently viewed service's own toggle (services.is_item_available)
  // — the same combination Explore.jsx already uses to decide whether a
  // service card is bookable, so the two views can't disagree with each other.
  const isProviderAvailable = normalizeAvailabilityFlag(provider?.is_available);
  const isSelectedServiceAvailable = selectedService
    ? normalizeAvailabilityFlag(selectedService?.is_item_available)
    : true;

  const providerStatusDisplay = (() => {
    // Visitors don't need to know *why* it's unavailable (provider paused
    // everything vs. just this one service) — either way this specific
    // service can't be booked right now, so both cases show the same
    // "Service Paused" label instead of a separate "Provider Offline" one.
    if (!isProviderAvailable || !isSelectedServiceAvailable) {
      return { label: "⏸ Service Paused", className: "layout-status-tag-paused" };
    }
    return { label: "● Available", className: "layout-status-tag-active" };
  })();

  // Keep the review form's "Service Selected" value pointed at a real
  // sub-offer package once the offers have loaded (or fall back to the
  // service name if it has none), instead of leaving it on a stale/blank
  // value from before the offers arrived.
  useEffect(() => {
    if (!subOfferOptions.length) return;
    setReviewForm((previousForm) =>
      subOfferOptions.includes(previousForm.service_tag)
        ? previousForm
        : { ...previousForm, service_tag: subOfferOptions[0] }
    );
  }, [selectedService?.id, subOfferOptions.join("|")]);

  const getDayAvailabilityStatus = (dateString) => {
    const busyHoursForDay = busyHoursMap[dateString] || [];
    if (busyHoursForDay.length === 0) return "available";
    if (busyHoursForDay.length >= BUSINESS_HOURS.length) return "busy";
    return "partial";
  };

  // 🔴 FIX (Issue 1): removed the duplicate fetchProvider definition + its duplicate useEffect.
  // Only one fetchProvider function and one useEffect calling it now remain.
  const fetchProvider = async () => {
    try {
      const response = await api.get(`/providers/${id}`);
      console.log("Provider Data:", response.data);
      console.log("Profile Image:", response.data.profile_image);
      setProvider(response.data);
    } catch (error) {
      console.error("Provider Error:", error);
      alert("Unable to load provider details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [id]);

  // 🟢 REAL DATA: fetch this provider's services from the real `services`
  // table via GET /services/provider/:id, then fetch each service's own
  // Sub-Offer Packages (e.g. "Minimal / Finger Design: ₹100 – ₹200") from
  // GET /offers/service/:id so visitors can see pricing per design/package,
  // not just the service name.
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await api.get(`/services/provider/${id}`);
        const rawServices = response.data || [];

        const withOffers = await Promise.all(
          rawServices.map(async (svc) => {
            try {
              const offersRes = await api.get(`/offers/service/${svc.id}`);
              const offersPayload =
                offersRes.data?.data ?? offersRes.data ?? [];
              return {
                ...svc,
                offers: Array.isArray(offersPayload)
                  ? offersPayload
                  : [],
              };
            } catch (err) {
              console.error(`Error fetching sub-offers for service ${svc.id}:`, err);
              return { ...svc, offers: [] };
            }
          })
        );

        setServicesList(withOffers);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServicesList([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [id]);

  // Load only the portfolio images linked to the selected service.
  // Home Services and Education therefore keep separate galleries even though
  // they belong to the same provider account/dashboard.
  useEffect(() => {
    const fetchPortfolio = async () => {
      setPortfolioLoading(true);

      try {
        if (!selectedServiceId) {
          setPortfolioList([]);
          return;
        }

        const response = await api.get(
          `/portfolio/service/${selectedServiceId}`
        );

        const imagesPayload =
          response.data?.data ||
          response.data ||
          [];

        setPortfolioList(
          Array.isArray(imagesPayload)
            ? imagesPayload
            : []
        );
      } catch (err) {
        console.error(
          `Error fetching portfolio for service ${selectedServiceId}:`,
          err
        );
        setPortfolioList([]);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolio();
  }, [selectedServiceId]);

    

  const loadServiceReviews = async () => {
    if (!selectedServiceId) {
      setReviewsList([]);
      setServiceReviewStats({
        average_rating: 0,
        total_reviews: 0,
      });
      return;
    }

    setReviewsLoading(true);
    setReviewError("");

    try {
      const response = await api.get(
        `/reviews/service/${selectedServiceId}`
      );

      const rawReviews =
        response.data?.data || [];

      const normalized = (
        Array.isArray(rawReviews)
          ? rawReviews
          : []
      ).map((item) => ({
        ...item,
        author:
          item.customer_name ||
          "Guest User",
        text:
          item.review || "",
        service_tag:
          selectedService?.custom_service_title ||
          selectedService?.service_name ||
          "Service",
        date: item.created_at
          ? new Date(
              item.created_at
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Recent",
      }));

      setReviewsList(normalized);

      setServiceReviewStats({
        average_rating: Number(
          response.data?.summary?.average_rating || 0
        ),
        total_reviews: Number(
          response.data?.summary?.total_reviews ||
          normalized.length
        ),
      });
    } catch (error) {
      console.error(
        "Error loading service reviews:",
        error
      );

      setReviewsList([]);
      setServiceReviewStats({
        average_rating: 0,
        total_reviews: 0,
      });
      setReviewError(
        "Unable to load customer reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadServiceReviews();
  }, [selectedServiceId]);


  // Dashboard entries are service-specific. A provider can have multiple services,
  // so selectedService.id is used instead of provider.id.
  const dashboardItemId = selectedService?.id
    ? `service-${selectedService.id}`
    : null;

  useEffect(() => {
    if (!dashboardItemId) {
      setIsAddedToList(false);
      return;
    }

    const dashboardServices = JSON.parse(
      localStorage.getItem("providerDashboardServices") || "[]"
    );

    setIsAddedToList(
      dashboardServices.some((item) => String(item.id) === dashboardItemId)
    );
  }, [dashboardItemId]);

  const toggleSaveProfileToDashboardList = () => {
    if (!provider || !selectedService || !dashboardItemId) {
      alert("Service information is still loading. Please try again.");
      return;
    }

    const dashboardServices = JSON.parse(
      localStorage.getItem("providerDashboardServices") || "[]"
    );

    const existingList = JSON.parse(
      localStorage.getItem("naaribazar_saved_providers") || "[]"
    );

    if (isAddedToList) {
      const updatedDashboardServices = dashboardServices.filter(
        (item) => String(item.id) !== dashboardItemId
      );

      const updatedSavedList = existingList.filter(
        (item) => String(item.id) !== dashboardItemId
      );

      localStorage.setItem(
        "providerDashboardServices",
        JSON.stringify(updatedDashboardServices)
      );
      localStorage.setItem(
        "naaribazar_saved_providers",
        JSON.stringify(updatedSavedList)
      );

      setIsAddedToList(false);
      return;
    }

    const serviceTitle =
      selectedService.custom_service_title ||
      selectedService.service_name ||
      "Service";

    const serviceImage =
      selectedService.service_profile_image ||
      provider.profile_image ||
      uiExtensions.profile_image;

    const rating = Number(serviceReviewStats.average_rating || 0);

    const dashboardItem = {
      id: dashboardItemId,
      service_id: selectedService.id,
      provider_id: provider.id,
      provider_name: provider.full_name || "",
      category_name: categoryName,
      service_name: serviceTitle,
      title: serviceTitle,
      rating,
      ratings_count: Number(serviceReviewStats.total_reviews || 0),
      city: provider.city || "",
      image: serviceImage,
      price: null,
    };

    const profileSummary = {
      ...dashboardItem,
      full_name: provider.full_name || "",
      avg_rating: rating,
      profile_image: serviceImage,
    };

    localStorage.setItem(
      "providerDashboardServices",
      JSON.stringify([
        ...dashboardServices.filter(
          (item) => String(item.id) !== dashboardItemId
        ),
        dashboardItem,
      ])
    );

    localStorage.setItem(
      "naaribazar_saved_providers",
      JSON.stringify([
        ...existingList.filter(
          (item) => String(item.id) !== dashboardItemId
        ),
        profileSummary,
      ])
    );

    setIsAddedToList(true);
  };

  // 🔴 FIX (Issue 3): corrected the WhatsApp deep-link — was "https://whatsapp.com{phone}&text=...",
  // now uses the proper wa.me format: https://wa.me/<phone>?text=<message>
  const triggerWhatsAppMessageSubmit = () => {
    // 🔴 FIX: this used to always send to providerRow.phone (the hardcoded
    // seed number, +919876543210) regardless of which provider's profile
    // was open. Now uses the real fetched provider's phone/name.
    if (!provider?.phone) {
      alert("This provider's phone number isn't available right now.");
      return;
    }
    const rawCleanPhoneString = provider.phone.replace(/[^0-9]/g, "");
    const compiledUrlTextPayload = `Hello ${provider.full_name}, I am contacting you through NaariBazar regarding your services. My Name: ${enquiryFormData.customer_name}.`;
    window.open(
      `https://wa.me/${rawCleanPhoneString}?text=${encodeURIComponent(compiledUrlTextPayload)}`,
      "_blank"
    );
  };

  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const handleCustomerPhoneChange = (e) => {
    // Allow digits only and never allow more than 10 digits.
    const digitsOnly = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setEnquiryFormData((previousData) => ({
      ...previousData,
      customer_phone: digitsOnly,
    }));

    // Clear the validation message once a valid 10-digit number is entered.
    if (digitsOnly.length === 10) {
      setPhoneError("");
    }
  };

  const validateCustomerPhone = () => {
    const isValid =
      /^\d{10}$/.test(enquiryFormData.customer_phone);

    setPhoneError(
      isValid
        ? ""
        : "Give proper phone number"
    );

    return isValid;
  };

  // 🟢 REAL DATA: POSTs to /enquiries.
  // service_id is included so the provider dashboard can keep enquiries
  // separated under the exact service the customer contacted.
  const handleEnquiryFormSubmit = async (e) => {
    e.preventDefault();
    setEnquiryError(null);

    if (!validateCustomerPhone()) {
      return;
    }

    if (!provider?.id || !selectedService?.id) {
      setEnquiryError(
        "Provider or service information is missing. Please refresh and try again."
      );
      return;
    }

    setEnquirySubmitting(true);

    try {
      await api.post("/enquiries/", {
        provider_id: Number(provider.id),
        service_id: Number(selectedService.id),
        user_id: null, // no logged-in user context available on this page yet
        customer_name: enquiryFormData.customer_name,
        customer_phone: enquiryFormData.customer_phone,
        message: enquiryFormData.message,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setEnquiryError("Unable to send your enquiry right now. Please try again.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleReviewFormSubmit = async (e) => {
    e.preventDefault();

    if (!provider?.id || !selectedServiceId) {
      setReviewError(
        "Provider or service information is missing."
      );
      return;
    }

    const customerName =
      reviewForm.author.trim();

    const reviewText =
      reviewForm.text.trim();

    if (!customerName || !reviewText) {
      setReviewError(
        "Please enter your name and review."
      );
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");

    const storedUserId =
      localStorage.getItem("user_id");

    try {
      await api.post("/reviews/", {
        provider_id: Number(provider.id),
        service_id: Number(selectedServiceId),
        user_id: storedUserId
          ? Number(storedUserId)
          : null,
        customer_name: customerName,
        rating: Number(reviewForm.rating),
        review: reviewText,
      });

      await Promise.all([
        loadServiceReviews(),
        fetchProvider(),
      ]);

      setReviewForm({
        author: "",
        rating: "5",
        service_tag: subOfferOptions[0] || "",
        text: "",
      });

      setShowWriteReviewInLine(false);
      setReviewFormSuccess(true);

      setTimeout(
        () => setReviewFormSuccess(false),
        4000
      );
    } catch (error) {
      console.error(
        "Error submitting review:",
        error.response?.data || error
      );

      setReviewError(
        error.response?.data?.detail ||
        "Unable to submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const monthLabel = currentDate.toLocaleString("default", { month: "long" });

  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  const adjustedStartOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const blankCellsArray = Array(adjustedStartOffset).fill(null);
  const calendarDaysArray = Array.from({ length: totalDaysInMonth }, (_, idx) => idx + 1);

  const handlePrevMonth = () => {
    const today = new Date();
    if (year === today.getFullYear() && monthIndex <= today.getMonth()) return; 
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };
  
  const handleNextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

  // Product decision: only scroll/loop the marquee once there are at least
  // 4 real reviews. Below that, the cards are shown once, static, with no
  // animation — looping 1-3 reviews doesn't add anything and the earlier
  // "pad it out and always animate" approach was more complexity than the
  // request called for.
  const MARQUEE_MIN_REVIEWS_TO_SCROLL = 4;
  const shouldLoopReviews = reviewsList.length >= MARQUEE_MIN_REVIEWS_TO_SCROLL;
  const marqueeReviews = shouldLoopReviews
    ? [...reviewsList, ...reviewsList]
    : reviewsList;
  const marqueeDurationSeconds = Math.max(15, reviewsList.length * 4);



if (loading) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Loading Provider...</h2>
    </div>
  );
}

if (!provider) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Provider Not Found</h2>
    </div>
  );
}

  return (
    <div className="layout-profile-container">
      {/* 🚀 THE FIX: A solid layout spacer replacing the cover image to push content down below the sticky nav */}
      <div className="profile-canvas-top-neat-spacer"></div>

      {/* HERO VENDOR DETAILS SYSTEM CARD SECTION (Section 1) */}
      <header className="layout-header-card pristine-top-alignment-card">
        <img
  src={
    selectedService?.service_profile_image ||
    provider?.profile_image ||
    uiExtensions.profile_image
  }
  alt={displayName}
  className="layout-avatar"
/>
        <div className="layout-header-info">
          <div className="layout-name-line">
            <h1>{displayName}</h1>
            {provider?.status === "approved" && <span className="layout-verified-tag">✓ Verified</span>}
          </div>
          <p className="layout-subtitle-txt">{categoryName}</p>
          <p className="layout-location-txt">📍 {provider?.city}</p>
          <div className="layout-metrics-line">
            <span>
              ⭐ {serviceReviewStats.average_rating.toFixed(1)}
              {" "}
              ({serviceReviewStats.total_reviews} Reviews)
            </span>
                        <span className={providerStatusDisplay.className}>{providerStatusDisplay.label}</span>
          </div>
        </div>
        <div className="layout-header-actions hero-stacked-button-group">
          <button type="button" className="check-availability-action-trigger top-hero-stacked-btn" onClick={() => { setShowCalendarInLine(!showCalendarInLine); setShowWriteReviewInLine(false); }}>
            {showCalendarInLine ? "📅 Hide Availability" : "📅 Check Availability"}
          </button>
          <div className="hero-lower-buttons-split-row">
            <button className="layout-send-enq-btn highlighted-action-btn" onClick={() => document.getElementById("contactSectionBlock")?.scrollIntoView({ behavior: "smooth" })}>
              ✉ Send Enquiry
            </button>
            <button className="whatsapp-action-cta-btn" onClick={triggerWhatsAppMessageSubmit}>
              💬 WhatsApp
            </button>
          </div>
          <button 
            type="button" 
            className={`add-to-list-system-trigger-btn ${isAddedToList ? "state-saved-active" : "state-idle-append"}`}
            onClick={toggleSaveProfileToDashboardList}
          >
            {isAddedToList ? "❤️ Saved to Dashboard" : "➕ Add to Dashboard List"}
          </button>
        </div>
      </header>

      {/* ABOUT CARD */}
      <section className="layout-card-block full-width-block profile-about-full-row">
        <h3>ABOUT</h3>
        <p className="layout-body-bio">
          {selectedService?.service_bio || provider?.bio}
        </p>
      </section>

      {/* 📅 IN-LINE AVAILABILITY CALENDAR BLOCK */}
      {showCalendarInLine && (
        <section ref={calendarSectionRef} className="layout-card-block full-width-block inline-calendar-section-wrapper animate-slide-down">
          <div className="inline-calendar-header-row">
            <h3>PROVIDER AVAILABILITY CALENDAR</h3>
            <button type="button" className="inline-calendar-close-btn" onClick={() => setShowCalendarInLine(false)}>✕ Close Calendar</button>
          </div>
          <div className="calendar-centering-container-box">
            <div className="real-calendar-frame-box">
              <div className="calendar-navigation-header">
                <button type="button" className="cal-nav-arrow-btn" onClick={handlePrevMonth}>◀</button>
                <span className="cal-month-title-txt">{monthLabel} {year}</span>
                <button type="button" className="cal-nav-arrow-btn" onClick={handleNextMonth}>▶</button>
              </div>
              <div className="calendar-legend-readonly-row">
                <div className="legend-item"><span className="legend-box legend-box-past-grey"></span><span>Past Date</span></div>
                <div className="legend-item"><span className="legend-box legend-box-avail"></span><span>Available</span></div>
                <div className="legend-item"><span className="legend-box legend-box-partial"></span><span>Partially Busy</span></div>
                <div className="legend-item"><span className="legend-box legend-box-busy"></span><span>Busy</span></div>
              </div>
              <div className="calendar-weekday-labels-row">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="calendar-grid-cells-matrix readonly-calendar">
                {blankCellsArray.map((_, index) => <div key={`empty-${index}`} className="calendar-cell day-blank"></div>)}
                {calendarDaysArray.map((dayNum) => {
                  const dateStringKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  
                  const cellDate = new Date(year, monthIndex, dayNum);
                  const todayDate = new Date();
                  cellDate.setHours(0, 0, 0, 0);
                  todayDate.setHours(0, 0, 0, 0);
                  
                  const isPast = cellDate < todayDate;
                  const dayStatus = getDayAvailabilityStatus(dateStringKey);
                  
                  let statusLabel = dayStatus === "busy" ? "Busy" : dayStatus === "partial" ? "Partially Busy" : "Available";
                  if (isPast) statusLabel = "Completed";

                  return (
                    <div
                      key={dayNum}
                      className={`calendar-cell day-usable ${isPast ? "status-past-grey day-cell-disabled" : `status-${dayStatus}`} ${expandedReadOnlyDate === dateStringKey ? "cell-expanded-active" : ""}`}
                      onClick={() => {
                        if (isPast) return;
                        setExpandedReadOnlyDate(expandedReadOnlyDate === dateStringKey ? null : dateStringKey);
                      }}
                    >
                      <span className="day-number-label">{dayNum}</span>
                      <span className="day-status-indicator-lbl">{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 50/50 MIDDLE COLUMNS LAYOUT SPLIT */}
      <div className="layout-double-columns dynamic-equal-height-grid-wrapper">
        <div className="equal-column-box-cell">
          <section className="layout-card-block dynamic-height-card">
            <h3>SERVICES OFFERED</h3>
            <div className="layout-services-list">
              {servicesLoading && <p>Loading services...</p>}

              {!servicesLoading &&
                visibleServices.every(
                  (service) => !service.offers?.length
                ) && (
                  <p>No services listed yet.</p>
                )}

              {!servicesLoading &&
                visibleServices.flatMap((service) =>
                  (service.offers || []).map((offer) => (
                    <div
                      key={`${service.id}-${offer.id}`}
                      className="layout-service-row"
                    >
                      <span>{offer.offer_name}</span>
                      <strong>
                        ₹{Number(offer.price_min || 0).toLocaleString("en-IN")}
                        {" – ₹"}
                        {Number(offer.price_max || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))
                )}
            </div>
          </section>
        </div>
        <div className="equal-column-box-cell">
          <section className="layout-card-block dynamic-height-card side-portfolio-box-panel mini-portfolio-override">
            <h3>PORTFOLIO</h3>
            {portfolioLoading && <p>Loading portfolio...</p>}

            {!portfolioLoading && portfolioList.length === 0 && (
              <p>No portfolio images uploaded yet.</p>
            )}

            {!portfolioLoading && portfolioList.length > 0 && (
              <div className="layout-portfolio-grid in-column-portfolio-grid mini-grid-sizing">
                {portfolioList.slice(0, 12).map((item, idx) => (
                  <div key={item.id || idx} className="layout-portfolio-item mini-item-card" onClick={() => setLightboxIndex(idx)}>
                    <img
  src={item.image_url}
  alt={`Showcase piece ${idx + 1}`}
  onError={(e) => {
    console.log("Image failed:", item.image_url);
    e.target.style.border = "3px solid red";
  }}
/>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      {/* 🏆 INFINITE LOOP TICKER SCROLLER CUSTOMER REVIEWS BAR ROW */}
      <section className="layout-card-block full-width-block profile-reviews-lower-full-row portfolio-swapped-reviews-container">
        <div className="reviews-section-header-flex-line">
          <h3>CUSTOMER REVIEWS</h3>
          <button type="button" className="add-review-action-trigger-btn" onClick={() => { setShowWriteReviewInLine(!showWriteReviewInLine); setShowCalendarInLine(false); }}>
            {showWriteReviewInLine ? "✕ Close Form" : "+ Add Review"}
          </button>
        </div>
        {reviewFormSuccess && <div className="review-success-popup-toast">🎉 Your review was submitted successfully!</div>}
        
        {reviewsLoading && (
          <p>Loading customer reviews...</p>
        )}

        {!reviewsLoading && reviewError && (
          <p style={{ color: "crimson" }}>
            {reviewError}
          </p>
        )}

        {!reviewsLoading &&
          !reviewError &&
          reviewsList.length === 0 && (
            <p>No customer reviews yet.</p>
          )}

        {!reviewsLoading &&
          reviewsList.length > 0 && (
            <div className="infinity-marquee-scroller-viewport-mask">
              {/* Only scrolls once there are 4+ reviews (see
                  MARQUEE_MIN_REVIEWS_TO_SCROLL above). Fewer than that and
                  the cards are shown once, static, no animation. */}
              <div
                className={`infinity-marquee-scroller-inner-track${
                  shouldLoopReviews ? "" : " marquee-static-no-loop"
                }`}
                style={
                  shouldLoopReviews
                    ? { "--marquee-duration": `${marqueeDurationSeconds}s` }
                    : undefined
                }
              >
                {marqueeReviews.map((review, idx) => (
                  <div
                    key={`review-ticker-${review.id}-${idx}`}
                    className="layout-review-node custom-card-scroller-node marquee-fixed-card"
                  >
                    <div className="layout-rev-header">
                      <div className="review-user-avatar-placeholder global-standard-user-avatar-node">
                        👤
                      </div>

                      <div className="review-meta-author-box">
                        <strong>{review.author}</strong>
                        <span className="service-badge-meta">
                          {review.service_tag}
                        </span>
                      </div>

                      <div className="star-rating-badge-row">
                        {"⭐".repeat(
                          Number(review.rating) || 0
                        )}
                      </div>
                    </div>

                    <p className="review-text-body">
                      "{review.text}"
                    </p>

                    <small className="scroller-card-date-lbl">
                      {review.date || "Recent"}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
      </section>

      {/* IN-LINE WRITE A REVIEW FORM PANEL */}
      {showWriteReviewInLine && (
        <section ref={reviewSectionRef} className="layout-card-block full-width-block inline-review-entry-form-wrapper animate-slide-down standard-page-alignment-form">
          <div className="inline-calendar-header-row">
            <h3>WRITE A CUSTOMER REVIEW</h3>
            <button type="button" className="inline-calendar-close-btn" onClick={() => setShowWriteReviewInLine(false)}>✕ Close Form</button>
          </div>
          <form onSubmit={handleReviewFormSubmit} className="premium-form-layout inline-embedded-review-form-matrix">
            <div className="form-input-split-row complex-three-split-row">
              <div className="form-input-field-node">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your full name" value={reviewForm.author} onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })} required />
              </div>
              <div className="form-input-field-node">
                <label>Rating Score</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>
              <div className="form-input-field-node">
                <label>Service Selected</label>
                <select value={reviewForm.service_tag} onChange={(e) => setReviewForm({ ...reviewForm, service_tag: e.target.value })}>
                  {subOfferOptions.length === 0 && (
                    <option value="">No packages listed</option>
                  )}
                  {subOfferOptions.map((offerName) => (
                    <option key={offerName} value={offerName}>
                      {offerName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-input-field-node">
              <label>Description (Compulsory Review Comments)</label>
              <textarea rows="4" placeholder="Write comments regarding the service received" value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} required></textarea>
            </div>
            {reviewError && (
              <p style={{ color: "crimson" }}>
                {reviewError}
              </p>
            )}

            <div className="inline-form-buttons align-right-row">
              <button
                type="button"
                className="layout-view-all-btn close-inline-form-action-btn"
                onClick={() =>
                  setShowWriteReviewInLine(false)
                }
                disabled={reviewSubmitting}
              >
                ✕ Close Form
              </button>

              <button
                type="submit"
                className="add-review-action-trigger-btn compile-publish-cta-btn"
                disabled={reviewSubmitting}
              >
                {reviewSubmitting
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FULL-WIDTH CONTACT FORM */}
      <section id="contactSectionBlock" className="layout-card-block premium-contact-section">
        <div className="contact-heading-area">
          <h2>CONTACT SECTION</h2>
          <p className="form-helper-meta-desc">Send an enquiry request to lock in your booking slot.</p>
        </div>
        {isSubmitted ? (
          <div className="layout-success-state-banner">✨ Your message has been sent to the provider</div>
        ) : (
          <form onSubmit={handleEnquiryFormSubmit} className="premium-form-layout">
            <div className="form-input-split-row">
              <div className="form-input-field-node"><label>Customer Name</label><input type="text" placeholder="Enter your name" value={enquiryFormData.customer_name} onChange={(e) => setEnquiryFormData({ ...enquiryFormData, customer_name: e.target.value })} required /></div>
              <div className="form-input-field-node">
                <label>Customer Phone</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter your 10-digit phone number"
                  value={enquiryFormData.customer_phone}
                  onChange={handleCustomerPhoneChange}
                  onBlur={() => {
                    if (enquiryFormData.customer_phone.length > 0) {
                      validateCustomerPhone();
                    }
                  }}
                  required
                />
                {phoneError && (
                  <small
                    style={{
                      color: "crimson",
                      marginTop: "2px",
                    }}
                  >
                    {phoneError}
                  </small>
                )}
              </div>
            </div>
            <div className="form-input-field-node">
              <label>Message</label>
              <textarea rows="4" placeholder="Describe your bridal package needs..." value={enquiryFormData.message} onChange={(e) => setEnquiryFormData({ ...enquiryFormData, message: e.target.value })} required></textarea>
            </div>
            {enquiryError && (
              <p style={{ color: "crimson", marginTop: "-8px" }}>{enquiryError}</p>
            )}
            <div className="form-action-footer-row dual-action-row inline-form-buttons">
              <button type="button" className="whatsapp-action-cta-btn" onClick={triggerWhatsAppMessageSubmit}>💬 Contact through WhatsApp</button>
              <button type="submit" className="premium-form-submit-cta-btn" disabled={enquirySubmitting}>
                {enquirySubmitting ? "Sending..." : "Submit Enquiry"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* LIGHTBOX OVERLAY */}
      {lightboxIndex !== null && (
        <div className="layout-lightbox-dimmer-overlay" onClick={() => setLightboxIndex(null)}>
          <button type="button" className="lightbox-close-trigger-x" onClick={() => setLightboxIndex(null)}>×</button>
          <button type="button" className="lightbox-nav-pointer-arrow arrow-left" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>◀</button>
          <div className="lightbox-image-center-frame" onClick={(e) => e.stopPropagation()}>
            <img src={portfolioList?.[lightboxIndex]?.image_url} alt="View" />
          </div>
          <button type="button" className="lightbox-nav-pointer-arrow arrow-right" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>▶</button>
        </div>
      )}

      {/* READ-ONLY HOURLY AVAILABILITY POPUP */}
      {expandedReadOnlyDate && (
        <div className="hourly-popup-overlay" onClick={() => setExpandedReadOnlyDate(null)}>
          <div className="hourly-popup-container" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="hourly-popup-close-x" onClick={() => setExpandedReadOnlyDate(null)}>✕</button>
            <h3 className="hourly-popup-title">
              {new Date(expandedReadOnlyDate + "T00:00:00").toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <p className="hourly-popup-subtext">Hourly availability as set by the provider (read-only).</p>
            <div className="readonly-hourly-slots-grid">
              {BUSINESS_HOURS.map((hour) => {
                const popupCellDate = new Date(expandedReadOnlyDate + "T00:00:00");
                const currentTodayDate = new Date();
                popupCellDate.setHours(0, 0, 0, 0);
                currentTodayDate.setHours(0, 0, 0, 0);
                
                const isCellInPast = popupCellDate < currentTodayDate;
                const isHourBusy = (busyHoursMap[expandedReadOnlyDate] || []).includes(hour);
                
                let hourlySlotClassName = isHourBusy ? "readonly-slot-busy" : "readonly-slot-available";
                let hourlyStatusTextLabel = isHourBusy ? "Busy" : "Available";

                if (isCellInPast) {
                  hourlySlotClassName = "readonly-slot-past-grey";
                  hourlyStatusTextLabel = "Completed";
                }

                return (
                  <div key={hour} className={`readonly-hourly-slot ${hourlySlotClassName}`}>
                    <span>{formatHourSlotLabel(hour)}</span>
                    <span className="readonly-hourly-slot-tag">{hourlyStatusTextLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderProfile;