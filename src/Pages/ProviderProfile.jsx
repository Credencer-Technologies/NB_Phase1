import React, { useState, useEffect } from "react";
import "./ProviderProfile.css";

// 📋 100% FAITHFUL MATCH TO SECTIONS 4.2 - 4.5 DATABASE SCHEMAS
const DATABASE_PERSISTED_PROVIDER_ROW = {
  id: 42,
  full_name: "Mehndi by Sana",
  phone: "+919876543210", 
  city: "Hyderabad, Telangana",
  pin_code: "500001",
  category_id: 2, 
  bio: "Professional mehndi artist with 5+ years of experience in bridal and traditional mehndi.",
  service_description: "Longer description of bridal packages, intricate Arabic patterns, and heavy festive wedding body styles.",
  id_document_url: "https://naaribazar.com",
  status: "approved", 
  rejection_reason: null,
  is_available: true,
  created_at: "2026-06-11 09:00:00",
  updated_at: "2026-06-25 12:30:00"
};

const FRONTEND_UI_DISPLAY_METRICS = {
  category_name: "Mehndi Artist",
  avg_rating: 4.8, 
  ratings_count: 120, 
  completed_enquiries_count: 24, 
  profile_image: "/1.jpeg",  
  weekly_off_days: [], 
  booked_dates: ["2026-06-18", "2026-06-22", "2026-06-23", "2026-07-04"]
};

const SEED_SERVICES_TABLE_ROWS = [
  { id: 1, provider_id: 42, service_name: "Bridal Mehndi", price_min: 500.00, price_max: 1500.00, created_at: "2026-06-11 09:00:00" },
  { id: 2, provider_id: 42, service_name: "Party Mehndi", price_min: 300.00, price_max: 800.00, created_at: "2026-06-11 09:00:00" },
  { id: 3, provider_id: 42, service_name: "Arabic Mehndi", price_min: 400.00, price_max: 1200.00, created_at: "2026-06-11 09:00:00" }
];

const SEED_PORTFOLIO_IMAGES_ROWS = [
  { id: 101, provider_id: 42, image_url: "/2.jpeg", uploaded_at: "2026-06-11 09:05:00" },
  { id: 102, provider_id: 42, image_url: "/1.jpeg", uploaded_at: "2026-06-11 09:05:00" },
  { id: 103, provider_id: 42, image_url: "/2.jpeg", uploaded_at: "2026-06-11 09:06:00" },
  { id: 104, provider_id: 42, image_url: "/1.jpeg", uploaded_at: "2026-06-11 09:06:00" }
];

const INITIAL_REVIEWS_MOCK_DATA = [
  { id: 1, author: "Priya Sharma", rating: 5, created_at: 1715817600, date: "16 May 2024", service_tag: "Bridal Mehndi", text: "Excellent work! Very professional and beautiful bridal hand designs." },
  { id: 2, author: "Neha Reddy", rating: 5, created_at: 1715301600, date: "10 May 2024", service_tag: "Party Mehndi", text: "Amazing standard party mehndi patterns and very friendly behavior." },
  { id: 3, author: "Kiran Malik", rating: 5, created_at: 1780569600, date: "04 June 2026", service_tag: "Arabic Mehndi", text: "Highly recommended for massive festive marriage functions!" }
];

