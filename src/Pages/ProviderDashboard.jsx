import React, { useState, useEffect } from 'react';
import './ProviderDashboard.css';

function ProviderDashboard() {
  // --- 1. Core Profile Details State Stack (Table 4.2 Schema Mapping) ---
  const [profileForm, setProfileForm] = useState({
    id: 42,
    full_name: "Ananya Rao",
    phone: "9876543210",
    city: "Hyderabad",
    pin_code: "500016",
    category_id: 2, 
    bio: "Professional mehendi artist.", 
    service_description: "Specializing in heavy traditional bridal work fusions.",
    id_document_url: "/id_proof.jpg",
    status: "approved", 
    rejection_reason: "The uploaded identification document copy was blurry and unreadable. Please upload a clear digital snapshot.",
    is_available: true
  });
  const [tempProfileForm, setTempProfileForm] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- 2. Dynamic Repositories Data Arrays (Tables 4.3, 4.4 & 4.5) ---
  const [services, setServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);

  const [dbCategoriesList, setDbCategoriesList] = useState([
    "Beauty & Wellness",
    "Mehendi & Bridal",
    "Tailoring & Fashion",
    "Food & Catering",
    "Education & Tutoring",
    "Yoga & Fitness",
    "Home Services",
    "Arts & Crafts"
  ]);

  // Form Field Trackers Aligned to Section 4.3 & 4.4 Specifications
  const [modalServiceName, setModalServiceName] = useState('');
  const [modalServiceBio, setModalServiceBio] = useState('');
  const [modalCustomServiceTitle, setModalCustomServiceTitle] = useState('');
  const [modalServiceProfileImage, setModalServiceProfileImage] = useState(''); 
  const [isCustomCategoryInputVisible, setIsCustomCategoryInputVisible] = useState(false);
  const [customCategoryFieldValue, setCustomCategoryFieldValue] = useState('');
  
  // Singleton Portfolio Repositories (Table 4.4 Schema Mapping)
  const [modalPortfolioUrlInput, setModalPortfolioUrlInput] = useState('');
  const [modalPortfolioImages, setModalPortfolioImages] = useState([]); 

  // --- 3. Dynamic Sub-Offers Matrix Configurations ---
  const [modalOffers, setModalOffers] = useState([
    { id: Date.now(), offer_name: '', price_min: '', price_max: '' }
  ]);

  // --- 4. Customer Enquiries Received Log (Table 4.5 Schema Mapping) ---
  const [enquiries, setEnquiries] = useState([]);

  // --- 5. Navigation Control Overlays and Calendar Parameters ---
  const [busyDates, setBusyDates] = useState(["2026-06-25", "2026-06-26","2026-06-16" ,"2026-06-2","2026-07-16","2026-07-19"]);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date(2026, 5, 1)); 
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // --- Mock Data Hydration Engine ---
  useEffect(() => {
    setServices([
      {
        id: 1,
        provider_id: 42,
        service_name: "Mehendi & Bridal", 
        custom_service_title: "Bridal Mehandi Studio",
        service_bio: "Specializing in heavy traditional bridal work, geometric Arabic fusions, and custom portrait henna layouts using organic cones.",
        service_profile_image: "/1.jpeg",
        is_item_available: true,
        portfolio_images: ["/1.jpeg", "/2.jpeg"],
        reviews: [
          { id: 301, rating: 5, status: "completed" },
          { id: 302, rating: 4, status: "completed" },
          { id: 303, rating: 5, status: "completed" }
        ],
        offers: [
          { id: 101, offer_name: " PackagePackagePackagePackagePackagePackage", price_min: "40000.00", price_max: "120000.00" },
          { id: 102, offer_name: "Child Mehndi Rates", price_min: "150.00", price_max: "300.00" }
        ]
      },
      {
        id: 2,
        provider_id: 42,
        service_name: "Beauty & Wellness", 
        custom_service_title: "Premium Bridal Makeover Group",
        service_bio: "Complete luxury bridal makeover treatments including airbrush HD makeup setups, specialized pre-wedding skincare routines, and customized hairstyling options.",
        service_profile_image: "/3.jpeg",
        is_item_available: true,
        portfolio_images: ["/3.jpeg", "/4.jpeg"],
        reviews: [
          { id: 304, rating: 5, status: "completed" },
          { id: 305, rating: 5, status: "completed" },
          { id: 306, rating: 4, status: "completed" },
          { id: 307, rating: 3, status: "pending" } // This pending review won't affect completed count
        ],
        offers: [
          { id: 201, offer_name: "HD Airbrush Bridal Makeup Package", price_min: "5000.00", price_max: "12000.00" },
          { id: 202, offer_name: "Pre-Bridal Skincare Prep Session", price_min: "2500.00", price_max: "6000.00" }
        ]
      }
    ]);

    setEnquiries([
      { 
        id: 1, 
        provider_id: 42, 
        customer_name: "Suresh Kumar", 
        customer_phone: "9123456789", 
        message: "Need heavy mehndi booking configuration for a wedding function on July 15th near Ameerpet."
      }
    ]);
  }, []);


  // --- 📊 DYNAMIC LIVE METRICS COMPUTATION ENGINE ---
  // Step 1: Accumulate every individual review object nested across all listed provider services
  const allProviderReviews = services.reduce((acc, currentService) => {
    if (currentService.reviews && Array.isArray(currentService.reviews)) {
      return [...acc, ...currentService.reviews];
    }
    return acc;
  }, []);

  // Step 2: Get the count of completed status updates from total service reviews
  const completedReviewsCount = allProviderReviews.filter(
    (review) => review.status === "completed"
  ).length;

  // Step 3: Compute the exact math average of all reviews from all combined services
  const totalReviewsRatingSum = allProviderReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageReviewRatingScore = allProviderReviews.length > 0 
    ? (totalReviewsRatingSum / allProviderReviews.length).toFixed(1) 
    : "0.0";

  // --- Image File Selection Processing Hooks ---
  const handleProcessSingleImageSelection = (e, targetImageStateSetter) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    const previewUrl = URL.createObjectURL(rawFiles[0]);
    targetImageStateSetter(previewUrl);
    e.target.value = '';
  };

  const handleProcessLocalGallerySelection = (e, targetImageStateSetter) => {
    const rawFileList = e.target.files;
    if (!rawFileList || rawFileList.length === 0) return;
    const transformedPreviewUrls = Array.from(rawFileList).map(file => URL.createObjectURL(file));

    targetImageStateSetter(prev => {
      const combined = [...(prev || []), ...transformedPreviewUrls];
      return combined.slice(0, 12); 
    });
    e.target.value = '';
  };

  // --- Core Personal Profiles Managers ---
  const openEditProfileModal = () => {
    setTempProfileForm({ ...profileForm });
    setIsProfileModalOpen(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempProfileForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    if (tempProfileForm.bio && tempProfileForm.bio.length > 200) {
      alert("Error: Biography length cannot exceed 200 characters."); 
      return;
    }
    setProfileForm({ ...tempProfileForm });
    setIsProfileModalOpen(false);
  };

  // --- Dynamic Inventory Controllers ---
  const handleToggleIndividualServiceAvailability = (serviceId, currentCheckedState) => {
    const updatedServices = services.map(s => s.id === serviceId ? { ...s, is_item_available: currentCheckedState } : s);
    setServices(updatedServices);
  };

  const openAddServiceModal = () => {
    setIsEditingService(false);
    setActiveServiceId(null);
    setModalServiceName('');
    setModalCustomServiceTitle('');
    setModalServiceBio('');
    setModalServiceProfileImage('');
    setModalPortfolioImages([]);
    setModalOffers([{ id: Date.now(), offer_name: '', price_min: '', price_max: '' }]);
    setIsServiceModalOpen(true); 
  };

  const openEditServiceModal = (service) => {
    setIsEditingService(true);
    setActiveServiceId(service.id);
    setModalServiceName(service.service_name);
    setModalCustomServiceTitle(service.custom_service_title || '');
    setModalServiceBio(service.service_bio || '');
    setModalServiceProfileImage(service.service_profile_image || '');
    setModalPortfolioImages(service.portfolio_images || []);
    setModalOffers((service.offers || []).map(o => ({ ...o })));
    setIsServiceModalOpen(true);
  };

  const handleCategoryDropdownSelection = (e) => {
    const value = e.target.value;
    if (value === "Others") {
      setIsCustomCategoryInputVisible(true);
      setCustomCategoryFieldValue('');
      setModalServiceName('Others');
    } else {
      setIsCustomCategoryInputVisible(false);
      setCustomCategoryFieldValue('');
      setModalServiceName(value);
    }
  };

  const handleOfferFieldChange = (index, field, value) => {
    const updated = [...modalOffers];
    updated[index][field] = value;
    setModalOffers(updated);
  };

  const addMoreOffersInForm = () => {
    if (modalOffers.length >= 20) return;
    setModalOffers([...modalOffers, { id: Date.now(), offer_name: '', price_min: '', price_max: '' }]);
  };

  const removeOfferFieldFromForm = (index) => {
    if (modalOffers.length === 1) return;
    setModalOffers(modalOffers.filter((_, i) => i !== index));
  };

  const handleRemovePortfolioImageInForm = (index) => {
    setModalPortfolioImages(modalPortfolioImages.filter((_, i) => i !== index));
  };
  const handlePublishServicesForm = (e) => {
    e.preventDefault();
    let finalizedCategoryName = modalServiceName;
    if (modalServiceName === "Others") finalizedCategoryName = customCategoryFieldValue.trim();

    if (isEditingService) {
      setServices(services.map(s => s.id === activeServiceId ? { 
        ...s, 
        service_name: finalizedCategoryName, 
        custom_service_title: modalCustomServiceTitle.trim(),
        service_bio: modalServiceBio.trim(), 
        service_profile_image: modalServiceProfileImage || "/1.jpeg",
        portfolio_images: modalPortfolioImages,
        offers: modalOffers,
        reviews: s.reviews || []
      } : s));
    } else {
      setServices([...services, { 
        id: Date.now(), 
        service_name: finalizedCategoryName, 
        custom_service_title: modalCustomServiceTitle.trim(),
        service_bio: modalServiceBio.trim(), 
        service_profile_image: modalServiceProfileImage || "/1.jpeg",
        portfolio_images: modalPortfolioImages,
        offers: modalOffers,
        is_item_available: true,
        reviews: []
      }]);
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Are you sure you want to remove this service?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  // --- Inline Calendar Traversal Engine ---
  const toggleDateCalendarSchedule = (dateString, isPastDate) => {
    if (isPastDate) return; 
    if (busyDates.includes(dateString)) {
      setBusyDates(busyDates.filter(d => d !== dateString));
    } else {
      setBusyDates([...busyDates, dateString]);
    }
  };

  const renderCalendarDaysGrid = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const systemTodayAnchor = new Date(2026, 5, 24); 
    const gridCells = [];
    
    const blankOffsets = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = 0; i < blankOffsets; i++) {
      gridCells.push(<div key={`blank-${i}`} className="calendar-day empty-cell"></div>);
    }
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentCellDate = new Date(year, month, day);
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBusy = busyDates.includes(dayStr);
      const isPastDate = currentCellDate < systemTodayAnchor;
      
      let cellClassName = "calendar-day actionable-day ";
      if (isPastDate) cellClassName += "day-past-completed";
      else if (isBusy) cellClassName += "day-busy-red"; 
      else cellClassName += "day-available-green"; 

      gridCells.push(
        <div 
          key={dayStr} 
          className={cellClassName} 
          onClick={() => toggleDateCalendarSchedule(dayStr, isPastDate)}
          title={isPastDate ? "Completed Date (Locked)" : "Click to toggle schedule status"}
        >
          {day}
        </div>
      );
    }
    return gridCells;
  };

  const currentMonthYearStringDisplay = currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const handleNavigateToPreviousMonth = () => setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNavigateToNextMonth = () => setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleConfirmDeleteAccount = () => { localStorage.clear(); window.location.href = "/"; };
  const handleLogoutAction = () => { setIsLogoutModalOpen(true); };
  const handleConfirmLogout = () => { localStorage.removeItem("user_session"); window.location.href = "/"; };

  return (
    <div className="dashboard-wrapper">
      <section className="heading">
        <div className="heading_text">
          <h4>{profileForm.full_name}'s Dashboard</h4>
        </div>
      </section>

      {/* 📊 TOP BRANDING SECTION */}
      <section className="dashboard-top-management-grid">
        <div className="stats-summary-inline-grid matching-dual-layout">
          <div className="stat-box"><h3>{completedReviewsCount}</h3><p className="caption">Completed</p></div>
          <div className="stat-box"><h3>⭐ {averageReviewRatingScore}</h3><p className="caption">Avg Review</p></div>
        </div>

        {/* 🛠️ Dynamic Verification Status & Rejection Panel Block */}
        <div className="status-card">
          <h3 className="status-card-heading">Profile Status Verification</h3>
          {profileForm.status === 'approved' && <p className="status-verified">● Verified: Your profile is approved and live across NaariBazar searches.</p>}
          {profileForm.status === 'pending' && <p className="status-reviewing">◓ Reviewing: Profile details checking takes up to 48 hours.</p>}
          {profileForm.status === 'rejected' && (
            <div className="status-denied-container">
              <p className="status-denied-title">✕ Account Denied / Rejected By Admin</p>
              <div className="status-denied-reason-box">
                <strong>Reason for Rejection:</strong> {profileForm.rejection_reason || "No explicit reason detailed by the administrator panel."}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🔲 MIDDLE SPLIT GRID WORKSPACE MAIN SECTION LAYOUT */}
      <div className="dashboard-layout-grid">
        
        {/* LEFT COLUMN MATRIX STACK */}
        <div className="left-column-stack">
          
          {/* Static Personal Details Display Section */}
          <section className="dashboard-card">
            <div className="section-title-action-row">
              <h2>Personal Details</h2>
              <button type="button" className="btn-small-action" onClick={openEditProfileModal}>✏️ Edit Details</button>
            </div>
            
            <div className="profile-details-display-fields">
              <div className="detail-display-row"><strong>Full Name:</strong> <span>{profileForm.full_name}</span></div>
              <div className="detail-display-row"><strong>Phone Number:</strong> <span>{profileForm.phone}</span></div>
              <div className="detail-display-row"><strong>Location:</strong> <span>{profileForm.city}</span></div>
              <div className="detail-display-row"><strong>PIN Code:</strong> <span>{profileForm.pin_code || "Not Stated"}</span></div>
              
              {/* 🔄 GLOBAL STORE AVAILABILITY CHECKBOX SLIDER CONTAINER */}
              <div className={`detail-display-row global-availability-toggle-row ${profileForm.is_available ? 'state-active' : 'state-paused'}`}>
                <div>
                  <strong className="booking-status-header">Immediate Booking Status:</strong>
                  <span className={`booking-status-subtext ${profileForm.is_available ? 'text-active-green' : 'text-paused-red'}`}>
                    {profileForm.is_available ? "● Active & Accepting Clients" : "○ Temporarily Paused / Invisible"}
                  </span>
                </div>
                <label className="checkbox-switch-container-label">
                  <input 
                    type="checkbox" 
                    checked={profileForm.is_available} 
                    onChange={(e) => setProfileForm(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="native-hidden-checkbox"
                  />
                  <span className="custom-styled-toggle-box-indicator"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Availability Calendar Block */}
          <section className="dashboard-card calendar-card-inline-section">
            <div className="calendar-header-strip">
              <div>
                <h2>📅 Store Availability Calendar</h2>
                <div className="calendar-month-traversal-control-panel">
                  <button type="button" className="btn-calendar-nav-arrow" onClick={handleNavigateToPreviousMonth}>◀</button>
                  <span className="calendar-active-month-heading-label">{currentMonthYearStringDisplay}</span>
                  <button type="button" className="btn-calendar-nav-arrow" onClick={handleNavigateToNextMonth}>▶</button>
                </div>
              </div>
              
              <div className="calendar-legends-wrapper-row">
                <div className="legend-item"><span className="legend-box label-completed"></span><span className="caption">Past</span></div>
                <div className="legend-item"><span className="legend-box label-avail-green"></span><span className="caption">Available</span></div>
                <div className="legend-item"><span className="legend-box label-busy-red"></span><span className="caption">Busy</span></div>
              </div>
            </div>
            <div className="calendar-weekdays-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day} className="weekday-label"><strong>{day}</strong></div>)}
            </div>
            <div className="calendar-days-matrix-grid">{renderCalendarDaysGrid()}</div>
          </section>
          {/* Customer Communications Incoming Inbox Panel */}
          <section className="dashboard-card">
            <h2>Customer Enquiries Received</h2>
            {enquiries.length === 0 ? <div className="empty-enquiries"><p className="caption">📩 Your incoming request tracking queue index is empty.</p></div> : (
              <div className="enquiry-stack">
                {enquiries.map(e => (
                  <div key={e.id} className="enquiry-row-item">
                    <div className="enquiry-meta"><strong>👤 {e.customer_name}</strong> <span className="phone-caption-tracker">📞 {e.customer_phone}</span></div>
                    <p className="enquiry-msg">"{e.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN STACK MATRIX */}
        <div className="right-column">
          
          {/* Services Offered Tiered Form Accumulator Module */}
          <section className="dashboard-card">
            <div className="services-section-header">
              <h2>SERVICES & OFFERS</h2>
              <button type="button" className="btn-primary" onClick={() => openAddServiceModal()}>+ Add Service Group</button>
            </div>
            {services.length === 0 && <p className="warning-text">⚠️ Publish at least 1 service group to appear live </p>}
            
            <div className="services-nested-accordion-display-stack">
              {services.map(service => (
                <div key={service.id} className="service-category-parent-card-block">
                  
                  {/* Category Header Bar Title Row Component Elements */}
                  <div className="service-parent-header-bar-row">
                    <div className="parent-title-group-text">
                      <img src={service.service_profile_image || "/1.jpeg"} alt="Service Artwork" className="service-group-mini-cover" />
                      <div>
                        <div className="parent-title-headline-wrap">
                          <h3>{service.custom_service_title || service.service_name}</h3>
                        </div>
                        <span className="category-core-sub-caption">Category: {service.service_name}</span>
                      </div>
                      <span className="offers-badge-counter-pill">{(service.offers || []).length} sub-offers</span>
                    </div>

                    {/* 🔄 INDEPENDENT SERVICE CATEGORY LEVEL AVAILABILITY SLIDER */}
                    <div className="service-item-toggle-wrapper">
                      <span className={`service-item-toggle-status-text ${service.is_item_available !== false ? 'status-active-green' : 'status-paused-red'}`}>
                        {service.is_item_available !== false ? "Active" : "Paused"}
                      </span>
                      <label className="checkbox-switch-container-label">
                        <input 
                          type="checkbox" 
                          checked={service.is_item_available !== false} 
                          onChange={(e) => handleToggleIndividualServiceAvailability(service.id, e.target.checked)}
                          className="native-hidden-checkbox"
                        />
                        <span className="custom-styled-toggle-box-indicator size-small"></span>
                      </label>
                    </div>
                    
                    <div className="parent-actions-group-links-row">
                      <button type="button" className="btn-service-action-edit" onClick={() => openEditServiceModal(service)}>View/Edit Details</button>
                      <button type="button" className="btn-service-action-delete" onClick={() => handleDeleteService(service.id)}>Delete Service</button>
                    </div>
                  </div>
                  
                  {/* Reflected Service Summary Description View Box */}
                  <div className="detail-display-row flex-column-start">
                    <strong className="field-group-desc-label">Category Scope Overview / Bio:</strong>
                    <p className="service-desc-text-p">{service.service_bio || "No summary overview specified summary layout lane yet."}</p>
                  </div>

                  {/* Reflected Portfolio Gallery View Box Matrix List Wrapper */}
                  <div className="portfolio-row-view-container">
                    <strong className="field-group-desc-label">Portfolio Media Samples ({(service.portfolio_images || []).length}/12):</strong>
                    {(!service.portfolio_images || service.portfolio_images.length === 0) ? (
                      <p className="caption italic-font">📷 No portfolio snapshots attached specifically for this lane.</p>
                    ) : (
                      <div className="photo-grid-accordion">
                        {service.portfolio_images.map((img, idx) => (
                          <div key={idx} className="portfolio-thumb"><img src={img} alt="Snapshot frame layout" /></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nested Sub-Offers Pricing Data Grid Portfolio Component */}
                  <div className="nested-sub-offers-table-wrapper">
                    <table className="dashboard-nested-offers-data-table">
                      <thead>
                        <tr><th>Specific Sub-Offer  Package Title</th><th className="text-right-aligned"> Price </th></tr>
                      </thead>
                      <tbody>
                        {(service.offers || []).map((offer, idx) => (
                          <tr key={offer.id || idx}>
                            <td className="offer-cell-name-title">{offer.offer_name}</td>
                            <td className="offer-cell-pricing-digits text-right-aligned">
                              ₹{parseFloat(offer.price_min || 0).toLocaleString('en-IN')} - ₹{parseFloat(offer.price_max || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* =================================================================================
          POPUP CONFIGURATION MODALS INTERACTION LAYER OVERLAYS
          ================================================================================= */}

      {/* MODAL 1: EDIT PROFILE PERSONAL DETAILS SUBFORM POPUP SHEET */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button type="button" className="btn-modal-close-x" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            <h3>✏️ Update Storefront Details</h3>
            <form onSubmit={handleProfileFormSubmit} className="modal-form-element">
              <div className="modal-input-block-container">
                <label>Full Name</label>
                <input type="text" name="full_name" value={tempProfileForm.full_name || ""} onChange={handleProfileInputChange} required />
              </div>
              <div className="modal-input-block-container">
                <label>City Hub Location</label>
                <input type="text" name="city" value={tempProfileForm.city || ""} onChange={handleProfileInputChange} required />
              </div>
              <div className="modal-input-block-container">
                <label>PIN Code</label>
                <input type="text" name="pin_code" value={tempProfileForm.pin_code || ""} onChange={handleProfileInputChange} />
              </div>

              <div className="modal-actions-wrapper">
                <button type="button" className="btn-small-cancel" onClick={() => setIsProfileModalOpen(false)}>Discard</button>
                <button type="submit" className="btn-primary">Save Profile Setup</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 📝 POPUP 2: DETAILED INTERACTIVE SERVICE GROUP EDITOR MODAL OVERLAY */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container multi-offer-modal">
            {/* Upper Right Explicit Close Button */}
            <button type="button" className="btn-modal-close-x" onClick={() => setIsServiceModalOpen(false)}>✕</button>
            
            <h3>{isEditingService ? '✏️ Edit Changes Form - Service Category Row' : '🚀 Service Offered Group Configuration'}</h3>
            
            {/* Scrollable Form Box Container */}
            <div className="modal-scrollable-content-body">
              <form onSubmit={handlePublishServicesForm} className="modal-form-element">
                
                <div className="modal-split-fields-grid">
                  <div className="modal-input-block-container">
                    <label>Category Name</label>
                    <select value={modalServiceName} onChange={handleCategoryDropdownSelection} required className="modal-select-field-element">
                      <option value="" disabled>-- Select core lane --</option>
                      {dbCategoriesList.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                      <option value="Others">Others ...</option>
                    </select>
                  </div>
                  
                  <div className="modal-input-block-container">
                    <label>Service Profile Cover Image</label>
                    <div className="single-photo-uploader-row">
                      <img src={modalServiceProfileImage || "/1.jpeg"} alt="Lookup preview" className="single-photo-preview-thumbnail" />
                      <button type="button" onClick={() => document.getElementById('serviceCategoryProfileCoverFileTrigger').click()} className="btn-select-photo-trigger">
                        📷 Select Photo
                      </button>
                      <input type="file" id="serviceCategoryProfileCoverFileTrigger" accept="image/*" className="hidden-file-input" onChange={(e) => handleProcessSingleImageSelection(e, setModalServiceProfileImage)} />
                    </div>
                  </div>
                </div>

                {isCustomCategoryInputVisible && (
                  <div className="modal-input-block-container custom-category-input-row">
                    <label>Custom Category Name</label>
                    <input type="text" placeholder="e.g., Food Catering" value={customCategoryFieldValue} onChange={e => setCustomCategoryFieldValue(e.target.value)} required />
                  </div>
                )}

                <div className="modal-input-block-container">
                  <label>Service Title</label>
                  <input type="text" placeholder="e.g., Royal Rajasthani Mehndi Studio" value={modalCustomServiceTitle} onChange={e => setModalCustomServiceTitle(e.target.value)} required />
                </div>

                <div className="modal-input-block-container">
                  <label>Service Description</label>
                  <textarea placeholder="Provide unique training parameters or scope specific details summary overview text..." value={modalServiceBio} onChange={e => setModalServiceBio(e.target.value)} required className="modal-textarea-fixed-height" />
                </div>

                {/* --- MULTI PORTFOLIO UPLOADER ROW --- */}
                <div className="modal-input-block-container">
                  <label className="portfolio-uploader-title-label">
                    Service Portfolio Samples ({modalPortfolioImages.length}/12)
                  </label>
                  <div className="mock-upload-field-box" onClick={() => document.getElementById('categoryGridMultiFilesTrigger').click()}>
                    <p className="mock-upload-field-box-text">🖼️ Click to pick multiple portfolio images from gallery</p>
                  </div>
                  <input type="file" id="categoryGridMultiFilesTrigger" multiple accept="image/*" className="hidden-file-input" onChange={(e) => handleProcessLocalGallerySelection(e, setModalPortfolioImages)} />
                  
                  {modalPortfolioImages.length > 0 && (
                    <div className="modal-portfolio-preview-scroller-box">
                      {modalPortfolioImages.map((img, idx) => (
                        <div key={idx} className="portfolio-preview-thumb-wrapper">
                          <img src={img} alt="Portfolio snapshot lookup item" />
                          <button type="button" onClick={() => handleRemovePortfolioImageInForm(idx)} className="btn-portfolio-remove-round">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="offers-fields-scroll-area">
                  {modalOffers.map((offer, index) => (
                    <div key={offer.id || index} className="offer-inputs-row-box">
                      <div className="offer-inputs-row-header-strip">
                        <h4>Sub-Offer Package Option #{index + 1}</h4>
                        {modalOffers.length > 1 && <button type="button" className="remove-row-btn" onClick={() => removeOfferFieldFromForm(index)}>✕ Remove</button>}
                      </div>
                      <div className="modal-input-block-container">
                        <input type="text" placeholder="Package Title Name" value={offer.offer_name || ''} onChange={e => handleOfferFieldChange(index, 'offer_name', e.target.value)} required />
                      </div>
                      <div className="price-inputs-split-row">
                        <input type="number" placeholder="Min Price (₹)" value={offer.price_min || ''} onChange={e => handleOfferFieldChange(index, 'price_min', e.target.value)} required />
                        <input type="number" placeholder="Max Price (₹)" value={offer.price_max || ''} onChange={e => handleOfferFieldChange(index, 'price_max', e.target.value)} required />
                      </div>
                    </div>
                  ))}
                </div>
                
                {modalOffers.length < 20 && <button type="button" className="btn-add-more-offers" onClick={addMoreOffersInForm}>+ Add More Pricing Packages Options ({modalOffers.length}/20)</button>}

                <div className="modal-actions-wrapper">
                  <button type="button" className="btn-small-cancel" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Publish Service Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RISK DIALOG ACCOUNT DELETION */}
      {isDeleteAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container text-center-modal-box">
            {/* Upper Right Explicit Close Button */}
            <button type="button" className="btn-modal-close-x" onClick={() => setIsDeleteAccountModalOpen(false)}>✕</button>
            
            <h3 className="risk-header-title">⚠️ Are you sure??</h3>
            
            <div className="modal-scrollable-content-body text-center-modal-box">
              <p className="risk-warning-body-text">Please note that this action initiates the permanent deletion of your NaariBazar data. This process takes 30 days to complete. You may reverse this decision and prevent permanent deletion by logging into your account at any point during this 30-day window.</p>
              <div className="modal-actions-wrapper dual-grid-actions-wrapper">
                <button type="button" className="btn-small-cancel" onClick={() => setIsDeleteAccountModalOpen(false)}>No, Keep Dashboard</button>
                <button type="button" className="btn-primary risk-delete-confirm-btn" onClick={handleConfirmDeleteAccount}>Yes, Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚪 MODAL 4: RISK DIALOG LOGOUT ACTION CONFIRMATION SECURITY OVERLAY */}
      {isLogoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container text-center-modal-box modal-logout-size-restriction">
            <button type="button" className="btn-modal-close-x" onClick={() => setIsLogoutModalOpen(false)}>✕</button>
            <div className="modal-logout-emoji-graphic">🚪</div>
            <h3 className="risk-header-title">Confirm Logout</h3>
            <p className="risk-warning-body-text">
              Are you sure you want to logout from your account?
            </p>
            <div className="modal-actions-wrapper dual-grid-actions-wrapper logout-actions-grid-override">
              <button type="button" className="btn-disabled-secondary" onClick={() => setIsLogoutModalOpen(false)}>
                No, Stay
              </button>
              <button type="button" className="btn-primary logout-confirm-color-override" onClick={handleConfirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚪 FOOTER LAYOUT ACTION CENTER PANEL */}
      <div className="dashboard-logout-footer-row">
        <button type="button" className="btn-system-logout" onClick={handleLogoutAction}>🚪 Logout Account</button>
        <button type="button" className="btn-system-delete-footer" onClick={() => setIsDeleteAccountModalOpen(true)}>🗑️ Delete Account</button>
      </div>

    </div>
  );
}

export default ProviderDashboard;
