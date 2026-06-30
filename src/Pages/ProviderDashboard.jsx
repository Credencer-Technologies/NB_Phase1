import React, { useState, useEffect } from 'react';
import './ProviderDashboard.css';

function ProviderDashboard() {
  // --- 1. Core Profile Details State Stack (Table 4.2 Schema Mappings) ---
  const [profileForm, setProfileForm] = useState({
    id: 42,
    full_name: "Ananya Rao",
    phone: "9876543210",
    city: "Hyderabad",
    pin_code: "500016",
    status: "approved",
    rejection_reason: "",
    is_available: true
  });
  const [tempProfileForm, setTempProfileForm] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- 2. Dynamic Services Offers Repositories (Table 4.3 & 4.4 Schema Mappings) ---
  const [services, setServices] = useState([]);
  const [inspectedService, setInspectedService] = useState(null);
  const [isServiceViewModalOpen, setIsServiceViewModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);

  const [dbCategoriesList, setDbCategoriesList] = useState([
    "Mehandi Artistry", 
    "Tailoring Hub", 
    "Boutique Designer", 
    "Beauty & Makeup Care",
    "Food Catering & Sweets",
    "Handicrafts & Decor",
    "Tutoring & Education",
    "Home Care Services"
  ]);

  // Form Field Tracker Sub-States
  const [modalServiceName, setModalServiceName] = useState('');
  const [modalCustomServiceTitle, setModalCustomServiceTitle] = useState('');
  const [modalServiceBio, setModalServiceBio] = useState('');
  const [modalServiceProfileImage, setModalServiceProfileImage] = useState(''); 
  const [isCustomCategoryInputVisible, setIsCustomCategoryInputVisible] = useState(false);
  const [customCategoryFieldValue, setCustomCategoryFieldValue] = useState('');
  const [modalPortfolioImages, setModalPortfolioImages] = useState([]); 

  // --- 3. Dynamic Price Matrix Packages ---
  const [modalOffers, setModalOffers] = useState([
    { id: Date.now(), offer_name: '', price_min: '', price_max: '' }
  ]);

  // --- 4. Customer Enquiries Inbox Repository (Table 4.5 Schema Mapping) ---
  const [enquiries, setEnquiries] = useState([]);

  // --- 5. Interactive Calendar Traversal Parameters ---
  const [busyDates, setBusyDates] = useState(["2026-06-25", "2026-06-26"]);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // --- Mapped Schema Mock Data Hydration Engine ---
  useEffect(() => {
    setProfileForm({
      id: 42,
      full_name: "Ananya Rao",
      phone: "9876543210",
      city: "Hyderabad",
      pin_code: "500016",
      status: "approved",
      rejection_reason: "",
      is_available: true
    });

    setServices([
      {
        id: 1,
        provider_id: 42,
        service_name: "Mehandi Artistry", 
        custom_service_title: "Bridal Mehandi Studio",
        service_bio: "Specializing in heavy traditional bridal work fusions, geometric Arabic templates, and organic henna cone arrangements.",
        service_profile_image: "/1.jpeg",
        is_item_available: true,
        portfolio_images: ["/1.jpeg", "/2.jpeg"],
        offers: [
          { id: 101, offer_name: "Arabic Mehndi Package", price_min: "400", price_max: "1200" },
          { id: 102, offer_name: "Full Bridal Traditional Combo", price_min: "2500", price_max: "6000" }
        ]
      }
    ]);

    setEnquiries([
      { 
        id: 1, 
        provider_id: 42, 
        customer_name: "Suresh Kumar", 
        customer_phone: "9123456789", 
        message: "Need heavy mehndi booking configuration for a wedding function on July 15th near Ameerpet.", 
        created_at: "2026-06-25 09:20:00" 
      }
    ]);
  }, []);

  // --- Local Device Single-Image & Multi-Gallery File Loader Hook Modifiers ---
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
      if (combined.length > 12) {
        alert("Portfolio allowance is hard capped at 12 records max per category pathway.");
        return combined.slice(0, 12);
      }
      return combined;
    });
    e.target.value = '';
  };

  // --- Personal Profiles Modification Handlers ---
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
    setProfileForm({ ...tempProfileForm });
    setIsProfileModalOpen(false);
  };

  // --- 🔍 Split View Details vs Form Editors Workflow Engine Links ---
  const handleOpenInspectionModal = (service) => {
    setInspectedService(service);
    setIsServiceViewModalOpen(true);
  };

  const handleTransitionToEditModal = () => {
    if (!inspectedService) return;
    setIsServiceViewModalOpen(false); 
    
    setIsEditingService(true);
    setActiveServiceId(inspectedService.id);
    setModalServiceName(inspectedService.service_name);
    setModalCustomServiceTitle(inspectedService.custom_service_title || '');
    setModalServiceBio(inspectedService.service_bio || '');
    setModalServiceProfileImage(inspectedService.service_profile_image || '');
    setModalPortfolioImages(inspectedService.portfolio_images || []);
    setModalOffers(inspectedService.offers.map(o => ({ ...o })));
    
    setIsServiceModalOpen(true);
  };

  const handleToggleIndividualServiceAvailability = (serviceId, currentCheckedState) => {
    const updatedServices = services.map(s => s.id === serviceId ? { ...s, is_item_available: currentCheckedState } : s);
    setServices(updatedServices);
    if (inspectedService && inspectedService.id === serviceId) {
      setInspectedService({ ...inspectedService, is_item_available: currentCheckedState });
    }
  };

  // --- Service Creation & Editing Forms Management Infrastructure ---
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
    setModalOffers(service.offers.map(o => ({ ...o })));
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
        offers: modalOffers 
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
        is_item_available: true
      }]);
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this service group layout branch?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  // --- Operational Store Availability Calendar Matrix Engine ---
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
      if (isPastDate) {
        cellClassName += "day-past-completed";
      } else if (isBusy) {
        cellClassName += "day-busy-red"; 
      } else {
        cellClassName += "day-available-green"; 
      }

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

  const currentMonthYearStringDisplay = currentCalendarMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const handleNavigateToPreviousMonth = () => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNavigateToNextMonth = () => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // --- Shared Management Control Infrastructure Hooks ---
  const handleConfirmDeleteAccount = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleLogoutAction = () => {
    localStorage.removeItem("user_session");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* 📊 TOP BRANDING SECTION */}
      <section className="dashboard-top-management-grid">
        <div className="stats-summary-inline-grid">
          <div className="stat-box"><h3>15</h3><p className="caption">Total Queries</p></div>
          <div className="stat-box"><h3>9</h3><p className="caption">Completed</p></div>
          <div className="stat-box"><h3>⭐ 4.8</h3><p className="caption">Avg Review</p></div>
        </div>

        <div className="status-card">
          <h3>{profileForm.full_name}'s Management Desk</h3>
          <p className="status-verified">● Live & Visible inside NaariBazar database lookups.</p>
        </div>
      </section>

      {/* 🔲 SECTION GRIDS LAYOUT CONTAINER WORKSPACE */}
      <div className="dashboard-layout-grid">
        <div className="left-column-stack">
          <section className="dashboard-card">
            <div className="section-title-action-row">
              <h2>Personal Details</h2>
              <button type="button" className="btn-small-action" onClick={openEditProfileModal}>✏️ Edit Details</button>
            </div>
            
            <div className="profile-details-display-fields">
              <div className="detail-display-row"><strong>Full Name:</strong> <span>{profileForm.full_name}</span></div>
              <div className="detail-display-row"><strong>Phone:</strong> <span>{profileForm.phone}</span></div>
              <div className="detail-display-row"><strong>City Hub Location:</strong> <span>{profileForm.city}</span></div>
              <div className="detail-display-row"><strong>PIN Code:</strong> <span>{profileForm.pin_code || "Not Configured"}</span></div>
              
              {/* 🔄 GLOBAL STORE AVAILABILITY CHECKBOX SLIDER */}
              <div className="detail-display-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', background: profileForm.is_available ? '#ecfdf5' : '#fef2f2', padding: '10px 14px', borderRadius: '8px', border: profileForm.is_available ? '1px solid #a7f3d0' : '1px solid #fca5a5' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px' }}>Immediate Booking Status:</strong>
                  <span style={{ fontSize: '12px', color: profileForm.is_available ? '#047857' : '#b91c1c' }}>
                    {profileForm.is_available ? "● Active & Accepting Clients" : "○ Paused / Storefront Invisible"}
                  </span>
                </div>
                <label className="checkbox-switch-container-label" style={{ margin: 0, position: 'relative', display: 'inline-block', width: '42px', height: '22px' }}>
                  <input 
                    type="checkbox" 
                    checked={profileForm.is_available} 
                    onChange={(e) => setProfileForm(prev => ({ ...prev, is_available: e.target.checked }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="custom-styled-toggle-box-indicator" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: profileForm.is_available ? '#10b981' : '#ccc', borderRadius: '34px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '16px', width: '16px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s', transform: profileForm.is_available ? 'translateX(20px)' : 'none' }}></span>
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Calendar Block Component Grid Layout */}
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
            </div>
            <div className="calendar-weekdays-grid" style={{ marginTop: '10px' }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day} className="weekday-label"><strong>{day}</strong></div>)}
            </div>
            <div className="calendar-days-matrix-grid">{renderCalendarDaysGrid()}</div>
          </section>

          {/* Customer Communications Incoming Inbox Panel */}
          <section className="dashboard-card">
            <h2>Customer Enquiries Received</h2>
            {enquiries.length === 0 ? <div className="empty-enquiries" style={{ textAlign: 'center' }}><p className="caption">📩 Your incoming request tracking queue is empty.</p></div> : (
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

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <section className="dashboard-card">
            <div className="services-section-header">
              <h2>SERVICES & OFFERS</h2>
              <button type="button" className="btn-primary" onClick={openAddServiceModal}>+ Add Service Group</button>
            </div>
            
            {services.length === 0 && <p className="warning-text">⚠️ Publish at least 1 nested package group option to appear live inside filters searches.</p>}
            
            <div className="services-nested-accordion-display-stack">
              {services.map(service => (
                <div key={service.id} className="service-category-parent-card-block">
                  <div className="service-parent-header-bar-row">
                    <div className="parent-title-group-text">
                      <img src={service.service_profile_image} alt="Service Cover" className="service-group-mini-cover" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <h3>{service.custom_service_title || service.service_name}</h3>
                        <span className="category-core-sub-caption">Core Trade: {service.service_name}</span>
                      </div>
                    </div>
                    {/* 🔄 INDEPENDENT SERVICE CATEGORY LEVEL AVAILABILITY SLIDER */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto', marginRight: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: service.is_item_available !== false ? '#047857' : '#b91c1c' }}>
                        {service.is_item_available !== false ? "Active" : "Paused"}
                      </span>
                      <label className="checkbox-switch-container-label" style={{ margin: 0, position: 'relative', display: 'inline-block', width: '36px', height: '18px' }}>
                        <input 
                          type="checkbox" 
                          checked={service.is_item_available !== false} 
                          onChange={(e) => handleToggleIndividualServiceAvailability(service.id, e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className="custom-styled-toggle-box-indicator" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: service.is_item_available !== false ? '#10b981' : '#ccc', borderRadius: '34px', transition: '0.3s' }}>
                          <span style={{ position: 'absolute', height: '14px', width: '14px', left: '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s', transform: service.is_item_available !== false ? 'translateX(18px)' : 'none' }}></span>
                        </span>
                      </label>
                    </div>

                    <div className="parent-actions-group-links-row">
                      <button type="button" className="btn-service-action-edit" onClick={() => handleOpenInspectionModal(service)}>View Details</button>
                      <button type="button" className="btn-service-action-delete" onClick={() => handleDeleteService(service.id)}>Delete Service</button>
                    </div>
                  </div>
                  
                  <div className="detail-display-row flex-column-start" style={{ marginTop: '10px' }}>
                    <strong className="field-group-desc-label">Description / Bio:</strong>
                    <p className="service-desc-text-p">{service.service_bio || "No summary overview specified."}</p>
                  </div>

                  <div className="portfolio-row-view-container" style={{ marginTop: '12px' }}>
                    <strong className="field-group-desc-label">Portfolio Media Samples ({service.portfolio_images.length}/12):</strong>
                    <div className="photo-grid-accordion" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '6px' }}>
                      {service.portfolio_images.map((img, idx) => (
                        <div key={idx} className="portfolio-thumb" style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={img} alt="Snapshot preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="nested-sub-offers-table-wrapper" style={{ marginTop: '14px' }}>
                    <table className="dashboard-nested-offers-data-table">
                      <thead>
                        <tr><th>Specific Package Title</th><th className="text-right-aligned">Estimated Range</th></tr>
                      </thead>
                      <tbody>
                        {service.offers.map((offer, idx) => (
                          <tr key={offer.id || idx}>
                            <td>🔹 {offer.offer_name}</td>
                            <td className="text-right-aligned">₹{parseFloat(offer.price_min).toLocaleString('en-IN')} - ₹{parseFloat(offer.price_max).toLocaleString('en-IN')}</td>
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

      {/* 🔍 POPUP 1: READ-ONLY PUBLIC SERVICE PROFILE INSPECTION SHEET OVERLAY */}
      {isServiceViewModalOpen && inspectedService && (
        <div className="modal-overlay">
          <div className="modal-container multi-offer-modal">
            <button type="button" className="btn-modal-close-x" onClick={() => setIsServiceViewModalOpen(false)}>✕</button>
            <div className="modal-header-visual-strip">
              <img src={inspectedService.service_profile_image || "/1.jpeg"} alt="Service cover preview" className="modal-profile-image-preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <h3>{inspectedService.custom_service_title || inspectedService.service_name}</h3>
                <span className="offers-badge-counter-pill">{(inspectedService.offers || []).length} Packages Live</span>
              </div>
            </div>

            <div className="modal-scrollable-content-area">
              <div className="service-toggle-status-highlight-container" style={{ backgroundColor: inspectedService.is_item_available !== false ? '#ecfdf5' : '#fef2f2', border: inspectedService.is_item_available !== false ? '1px dashed #a7f3d0' : '1px dashed #fca5a5', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex' }}>
                <label className="checkbox-switch-container-label" style={{ margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span className="checkbox-toggle-text-descriptor" style={{ color: inspectedService.is_item_available !== false ? '#065f46' : '#991b1b', fontWeight: '500', fontSize: '13px' }}>
                    {inspectedService.is_item_available !== false ? "● Mapped Active: This category branch appears live across searches." : "○ Mapped Paused: This trade category is temporarily hidden from searches."}
                  </span>
                </label>
              </div>

              <label className="modal-section-uppercase-label">Core Category Track</label>
              <span className="modal-category-static-text">{inspectedService.service_name}</span>

              <label className="modal-section-uppercase-label">Service Overview Scope / Bio</label>
              <p className="modal-bio-static-paragraph" style={{ whiteSpace: 'pre-wrap' }}>
                {inspectedService.service_bio || "No summary overview bio configured relative to this trade category group module track."}
              </p>

              <label className="modal-section-uppercase-label">Portfolio Snapshots Collection</label>
              {(!inspectedService.portfolio_images || inspectedService.portfolio_images.length === 0) ? (
                <p className="caption italic-font margin-bottom-16">📷 No portfolio images uploaded specifically for this category lane yet.</p>
              ) : (
                <div className="photo-grid-modal-preview">
                  {inspectedService.portfolio_images.map((img, idx) => (
                    <div key={idx} className="portfolio-thumb">
                      <img src={img} alt="Snapshot grid frame preview asset" />
                    </div>
                  ))}
                </div>
              )}

              <label className="modal-section-uppercase-label">Active Pricing Rates Structure Matrix</label>
              <div className="nested-sub-offers-table-wrapper margin-bottom-8">
                <table className="dashboard-nested-offers-data-table">
                  <thead>
                    <tr><th>Package Display Name</th><th className="text-right-aligned">Estimated Range</th></tr>
                  </thead>
                  <tbody>
                    {(inspectedService.offers || []).map((offer, idx) => (
                      <tr key={offer.id || idx}>
                        <td className="offer-cell-name-static">🔹 {offer.offer_name}</td>
                        <td className="offer-cell-pricing-static text-right-aligned">₹{parseFloat(offer.price_min || 0).toLocaleString('en-IN')} - ₹{parseFloat(offer.price_max || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions-wrapper border-top-divider">
              <button type="button" className="btn-disabled-secondary" onClick={() => setIsServiceViewModalOpen(false)}>Close View</button>
              <button type="button" className="btn-primary" onClick={handleTransitionToEditModal}>✏️ Edit Details Form</button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 1: STOREFRONT DETAILS PROFILE DRAWER SUBFORM */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button type="button" className="btn-modal-close-x" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            <h3>✏️ Update Storefront Details</h3>
            <form onSubmit={handleProfileFormSubmit} style={{ marginTop: '12px' }}>
              <label>Full Name</label>
              <input type="text" name="full_name" value={tempProfileForm.full_name || ""} onChange={handleProfileInputChange} required />
              <label>City Hub Location</label>
              <input type="text" name="city" value={tempProfileForm.city || ""} onChange={handleProfileInputChange} required />
              <label>PIN Code</label>
              <input type="text" name="pin_code" value={tempProfileForm.pin_code || ""} onChange={handleProfileInputChange} />

              <div className="modal-actions-wrapper" style={{ marginTop: '20px' }}>
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
            <button type="button" className="btn-modal-close-x" onClick={() => setIsServiceModalOpen(false)}>✕</button>
            <h3>{isEditingService ? '✏️ Edit Changes Form - Service Category Row' : '🚀 Service Offered Group Configuration'}</h3>
            <form onSubmit={handlePublishServicesForm} style={{ marginTop: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label>Core Trade Skill Classification</label>
                  <select value={modalServiceName} onChange={handleCategoryDropdownSelection} required className="modal-select-field-element">
                    <option value="" disabled>-- Select core lane --</option>
                    {dbCategoriesList.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                    <option value="Others">Others ...</option>
                  </select>
                </div>
                
                <div>
                  <label>Service Profile Cover Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                    <img src={modalServiceProfileImage || "/1.jpeg"} alt="Lookup preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #d1d5db' }} />
                    <button type="button" onClick={() => document.getElementById('serviceCategoryProfileCoverFileTrigger').click()} style={{ padding: '8px 12px', background: '#fcfaff', border: '1px dashed #6021a8', color: '#6021a8', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                      📷 Select Photo
                    </button>
                    <input type="file" id="serviceCategoryProfileCoverFileTrigger" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleProcessSingleImageSelection(e, setModalServiceProfileImage)} />
                  </div>
                </div>
              </div>

              {isCustomCategoryInputVisible && (
                <div style={{ marginTop: '10px' }}>
                  <label>Register Custom Class Title</label>
                  <input type="text" placeholder="e.g., Food Catering" value={customCategoryFieldValue} onChange={e => setCustomCategoryFieldValue(e.target.value)} required />
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <label>Specific Service Branch Public Title</label>
                <input type="text" placeholder="e.g., Royal Rajasthani Mehndi Studio" value={modalCustomServiceTitle} onChange={e => setModalCustomServiceTitle(e.target.value)} required />
              </div>

              <div style={{ marginTop: '10px' }}>
                <label>Detailed Public Service Summary Description / Bio</label>
                <textarea placeholder="Provide unique training parameters or scope specific details..." value={modalServiceBio} onChange={e => setModalServiceBio(e.target.value)} required className="modal-textarea-fixed-height" />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ fontWeight: '600', color: '#1e1b4b', display: 'block', marginBottom: '6px' }}>
                  Category Portfolio Showcase Samples ({modalPortfolioImages.length}/12)
                </label>
                <div className="mock-upload-field-box" onClick={() => document.getElementById('categoryGridMultiFilesTrigger').click()} style={{ border: '2px dashed #6021a8', background: '#fcfaff', padding: '16px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6021a8', fontWeight: '500' }}>🖼️ Click to pick multiple portfolio images from gallery</p>
                </div>
                <input type="file" id="categoryGridMultiFilesTrigger" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleProcessLocalGallerySelection(e, setModalPortfolioImages)} />
                
                {modalPortfolioImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', background: '#f9fafb', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '10px' }}>
                    {modalPortfolioImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', flexShrink: 0, width: '55px', height: '55px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                        <img src={img} alt="Portfolio item asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleRemovePortfolioImageInForm(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220, 38, 38, 0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="offers-fields-scroll-area" style={{ marginTop: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                {modalOffers.map((offer, index) => (
                  <div key={offer.id || index} className="offer-inputs-row-box" style={{ background: '#fcfaff', border: '1px solid #e9e3ff', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#6021a8' }}>Sub-Offer Package Option #{index + 1}</h4>
                      {modalOffers.length > 1 && <button type="button" className="remove-row-btn" onClick={() => removeOfferFieldFromForm(index)} style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}>✕ Remove</button>}
                    </div>
                    <input type="text" placeholder="Package Title Name" value={offer.offer_name || ''} onChange={e => handleOfferFieldChange(index, 'offer_name', e.target.value)} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                      <input type="number" placeholder="Min Price" value={offer.price_min || ''} onChange={e => handleOfferFieldChange(index, 'price_min', e.target.value)} required />
                      <input type="number" placeholder="Max Price" value={offer.price_max || ''} onChange={e => handleOfferFieldChange(index, 'price_max', e.target.value)} required />
                    </div>
                  </div>
                ))}
              </div>
              
              {modalOffers.length < 20 && <button type="button" className="btn-add-more-offers" onClick={addMoreOffersInForm} style={{ width: '100%', padding: '8px', background: '#f3e8ff', border: '1px dashed #c084fc', color: '#6b21a8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}>➕ Add More Pricing Packages Options ({modalOffers.length}/20)</button>}

              <div className="modal-actions-wrapper" style={{ marginTop: '18px' }}>
                <button type="button" className="btn-small-cancel" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Service Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 3: RISK DIALOG ACCOUNT DELETION */}
      {isDeleteAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container text-center-modal-box">
            <button type="button" className="btn-modal-close-x" onClick={() => setIsDeleteAccountModalOpen(false)}>✕</button>
            <h3 className="risk-header-title">⚠️ Are you sure??</h3>
            <p className="risk-warning-body-text">This action completely wipes out your data from NaariBazar permanently.</p>
            <div className="modal-actions-wrapper dual-grid-actions-wrapper">
              <button type="button" className="btn-small-cancel" onClick={() => setIsDeleteAccountModalOpen(false)}>No, Keep Dashboard</button>
              <button type="button" className="btn-primary risk-delete-confirm-btn" onClick={handleConfirmDeleteAccount}>Yes, Delete Account</button>
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