const ProviderProfile = () => {
  const [providerRow] = useState(DATABASE_PERSISTED_PROVIDER_ROW);
  const [uiExtensions] = useState(FRONTEND_UI_DISPLAY_METRICS);
  const [servicesList] = useState(SEED_SERVICES_TABLE_ROWS);
  const [portfolioList] = useState(SEED_PORTFOLIO_IMAGES_ROWS);
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS_MOCK_DATA);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showCalendarInLine, setShowCalendarInLine] = useState(false); 
  const [showWriteReviewInLine, setShowWriteReviewInLine] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewFormSuccess, setReviewFormSuccess] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);

  const [reviewForm, setReviewForm] = useState({ author: "", rating: "5", service_tag: "Bridal Mehndi", text: "" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [enquiryFormData, setEnquiryFormData] = useState({ customer_name: "Priya Rao", customer_phone: "+919876543210", message: "" });

  useEffect(() => {
    const existingList = JSON.parse(localStorage.getItem("naaribazar_saved_providers") || "[]");
    const isSaved = existingList.some((item) => item.id === providerRow.id);
    setIsAddedToList(isSaved);
  }, [providerRow.id]);

 useEffect(() => {
  const dashboardServices =
    JSON.parse(
      localStorage.getItem("providerDashboardServices")
    ) || [];

  const exists = dashboardServices.some(
    (item) => item.id === providerRow.id
  );

  setIsAddedToList(exists);
}, [providerRow.id]);

const toggleSaveProfileToDashboardList = () => {

  const existingList =
    JSON.parse(
      localStorage.getItem("naaribazar_saved_providers")
    ) || [];

  const dashboardServices =
    JSON.parse(
      localStorage.getItem("providerDashboardServices")
    ) || [];

  if (isAddedToList) {

    // Remove from dashboard services
    const updatedServices = dashboardServices.filter(
      (item) => item.id !== providerRow.id
    );

    localStorage.setItem(
      "providerDashboardServices",
      JSON.stringify(updatedServices)
    );

    // Remove from saved providers
    const updatedList = existingList.filter(
      (item) => item.id !== providerRow.id
    );

    localStorage.setItem(
      "naaribazar_saved_providers",
      JSON.stringify(updatedList)
    );

    setIsAddedToList(false);

  } else {

    const profileSummary = {
      id: providerRow.id,
      full_name: providerRow.full_name,
      category_name: uiExtensions.category_name,
      city: providerRow.city,
      avg_rating: uiExtensions.avg_rating,
      profile_image: uiExtensions.profile_image,
    };

    // Save provider (avoid duplicates)
    if (!existingList.some((item) => item.id === providerRow.id)) {
      existingList.push(profileSummary);

      localStorage.setItem(
        "naaribazar_saved_providers",
        JSON.stringify(existingList)
      );
    }

    // Save dashboard service (avoid duplicates)
    if (!dashboardServices.some((item) => item.id === providerRow.id)) {
      dashboardServices.push({
        id: providerRow.id,
        title: providerRow.full_name,
        category: uiExtensions.category_name,
        city: providerRow.city,
        price: servicesList?.[0]?.price_min || 0,
        image: uiExtensions.profile_image,
      });

      localStorage.setItem(
        "providerDashboardServices",
        JSON.stringify(dashboardServices)
      );
    }

    setIsAddedToList(true);
  }
};

  const handlePrevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? portfolioList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setLightboxIndex((prev) => (prev === portfolioList.length - 1 ? 0 : prev + 1));
  };

  const triggerWhatsAppMessageSubmit = () => {
    const rawCleanPhoneString = providerRow.phone.replace(/[^0-9]/g, ""); 
    const compiledUrlTextPayload = `Hello ${providerRow.full_name}, I am contacting you through NaariBazar regarding your services. My Name: ${enquiryFormData.customer_name}.`;
    window.open(`https://whatsapp.com{rawCleanPhoneString}&text=${encodeURIComponent(compiledUrlTextPayload)}`, "_blank");
  };

  const handleEnquiryFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReviewFormSubmit = (e) => {
    e.preventDefault();
    const freshReviewObj = {
      id: reviewsList.length + 1,
      author: reviewForm.author || "Guest User",
      rating: parseInt(reviewForm.rating),
      created_at: Math.floor(Date.now() / 1000), 
      date: "Today",
      service_tag: reviewForm.service_tag,
      text: reviewForm.text
    };

    setReviewsList([freshReviewObj, ...reviewsList]);
    setReviewForm({ author: "", rating: "5", service_tag: "Bridal Mehndi", text: "" });
    setShowWriteReviewInLine(false);
    setReviewFormSuccess(true);
    setTimeout(() => setReviewFormSuccess(false), 4000);
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

  return (
  <div className="layout-profile-container">
    {/* 🚀 THE FIX: A solid layout spacer replacing the cover image to push content down below the sticky nav */}
    <div className="profile-canvas-top-neat-spacer"></div>

    {/* HERO VENDOR DETAILS SYSTEM CARD SECTION (Section 1) */}
    <header className="layout-header-card pristine-top-alignment-card">
      <img src={uiExtensions.profile_image} alt={providerRow.full_name} className="layout-avatar" />
      {/* ... keeping the rest of the child content elements inside the file exactly the same */}

        <div className="layout-header-info">
          <div className="layout-name-line">
            <h1>{providerRow.full_name}</h1>
            {providerRow.status === "approved" && <span className="layout-verified-tag">✓ Verified</span>}
          </div>
          <p className="layout-subtitle-txt">{uiExtensions.category_name}</p>
          <p className="layout-location-txt">📍 {providerRow.city}</p>
          <div className="layout-metrics-line">
            <span>⭐ {uiExtensions.avg_rating} ({uiExtensions.ratings_count} Reviews)</span>
            <span>💼 {uiExtensions.completed_enquiries_count} Services Completed</span>
            <span className="layout-status-tag-active">{providerRow.is_available ? "● Available Now" : "○ Offline"}</span>
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
        <p className="layout-body-bio">{providerRow.bio}</p>
      </section>
      {/* 📅 IN-LINE AVAILABILITY CALENDAR BLOCK */}
      {showCalendarInLine && (
        <section className="layout-card-block full-width-block inline-calendar-section-wrapper animate-slide-down">
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
              <div className="calendar-weekday-labels-row">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="calendar-grid-cells-matrix readonly-calendar">
                {blankCellsArray.map((_, index) => <div key={`empty-${index}`} className="calendar-cell day-blank"></div>)}
                {calendarDaysArray.map((dayNum) => {
                  const loopDate = new Date(year, monthIndex, dayNum);
                  const weekdayIndex = loopDate.getDay();
                  const formattedDayIndex = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
                  let isClosedDay = uiExtensions.weekly_off_days?.includes(formattedDayIndex);
                  const dateStringKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  if (uiExtensions.booked_dates?.includes(dateStringKey)) isClosedDay = true;
                  return (
                    <div key={dayNum} className={`calendar-cell day-usable ${isClosedDay ? "status-closed" : "status-open"}`}>
                      <span className="day-number-label">{dayNum}</span>
                      <span className="day-status-indicator-lbl">{isClosedDay ? "Unavailable" : "Available"}</span>
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
              {servicesList.map((s) => (
                <div key={s.id} className="layout-service-row">
                  <span>{s.service_name}</span>
                  <strong>₹{s.price_min} - ₹{s.price_max}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="equal-column-box-cell">
          {portfolioList && portfolioList.length > 0 && (
            <section className="layout-card-block dynamic-height-card side-portfolio-box-panel mini-portfolio-override">
              <h3>PORTFOLIO</h3>
              <div className="layout-portfolio-grid in-column-portfolio-grid mini-grid-sizing">
                {portfolioList.slice(0, 8).map((item, idx) => (
                  <div key={item.id || idx} className="layout-portfolio-item mini-item-card" onClick={() => setLightboxIndex(idx)}>
                    <img src={item.image_url} alt={`Showcase piece ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}
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
        
        <div className="infinity-marquee-scroller-viewport-mask">
          <div className="infinity-marquee-scroller-inner-track">
            {[...reviewsList, ...reviewsList].map((review, idx) => (
              <div key={`review-ticker-${review.id}-${idx}`} className="layout-review-node custom-card-scroller-node marquee-fixed-card">
                <div className="layout-rev-header">
                  <div className="review-user-avatar-placeholder global-standard-user-avatar-node">👤</div>
                  <div className="review-meta-author-box">
                    <strong>{review.author}</strong>
                    <span className="service-badge-meta">{review.service_tag}</span>
                  </div>
                  <div className="star-rating-badge-row">{"⭐".repeat(review.rating)}</div>
                </div>
                <p className="review-text-body">"{review.text}"</p>
                <small className="scroller-card-date-lbl">{review.date || "Recent"}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IN-LINE WRITE A REVIEW FORM PANEL */}
      {showWriteReviewInLine && (
        <section className="layout-card-block full-width-block inline-review-entry-form-wrapper animate-slide-down standard-page-alignment-form">
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
                  {servicesList.map((s) => <option key={s.id} value={s.service_name}>{s.service_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-input-field-node">
              <label>Description (Compulsory Review Comments)</label>
              <textarea rows="4" placeholder="Write comments regarding package quality parameters..." value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} required></textarea>
            </div>
            <div className="inline-form-buttons align-right-row">
              <button type="button" className="layout-view-all-btn close-inline-form-action-btn" onClick={() => setShowWriteReviewInLine(false)}>✕ Close Form</button>
              <button type="submit" className="add-review-action-trigger-btn compile-publish-cta-btn">Submit Review</button>
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
          <div className="layout-success-state-banner">✨ Your message has been sent!</div>
        ) : (
          <form onSubmit={handleEnquiryFormSubmit} className="premium-form-layout">
            <div className="form-input-split-row">
              <div className="form-input-field-node"><label>Customer Name</label><input type="text" placeholder="Enter name" value={enquiryFormData.customer_name} onChange={(e) => setEnquiryFormData({ ...enquiryFormData, customer_name: e.target.value })} required /></div>
              <div className="form-input-field-node"><label>Customer Phone</label><input type="text" placeholder="Enter phone" value={enquiryFormData.customer_phone} onChange={(e) => setEnquiryFormData({ ...enquiryFormData, customer_phone: e.target.value })} required /></div>
            </div>
            <div className="form-input-field-node">
              <label>Message</label>
              <textarea rows="4" placeholder="Describe your bridal package needs..." value={enquiryFormData.message} onChange={(e) => setEnquiryFormData({ ...enquiryFormData, message: e.target.value })} required></textarea>
            </div>
            <div className="form-action-footer-row dual-action-row inline-form-buttons">
              <button type="button" className="whatsapp-action-cta-btn" onClick={triggerWhatsAppMessageSubmit}>💬 Contact through WhatsApp</button>
              <button type="submit" className="premium-form-submit-cta-btn">Submit Enquiry</button>
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

    </div>
  );
};

export default ProviderProfile;
