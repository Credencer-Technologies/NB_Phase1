import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ProviderDashboard.css';

// --- 🇮🇳 IST (Indian Standard Time) helper ---
// Returns today's date as a "YYYY-MM-DD" string computed from real IST (Asia/Kolkata),
// independent of the device/browser's local timezone. Used to decide which calendar
// dates are "past/completed" so it updates automatically, day by day, in real time.
const getISTTodayDateString = () => {
  const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const y = istNow.getFullYear();
  const m = String(istNow.getMonth() + 1).padStart(2, "0");
  const d = String(istNow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function ProviderDashboard() {
  const navigate = useNavigate();

  // Keep provider approval status strictly synchronized with the backend.
  // Anything missing/unknown is treated as pending — never as approved.
  const normalizeProviderStatus = (value) => {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    return "pending";
  };

  const extractProviderPayload = (response) =>
    response?.data?.provider ??
    response?.data?.data ??
    response?.data ??
    {};

  // --- 1. Core Profile Details State Stack (Table 4.2 Schema Mapping) ---
  // Starts empty — real data is fetched from the backend for the logged-in provider (see auth useEffect below).
  const [profileForm, setProfileForm] = useState({
    id: null,
    full_name: "",
    phone: "",
    email: "",
    city: "",
    pin_code: "",
    category_id: null,
    bio: "",
    service_description: "",
    id_document_url: "",
    status: "pending",
    rejection_reason: "",
    is_available: true
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [tempProfileForm, setTempProfileForm] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Popup shown when the provider tries to edit their email address.
  // Email is the verified login identifier and cannot be changed here.
  const [isEmailChangeNoticeOpen, setIsEmailChangeNoticeOpen] = useState(false);

  // Popup shown when the provider tries to edit their phone number.
  // Phone number can only be changed by the admin.
  const [isPhoneChangeNoticeOpen, setIsPhoneChangeNoticeOpen] = useState(false);

  // --- 2. Dynamic Repositories Data Arrays (Tables 4.3, 4.4 & 4.5) ---
  const [services, setServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);

  const [dbCategoriesList, setDbCategoriesList] = useState([]); // category names — fetched from backend
  const [categoriesFull, setCategoriesFull] = useState([]); // [{id, name}, ...] — used to resolve category_id on save

  // Form Field Trackers Aligned to Section 4.3 & 4.4 Specifications
  const [modalServiceName, setModalServiceName] = useState('');
  const [modalServiceBio, setModalServiceBio] = useState('');
  const [modalCustomServiceTitle, setModalCustomServiceTitle] = useState('');
  const [modalServiceProfileImage, setModalServiceProfileImage] = useState(''); 
  // Profile modal's own "Others" custom-category tracker (kept separate from the
  // Service modal's above, so opening one doesn't affect the other's state).
  const [isProfileCategoryOthersVisible, setIsProfileCategoryOthersVisible] = useState(false);
  const [profileCustomCategoryValue, setProfileCustomCategoryValue] = useState('');
  
  // Singleton Portfolio Repositories (Table 4.4 Schema Mapping)
  const [modalPortfolioUrlInput, setModalPortfolioUrlInput] = useState('');
  const [modalPortfolioImages, setModalPortfolioImages] = useState([]);
  // 🟢 Tracks only the URLs uploaded *during this modal session* (real server URLs
  // no longer carry a blob:/data: prefix the way local-only previews used to, so
  // we can't tell "new" from "already saved" just by inspecting the URL anymore).
  // Reset whenever the modal is opened; only these get POSTed to /portfolio/upload on save.
  const [modalNewPortfolioUrls, setModalNewPortfolioUrls] = useState([]);

  // --- 3. Dynamic Sub-Offers Matrix Configurations ---
  const [modalOffers, setModalOffers] = useState([
    { id: Date.now(), offer_name: '', price_min: '', price_max: '' }
  ]);

  // --- 4. Customer Enquiries Received Log (Table 4.5 Schema Mapping) ---
  const [enquiries, setEnquiries] = useState([]);

  // --- 5. Navigation Control Overlays and Calendar Parameters ---
  // Business hours the storefront can be booked in — 2-hour slots, midnight to midnight (next day). 12 slots total.
  const BUSINESS_HOURS = Array.from({ length: 12 }, (_, i) => i * 2); // [0,2,4,...,22]
  const formatHourSlotLabel = (h) => {
    const toClock = (hr) => {
      const normalized = hr % 24;
      const period = normalized >= 12 ? "PM" : "AM";
      const display = normalized % 12 === 0 ? 12 : normalized % 12;
      return `${display}:00 ${period}`;
    };
    return `${toClock(h)} - ${toClock(h + 2)}`;
  };
  // 📅 Provider-specific calendar availability.
  // The backend API contract currently does not expose the per-date/per-slot
  // availability routes this dashboard was previously calling. To keep the
  // calendar controls fully functional without changing any other dashboard
  // feature, availability is stored locally for the logged-in provider.
  //
  // busyHoursMap shape:
  // { "YYYY-MM-DD": [0, 2, 4, 6, ...] }
  const [busyHoursMap, setBusyHoursMap] = useState({});

  const getAvailabilityStorageKey = (providerId = profileForm.id) =>
    providerId ? `naaribazar_provider_availability_${providerId}` : null;

  // Compatibility with availability saved by the previous one-"a" key.
  const getLegacyAvailabilityStorageKey = (providerId = profileForm.id) =>
    providerId ? `naribazar_provider_availability_${providerId}` : null;

  const saveAvailabilityMap = (nextMap) => {
    const storageKey = getAvailabilityStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextMap));

      // Same-tab notification. The browser "storage" event only fires in
      // other tabs/windows, so this custom event keeps the public profile
      // synchronized when both views are inside the same SPA session.
      window.dispatchEvent(
        new CustomEvent("naaribazar-availability-updated", {
          detail: {
            providerId: Number(profileForm.id),
            map: nextMap,
          },
        })
      );
    } catch (error) {
      console.error("Failed to save calendar availability:", error);
    }
  };

  // Load saved availability for this provider.
  useEffect(() => {
    if (!profileForm.id) return;

    const storageKey = getAvailabilityStorageKey(profileForm.id);
    const legacyStorageKey =
      getLegacyAvailabilityStorageKey(profileForm.id);

    try {
      const canonicalSaved = localStorage.getItem(storageKey);
      const legacySaved = localStorage.getItem(legacyStorageKey);
      const saved = canonicalSaved || legacySaved;

      if (!saved) {
        setBusyHoursMap({});
        return;
      }

      const parsed = JSON.parse(saved);
      const normalized =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};

      setBusyHoursMap(normalized);

      // Move old saved availability to the canonical key used by Profile.
      if (!canonicalSaved && legacySaved) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(normalized)
        );
      }
    } catch (error) {
      console.error("Failed to load saved calendar availability:", error);
      setBusyHoursMap({});
    }
  }, [profileForm.id]);

  // Keep the dashboard synchronized if availability changes in another tab.
  useEffect(() => {
    if (!profileForm.id) return undefined;

    const storageKey = getAvailabilityStorageKey(profileForm.id);
    const legacyStorageKey =
      getLegacyAvailabilityStorageKey(profileForm.id);

    const handleStorageChange = (event) => {
      if (
        event.key !== storageKey &&
        event.key !== legacyStorageKey
      ) return;

      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : {};
        setBusyHoursMap(
          parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : {}
        );
      } catch (error) {
        console.error("Failed to sync availability from another tab:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [profileForm.id]);
  const [selectedEditDate, setSelectedEditDate] = useState(null);

  // 📅 Controls whether the Store Availability Calendar is expanded or collapsed.
  // Closed by default so the provider dashboard stays compact and easy to scan.
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => {
    const [y, m] = getISTTodayDateString().split("-");
    return new Date(Number(y), Number(m) - 1, 1);
  });
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [, forceIstClockTick] = useState(0); // dummy state — re-renders the calendar so "today" keeps up with real IST time even if left open overnight

  // Recheck the IST date once a minute; if the day has rolled over, force a re-render so today's cell greys out automatically.
  useEffect(() => {
    let lastSeenISTDate = getISTTodayDateString();
    const intervalId = setInterval(() => {
      const nowISTDate = getISTTodayDateString();
      if (nowISTDate !== lastSeenISTDate) {
        lastSeenISTDate = nowISTDate;
        forceIstClockTick((tick) => tick + 1);
      }
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Availability changes are persisted by the three calendar handlers below.

  // --- Auth Guard + Real Profile Fetch ---
  // Only a logged-in provider should see this page; pull their id from the
  // session Login.jsx wrote to localStorage and load their real record.
  useEffect(() => {
    const role = localStorage.getItem('role');
    const providerId = localStorage.getItem('provider_id');

    if (role !== 'provider' || !providerId) {
      alert('Please login as a service provider to view your dashboard.');
      navigate('/login');
      return;
    }

    setIsProfileLoading(true);
    api.get(`/providers/${providerId}`)
      .then(res => {
        const providerData = extractProviderPayload(res);

        setProfileForm(prev => ({
          ...prev,
          ...providerData,
          status: normalizeProviderStatus(providerData.status),
          rejection_reason:
            normalizeProviderStatus(providerData.status) === "rejected"
              ? (providerData.rejection_reason || "")
              : "",
        }));
      })
      .catch(err => {
        console.error('Failed to load provider profile:', err);
        alert('Could not load your profile. Please login again.');
        navigate('/login');
      })
      .finally(() => setIsProfileLoading(false));
  }, [navigate]);

  // --- Categories: always fetched from backend so Admin-added categories
  // immediately become available in Add Service and View/Edit Details. ---
  const loadCategories = () => {
    return api.get('/categories/')
      .then(res => {
        const categoryData = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);

        setCategoriesFull(categoryData);
        setDbCategoriesList(categoryData.map(c => c.name));
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // --- Real Services + Portfolio Images + Sub-Offers + Enquiries Fetch ---
  // MySQL TINYINT(1) can come back as true/false, 1/0, or sometimes "1"/"0".
  // Never use `value !== false` for this field because numeric 0 !== false is true.
  const normalizeAvailabilityFlag = (value, fallback = true) => {
    if (value === true || value === 1 || value === "1") return true;
    if (value === false || value === 0 || value === "0") return false;
    return fallback;
  };

  // TODO (next step): reviews don't have a backend table yet, so they
  // default to empty here until that endpoint exists.
  const loadServices = (providerId) => {
    api.get(`/services/provider/${providerId}`)
      .then(async (res) => {
        const rawServices = res.data;
        const withPortfolios = await Promise.all(
          rawServices.map(async (svc) => {
            try {
              const [
                portRes,
                offersRes,
                reviewsRes,
              ] = await Promise.all([
                api.get(`/portfolio/service/${svc.id}`),
                api.get(`/offers/service/${svc.id}`),
                api.get(`/reviews/service/${svc.id}`),
              ]);

              const reviewsPayload =
                reviewsRes.data?.data || [];

              return {
                ...svc,
                // Keep the exact DB state after reload/navigation.
                is_item_available: normalizeAvailabilityFlag(
                  svc.is_item_available,
                  true
                ),
                portfolio_images:
                  (portRes.data?.data || []).map(
                    (item) => item.image_url
                  ),
                offers: Array.isArray(
                  offersRes.data?.data ??
                    offersRes.data
                )
                  ? (
                      offersRes.data?.data ??
                      offersRes.data
                    )
                  : [],
                reviews: Array.isArray(reviewsPayload)
                  ? reviewsPayload
                  : [],
                review_summary: {
                  average_rating: Number(
                    reviewsRes.data?.summary
                      ?.average_rating || 0
                  ),
                  total_reviews: Number(
                    reviewsRes.data?.summary
                      ?.total_reviews || 0
                  ),
                },
              };
            } catch (err) {
              console.error(`Failed to load portfolio/offers for service ${svc.id}:`, err);
              return {
                ...svc,
                // Even when portfolio/offers/reviews fail, preserve the service toggle
                // value returned by GET /services/provider/:providerId.
                is_item_available: normalizeAvailabilityFlag(
                  svc.is_item_available,
                  true
                ),
                portfolio_images: [],
                offers: [],
                reviews: [],
                review_summary: {
                  average_rating: 0,
                  total_reviews: 0,
                },
              };
            }
          })
        );
        setServices(withPortfolios);
      })
      .catch(err => console.error('Failed to load services:', err));
  };

  useEffect(() => {
    const providerId = localStorage.getItem('provider_id');
    if (!providerId) return;

    loadServices(providerId);

    api.get(`/enquiries/provider/${providerId}`)
      .then(res => setEnquiries(res.data))
      .catch(err => console.error('Failed to load enquiries:', err));
  }, [profileForm.id]);

  // Refresh provider and service data whenever the provider returns to this tab
  // or an admin updates the provider from another browser tab.
  useEffect(() => {
    const providerId = localStorage.getItem('provider_id');
    if (!providerId) return undefined;

    const refreshProviderDashboardData = () => {
      api.get(`/providers/${providerId}`)
        .then((res) => {
          const providerData = extractProviderPayload(res);

          setProfileForm((previous) => ({
            ...previous,
            ...providerData,
            status: normalizeProviderStatus(providerData.status),
            rejection_reason:
              normalizeProviderStatus(providerData.status) === "rejected"
                ? (providerData.rejection_reason || "")
                : "",
          }));
        })
        .catch((err) =>
          console.error('Failed to refresh provider profile:', err)
        );

      loadServices(providerId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProviderDashboardData();
      }
    };

    const handleStorageUpdate = (event) => {
      if (event.key !== 'provider_profile_updated_at') return;

      try {
        const update = JSON.parse(event.newValue || '{}');

        if (Number(update.provider_id) === Number(providerId)) {
          refreshProviderDashboardData();
        }
      } catch (error) {
        console.error('Unable to read provider update notification:', error);
      }
    };

    const handleSameTabUpdate = (event) => {
      if (Number(event.detail?.providerId) === Number(providerId)) {
        refreshProviderDashboardData();
      }
    };

    window.addEventListener('focus', refreshProviderDashboardData);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('provider-profile-updated', handleSameTabUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshProviderDashboardData);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('provider-profile-updated', handleSameTabUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  // --- 📊 DYNAMIC LIVE METRICS COMPUTATION ENGINE ---
  // Step 1: Accumulate every individual review object nested across all listed provider services
  const allProviderReviews = services.reduce((acc, currentService) => {
    if (currentService.reviews && Array.isArray(currentService.reviews)) {
      return [...acc, ...currentService.reviews];
    }
    return acc;
  }, []);

  // Total real review count across all services.
  const totalProviderReviewsCount =
    allProviderReviews.length;

  // Step 3: Compute the exact math average of all reviews from all combined services
  const totalReviewsRatingSum = allProviderReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageReviewRatingScore = allProviderReviews.length > 0 
    ? (totalReviewsRatingSum / allProviderReviews.length).toFixed(1) 
    : "0.0";

  // --- Real Image Upload Helper ---
  // ⚠️ ASSUMPTION: no upload endpoint was visible anywhere in the files provided,
  // so this calls POST /upload with multipart/form-data (field name "image") and
  // expects back { url: "https://...permanent-file-url..." }. If your backend's
  // actual route/field/response-shape differs, update just this one function —
  // everything below it (profile image, service cover image, portfolio images)
  // already calls through it and doesn't need to change.
  const uploadImageToServer = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.url;
};

  // --- Image File Selection Processing Hooks ---
  // Used for single-image fields (provider avatar, service cover image).
  // Shows an instant local preview while the real upload happens in the background,
  // then swaps the preview for the real server URL once the upload completes.
  const handleProcessSingleImageSelection = async (e, targetImageStateSetter) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    const file = rawFiles[0];
    const previewUrl = URL.createObjectURL(file);
    targetImageStateSetter(previewUrl); // instant preview only — not saved anywhere yet
    e.target.value = '';

    try {
      const uploadedUrl = await uploadImageToServer(file);
      targetImageStateSetter(uploadedUrl); // replace preview with the real, permanent URL
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Could not upload this image. Please try again.');
      targetImageStateSetter('');
    }
  };

  // Used for multi-image fields (portfolio gallery). Uploads every selected file,
  // and only adds a file to the list once its real server URL comes back.
  const handleProcessLocalGallerySelection = async (e, targetImageStateSetter) => {
    const rawFileList = e.target.files;
    if (!rawFileList || rawFileList.length === 0) return;
    const files = Array.from(rawFileList);
    e.target.value = '';

    const uploadResults = await Promise.allSettled(files.map(uploadImageToServer));
    const uploadedUrls = uploadResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const failedCount = uploadResults.length - uploadedUrls.length;
    if (failedCount > 0) {
      alert(`${failedCount} image(s) failed to upload and were skipped.`);
    }

    targetImageStateSetter(prev => {
      const combined = [...(prev || []), ...uploadedUrls];
      return combined.slice(0, 12);
    });
    setModalNewPortfolioUrls(prev => [...prev, ...uploadedUrls]);
  };

  // --- Core Personal Profiles Managers ---
  const openEditProfileModal = () => {
    setTempProfileForm({ ...profileForm });
    setIsProfileCategoryOthersVisible(false);
    setProfileCustomCategoryValue('');
    setIsProfileModalOpen(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempProfileForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProfileFormSubmit = (e) => {
    e.preventDefault();

    const fullName = (tempProfileForm.full_name || '').trim();
    const phone = (tempProfileForm.phone || '').trim();
    const city = (tempProfileForm.city || '').trim();
    const pinCode = (tempProfileForm.pin_code || '').trim();

    if (!fullName) {
      alert('Please enter your full name.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert('Phone number must contain exactly 10 digits.');
      return;
    }

    if (!city) {
      alert('Please enter your city.');
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      alert('PIN code must contain exactly 6 digits.');
      return;
    }

    api.put(`/providers/${profileForm.id}`, {
      full_name: fullName,
      phone,
      city,
      pin_code: pinCode,
    })
      .then(res => {
        const updatedProvider = res.data?.provider || res.data || {};
        setProfileForm(prev => ({
          ...prev,
          ...updatedProvider,
          full_name: fullName,
          phone,
          city,
          pin_code: pinCode,
        }));
        setIsProfileModalOpen(false);
      })
      .catch(err => {
        console.error('Failed to update profile:', err);
        alert('Could not save profile changes. Please try again.');
      });
  };

  // --- Dynamic Inventory Controllers ---
  // Shared with the provider-level cascade below — persists one service's availability.
  const persistServiceAvailability = (service, nextAvailable) => {
    return api.put(`/services/${service.id}`, {
      category_id: service.category_id,
      service_name: service.service_name,
      custom_service_title: service.custom_service_title,
      service_bio: service.service_bio,
      service_profile_image: service.service_profile_image,
      is_item_available: Boolean(nextAvailable),
      service_mode: service.service_mode,
    });
  };

  const handleToggleIndividualServiceAvailability = async (
    serviceId,
    nextAvailable
  ) => {
    const service = services.find(
      (item) => Number(item.id) === Number(serviceId)
    );

    if (!service) return;

    const previousAvailable = normalizeAvailabilityFlag(
      service.is_item_available,
      true
    );

    // Update the switch immediately in the UI.
    setServices((previousServices) =>
      previousServices.map((item) =>
        Number(item.id) === Number(serviceId)
          ? {
              ...item,
              is_item_available: Boolean(nextAvailable),
            }
          : item
      )
    );

    try {
      // This writes the OFF/ON state into the existing services table.
      await persistServiceAvailability(service, nextAvailable);

      // Re-read the service list from the backend so the UI exactly matches
      // the value stored in the database.
      const providerId =
        service.provider_id ||
        profileForm.id ||
        localStorage.getItem("provider_id");

      if (providerId) {
        loadServices(providerId);
      }
    } catch (err) {
      console.error("Failed to update service availability:", err);

      // Roll back only if the database update failed.
      setServices((previousServices) =>
        previousServices.map((item) =>
          Number(item.id) === Number(serviceId)
            ? {
                ...item,
                is_item_available: previousAvailable,
              }
            : item
        )
      );

      alert("Could not update service status. Please try again.");
    }
  };

  const openAddServiceModal = () => {
    // Refresh categories every time this modal opens.
    // Any category added by Admin (for example Hospitality) appears here automatically.
    loadCategories();

    setIsEditingService(false);
    setActiveServiceId(null);
    setModalServiceName('');
    setModalCustomServiceTitle('');
    setModalServiceBio('');
    setModalServiceProfileImage('');
    setModalPortfolioImages([]);
    setModalNewPortfolioUrls([]);
    setModalOffers([{ id: Date.now(), offer_name: '', price_min: '', price_max: '' }]);
    setIsServiceModalOpen(true); 
  };

  const openEditServiceModal = (service) => {
    // Refresh the same Admin-managed category list before View/Edit Details opens.
    loadCategories();

    setIsEditingService(true);
    setActiveServiceId(service.id);
    setModalServiceName(service.service_name);
    setModalCustomServiceTitle(service.custom_service_title || '');
    setModalServiceBio(service.service_bio || '');
    setModalServiceProfileImage(service.service_profile_image || '');
    setModalPortfolioImages(service.portfolio_images || []);
    setModalNewPortfolioUrls([]); // existing images are already saved — only track new uploads from here on
    setModalOffers((service.offers || []).map(o => ({ ...o })));
    setIsServiceModalOpen(true);
  };

  const handleCategoryDropdownSelection = (e) => {
    setModalServiceName(e.target.value);
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
    const removedUrl = modalPortfolioImages[index];
    setModalPortfolioImages(modalPortfolioImages.filter((_, i) => i !== index));
    setModalNewPortfolioUrls(prev => prev.filter(url => url !== removedUrl));
  };
  const handlePublishServicesForm = (e) => {
    e.preventDefault();
    const finalizedCategoryName = modalServiceName.trim();

    // --- 🔒 Compulsory Field Validation ---
    // Every section of the Service Group form must be filled in before publishing.
    if (!modalServiceName) {
      alert("Please select a Category Name.");
      return;
    }
    if (!modalServiceProfileImage) {
      alert("Please select a Service Profile Cover Image.");
      return;
    }
    if (!modalCustomServiceTitle.trim()) {
      alert("Please enter a Service Title.");
      return;
    }
    if (!modalServiceBio.trim()) {
      alert("Please enter a Service Description.");
      return;
    }
    if (modalPortfolioImages.length === 0) {
      alert("Please add at least 1 Service Portfolio Sample image.");
      return;
    }
    if (
      modalOffers.length === 0 ||
      modalOffers.some(
        (o) => !o.offer_name || !o.offer_name.trim() || o.price_min === '' || o.price_max === ''
      )
    ) {
      alert("Please fill in at least 1 complete Sub-Offer Package (title, min price, and max price).");
      return;
    }

    const matchedCategory = categoriesFull.find(c => c.name === finalizedCategoryName);

    const payload = {
      category_id: matchedCategory ? matchedCategory.id : null,
      service_name: finalizedCategoryName,
      custom_service_title: modalCustomServiceTitle.trim(),
      service_bio: modalServiceBio.trim(),
      service_profile_image: modalServiceProfileImage,
      is_item_available: true,
    };

    const savePortfolioImages = (serviceId) => {
      // Only link the images uploaded during *this* modal session (modalNewPortfolioUrls) —
      // images that were already on the service (loaded from the backend when editing)
      // are already saved and shouldn't be re-posted.
      return Promise.all(
        modalNewPortfolioUrls.map((img, idx) =>
          api.post('/portfolio/upload', { service_id: serviceId, image_url: img, sort_order: idx })
            .catch(err => console.error('Failed to save portfolio image:', err))
        )
      );
    };

    // --- Sync Sub-Offer Packages to the backend ---
    // Simplest reliable approach: wipe out whatever sub-offers this service
    // already had (if editing) and recreate them fresh from modalOffers.
    // Avoids having to tell apart a real DB id from a temp Date.now() id
    // for brand-new rows added in this session.
    const saveOffers = (serviceId) => {
      const existingService = services.find(s => s.id === serviceId);
      const existingOfferIds = (existingService?.offers || []).map(o => o.id);

      const deleteOld = Promise.all(
        existingOfferIds.map(offerId =>
          api.delete(`/offers/${offerId}`)
            .catch(err => console.error('Failed to delete old sub-offer:', err))
        )
      );

      return deleteOld.then(() =>
        Promise.all(
          modalOffers.map(o =>
            api.post('/offers/', {
              service_id: serviceId,
              offer_name: o.offer_name.trim(),
              price_min: o.price_min === '' ? null : Number(o.price_min),
              price_max: o.price_max === '' ? null : Number(o.price_max),
            }).catch(err => console.error('Failed to save sub-offer:', err))
          )
        )
      );
    };

    const providerId = localStorage.getItem('provider_id');

    const request = isEditingService
      ? api.put(`/services/${activeServiceId}`, payload)
      : api.post('/services/', { ...payload, provider_id: providerId });

    request
      .then((res) => {
        const savedServiceId = isEditingService ? activeServiceId : res.data.data.id;
        return Promise.all([
          savePortfolioImages(savedServiceId),
          saveOffers(savedServiceId),
        ]);
      })
      .then(() => {
        loadServices(providerId);
        setModalNewPortfolioUrls([]);
        setIsServiceModalOpen(false);
      })
      .catch(err => {
        console.error('Failed to save service:', err);
        alert('Could not save this service. Please check the details and try again.');
      });
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Are you sure you want to remove this service?")) {
      api.delete(`/services/${id}`)
        .then(() => setServices(services.filter(s => s.id !== id)))
        .catch(err => {
          console.error('Failed to delete service:', err);
          alert('Could not delete this service. Please try again.');
        });
    }
  };

  // --- Inline Calendar Traversal Engine ---
  // A day's status is derived from how many of its business hours are marked busy.
  const getDayAvailabilityStatus = (dateString) => {
    const busyHoursForDay = busyHoursMap[dateString] || [];
    if (busyHoursForDay.length === 0) return "available";
    if (busyHoursForDay.length >= BUSINESS_HOURS.length) return "busy";
    return "partial";
  };

  const toggleHourBusyStatus = (dateString, hour) => {
    setBusyHoursMap((prev) => {
      const existing = prev[dateString] || [];

      const nextHours = existing.includes(hour)
        ? existing.filter((h) => h !== hour)
        : [...existing, hour].sort((a, b) => a - b);

      const updated = { ...prev };

      if (nextHours.length === 0) {
        delete updated[dateString];
      } else {
        updated[dateString] = nextHours;
      }

      saveAvailabilityMap(updated);
      return updated;
    });
  };

  const markWholeDayBusy = (dateString) => {
    setBusyHoursMap((prev) => {
      const updated = {
        ...prev,
        [dateString]: [...BUSINESS_HOURS],
      };

      saveAvailabilityMap(updated);
      return updated;
    });
  };

  const markWholeDayAvailable = (dateString) => {
    setBusyHoursMap((prev) => {
      const updated = { ...prev };
      delete updated[dateString];

      saveAvailabilityMap(updated);
      return updated;
    });
  };

  const renderCalendarDaysGrid = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const todayISTString = getISTTodayDateString(); // recomputed on every render, so "today" always reflects real IST time
    const gridCells = [];
    
    const blankOffsets = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = 0; i < blankOffsets; i++) {
      gridCells.push(<div key={`blank-${i}`} className="calendar-day empty-cell"></div>);
    }
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayStatus = getDayAvailabilityStatus(dayStr);
      const isPastDate = dayStr < todayISTString; // string comparison works since both are zero-padded "YYYY-MM-DD"
      
      let cellClassName = "calendar-day actionable-day ";
      if (isPastDate) cellClassName += "day-past-completed";
      else if (dayStatus === "busy") cellClassName += "day-busy-red";
      else if (dayStatus === "partial") cellClassName += "day-partial-orange";
      else cellClassName += "day-available-green"; 

      gridCells.push(
        <div 
          key={dayStr} 
          className={cellClassName + (selectedEditDate === dayStr ? " day-selected-active" : "")} 
          onClick={() => { if (!isPastDate) setSelectedEditDate(selectedEditDate === dayStr ? null : dayStr); }}
          title={isPastDate ? "Completed Date (Locked)" : "Click to view/edit hourly availability"}
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

  const handleConfirmDeleteAccount = () => {
    api.delete(`/providers/${profileForm.id}`)
      .then(() => {
        // The backend now starts the 30-day deletion grace period here.
        // Log out only after that request is successfully saved.
        localStorage.clear();
        window.location.href = "/";
      })
      .catch(err => {
        console.error('Failed to delete provider account:', err);
        alert('Could not start account deletion. Please try again.');
      });
  };
  const handleLogoutAction = () => { setIsLogoutModalOpen(true); };
  const handleConfirmLogout = () => { localStorage.clear(); window.location.href = "/"; };

  const providerApprovalStatus =
    normalizeProviderStatus(profileForm.status);

  if (isProfileLoading) {
    return (
      <div className="dashboard-wrapper">
        <p className="caption" style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* 🌸 WELCOME BANNER — visual layer only; all existing dashboard logic stays unchanged */}
      <section className="provider-welcome-hero">
        <div className="provider-welcome-copy">
          <span className="provider-welcome-kicker">Welcome back,</span>
          <h1>
            {profileForm.full_name || "NariBazar Provider"}
            <span className="welcome-wave" aria-hidden="true"></span>
          </h1>
          <p>Let's grow your business with NariBazar.</p>
        </div>

        <div className="provider-hero-art" aria-hidden="true">
          <div className="hero-art-card hero-art-card-back">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="hero-art-card hero-art-card-front">
            <div className="hero-art-avatar">♥</div>
            <div className="hero-art-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="hero-art-chart">
            <span className="hero-chart-slice"></span>
          </div>
        </div>
      </section>

      {/* 📊 TOP SUMMARY STRIP */}
      <section className="dashboard-top-management-grid provider-overview-grid">
        <div className="stat-box provider-stat-card">
          <div className="provider-stat-icon reviews-icon" aria-hidden="true">✿</div>
          <div className="provider-stat-copy">
            <h3>{totalProviderReviewsCount}</h3>
            <p className="provider-stat-title">Total Reviews</p>
            <span className="provider-stat-note">{totalProviderReviewsCount > 0 ? "Customer feedback received" : "No reviews yet"}</span>
          </div>
        </div>

        <div className="stat-box provider-stat-card">
          <div className="provider-stat-icon rating-icon" aria-hidden="true">★</div>
          <div className="provider-stat-copy">
            <h3>{averageReviewRatingScore}</h3>
            <p className="provider-stat-title">Avg Review</p>
            <span className="provider-stat-note">{totalProviderReviewsCount > 0 ? "Based on your reviews" : "Be the first to get reviews"}</span>
          </div>
        </div>

        {/* 🛠️ Dynamic Verification Status & Rejection Panel Block */}
        <div className={`status-card provider-stat-card provider-status-summary status-${providerApprovalStatus}`}>
          <div className="provider-stat-icon status-icon" aria-hidden="true">
            {providerApprovalStatus === 'approved'
              ? '✓'
              : providerApprovalStatus === 'rejected'
              ? '✕'
              : '!'}
          </div>

          <div className="provider-stat-copy provider-status-copy">
            <p className="provider-stat-title">Profile Status</p>

            {providerApprovalStatus === 'approved' && (
              <>
                <h3 className="profile-state-heading">Verified</h3>
                <span className="provider-stat-note">
                  Your profile is live across NariBazar.
                </span>
              </>
            )}

            {providerApprovalStatus === 'pending' && (
              <>
                <h3 className="profile-state-heading pending-heading">Pending</h3>
                <span className="provider-stat-note">
                  Waiting for admin approval.
                </span>
              </>
            )}

            {providerApprovalStatus === 'rejected' && (
              <>
                <h3 className="profile-state-heading rejected-heading">Rejected</h3>
                <span className="provider-stat-note rejection-status-reason">
                  {profileForm.rejection_reason ||
                    "Please review your profile details."}
                </span>
              </>
            )}
          </div>
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
              <button type="button" className="btn-small-action" onClick={openEditProfileModal}>Edit Details</button>
            </div>
            
            <div className="profile-details-display-fields">
              <div className="detail-display-row personal-detail-row"><span className="detail-leading-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4.8 20c.7-3.1 3.5-5 7.2-5s6.5 1.9 7.2 5"/></svg></span><strong>Full Name</strong><span>{profileForm.full_name}</span></div>
              <div className="detail-display-row personal-detail-row"><span className="detail-leading-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7.4 3.8 5.3 5.1c-.8.5-1.2 1.5-.9 2.4 1.6 5.4 5.7 9.5 11.1 11.1.9.3 1.9-.1 2.4-.9l1.3-2.1c.4-.7.3-1.6-.3-2.1l-2.2-1.8c-.6-.5-1.4-.5-2 0l-1.3 1c-1.9-.9-3.4-2.4-4.3-4.3l1-1.3c.5-.6.5-1.4 0-2L9.5 3.9c-.5-.6-1.4-.7-2.1-.1Z"/></svg></span><strong>Phone Number</strong><span>{profileForm.phone}</span></div>
              <div className="detail-display-row personal-detail-row"><span className="detail-leading-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span><strong>Email Address</strong><span>{profileForm.email || "Not Stated"}</span></div>
              <div className="detail-display-row personal-detail-row"><span className="detail-leading-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg></span><strong>Location</strong><span>{profileForm.city}</span></div>
              <div className="detail-display-row personal-detail-row"><span className="detail-leading-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 10.2V6.8A5 5 0 0 1 12 2a5 5 0 0 1 5 4.8v3.4"/><path d="M8.5 10.2h7l1.4 3.2-4.9 7.1-4.9-7.1 1.4-3.2Z"/><circle cx="12" cy="13.6" r="1.2"/></svg></span><strong>PIN Code</strong><span>{profileForm.pin_code || "Not Stated"}</span></div>
              
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
                    onChange={(e) => {
                      const nextValue = e.target.checked;
                      const previousServices = services; // kept for rollback if the save fails
                      setProfileForm(prev => ({ ...prev, is_available: nextValue }));

                      // The master toggle cascades to every service in both
                      // directions: turning it OFF pauses every service, and
                      // turning it back ON resumes every service automatically.
                      // A visitor should never see a service card while the
                      // provider's own master switch is off, and every service
                      // should be bookable again the instant the provider
                      // flips it back to "available" — without having to
                      // revisit each service individually.
                      setServices(prev => prev.map(s => ({ ...s, is_item_available: nextValue })));

                      api.put(`/providers/${profileForm.id}`, { is_available: nextValue })
                        .then(() => {
                          previousServices.forEach(service => {
                            persistServiceAvailability(service, nextValue).catch(err =>
                              console.error(`Failed to ${nextValue ? "resume" : "pause"} service ${service.id}:`, err)
                            );
                          });
                        })
                        .catch(err => {
                          console.error('Failed to update availability:', err);
                          setProfileForm(prev => ({ ...prev, is_available: !nextValue }));
                          setServices(previousServices);
                          alert('Could not update booking status. Please try again.');
                        });
                    }}
                    className="native-hidden-checkbox"
                  />
                  <span className="custom-styled-toggle-box-indicator"></span>
                </label>
              </div>
            </div>
          </section>

          {/* =========================================================
              📅 COLLAPSIBLE STORE AVAILABILITY CALENDAR
              ========================================================= */}
          <section
            className={`dashboard-card calendar-card-inline-section ${
              isCalendarOpen ? "calendar-expanded" : "calendar-collapsed"
            }`}
          >
            {/* Compact dropdown header — calendar is closed by default */}
            <button
              type="button"
              className="calendar-dropdown-trigger"
              onClick={() => setIsCalendarOpen((previous) => !previous)}
              aria-expanded={isCalendarOpen}
              aria-controls="provider-availability-calendar"
            >
              <span className="calendar-dropdown-title">
                <span className="calendar-dropdown-icon" aria-hidden="true"></span>
                Store Availability Calendar
              </span>

              <span
                className={`calendar-dropdown-arrow ${isCalendarOpen ? "is-open" : ""}`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {/* Existing calendar functionality stays unchanged inside the dropdown */}
            {isCalendarOpen && (
              <div
                id="provider-availability-calendar"
                className="calendar-dropdown-content"
              >
                <div className="calendar-header-strip">
                  <div className="calendar-month-section">
                    <div className="calendar-month-traversal-control-panel">
                      <button
                        type="button"
                        className="btn-calendar-nav-arrow"
                        onClick={handleNavigateToPreviousMonth}
                        aria-label="Previous month"
                      >
                        ◀
                      </button>

                      <span className="calendar-active-month-heading-label">
                        {currentMonthYearStringDisplay}
                      </span>

                      <button
                        type="button"
                        className="btn-calendar-nav-arrow"
                        onClick={handleNavigateToNextMonth}
                        aria-label="Next month"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  <div className="calendar-legends-wrapper-row">
                    <div className="legend-item">
                      <span className="legend-box label-completed"></span>
                      <span className="caption">Past</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-box label-avail-green"></span>
                      <span className="caption">Available</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-box label-partial-orange"></span>
                      <span className="caption">Partially Busy</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-box label-busy-red"></span>
                      <span className="caption">Busy</span>
                    </div>
                  </div>
                </div>

                <div className="calendar-weekdays-grid">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="weekday-label">
                      <strong>{day}</strong>
                    </div>
                  ))}
                </div>

                <div className="calendar-days-matrix-grid">
                  {renderCalendarDaysGrid()}
                </div>

                <p className="calendar-hint-caption">
                  Click any upcoming date to view and edit its hourly slots.
                </p>
              </div>
            )}
          </section>
          {/* Customer Communications Incoming Inbox Panel */}
          <section className="dashboard-card customer-enquiries-card">
            <h2>Customer Enquiries Received</h2>

            {services.length === 0 ? (
              <div className="empty-enquiries">
                <p className="caption">
                  Add a service first to receive service-specific enquiries.
                </p>
              </div>
            ) : (
              <div className="enquiry-stack">
                {services.map((service) => {
                  const serviceEnquiries = enquiries.filter(
                    (enquiry) =>
                      Number(enquiry.service_id) === Number(service.id)
                  );

                  const serviceTitle =
                    service.custom_service_title ||
                    service.service_name ||
                    `Service ${service.id}`;

                  return (
                    <div
                      key={`service-enquiries-${service.id}`}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "12px",
                        marginBottom: "12px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>{serviceTitle} Enquiries</strong>
                        <span className="caption">
                          {serviceEnquiries.length} received
                        </span>
                      </div>

                      {serviceEnquiries.length === 0 ? (
                        <div className="empty-enquiries">
                          <p className="caption">
                            No enquiries received for this service yet.
                          </p>
                        </div>
                      ) : (
                        serviceEnquiries.map((enquiry) => (
                          <div
                            key={enquiry.id}
                            className="enquiry-row-item"
                          >
                            <div className="enquiry-meta">
                              <strong>
                                {enquiry.customer_name}
                              </strong>{" "}
                              <span className="phone-caption-tracker">
                                {enquiry.customer_phone}
                              </span>
                            </div>
                            <p className="enquiry-msg">
                              "{enquiry.message}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN STACK MATRIX */}
        <div className="right-column">
          
          {/* Services Offered Tiered Form Accumulator Module */}
          <section className="dashboard-card services-dashboard-card">
            <div className="services-section-header">
              <h2>Services &amp; Offers</h2>
              <button type="button" className="btn-primary" onClick={() => openAddServiceModal()}>+ Add Service Group</button>
            </div>
            {services.length === 0 && <p className="warning-text">Publish at least 1 service group to appear live </p>}
            
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
                      <span
                        className={`service-item-toggle-status-text ${
                          normalizeAvailabilityFlag(
                            service.is_item_available,
                            true
                          )
                            ? "status-active-green"
                            : "status-paused-red"
                        }`}
                      >
                        {normalizeAvailabilityFlag(
                          service.is_item_available,
                          true
                        )
                          ? "Active"
                          : "Paused"}
                      </span>

                      <label className="checkbox-switch-container-label">
                        <input
                          type="checkbox"
                          checked={normalizeAvailabilityFlag(
                            service.is_item_available,
                            true
                          )}
                          onChange={(e) =>
                            handleToggleIndividualServiceAvailability(
                              service.id,
                              e.target.checked
                            )
                          }
                          className="native-hidden-checkbox"
                        />
                        <span className="custom-styled-toggle-box-indicator size-small"></span>
                      </label>
                    </div>
                    
                    <div className="parent-actions-group-links-row">
                      <button
                        type="button"
                        className="btn-service-action-edit"
                        onClick={() =>
                          navigate(
                            `/provider-profile/${service.provider_id || profileForm.id}?service=${service.id}`
                          )
                        }
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        className="btn-service-action-edit"
                        onClick={() => openEditServiceModal(service)}
                      >
                        View/Edit Details
                      </button>

                      <button
                        type="button"
                        className="btn-service-action-delete"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Delete Service
                      </button>
                    </div>
                  </div>
                  
                  {/* Reflected Service Summary Description View Box */}
                  <div className="detail-display-row flex-column-start">
                    <strong className="field-group-desc-label">Bio:</strong>
                    <p className="service-desc-text-p">{service.service_bio || "No summary overview specified summary layout lane yet."}</p>
                  </div>

                  {/* Reflected Portfolio Gallery View Box Matrix List Wrapper */}
                  <div className="portfolio-row-view-container">
                    <strong className="field-group-desc-label">Portfolio Media Samples ({(service.portfolio_images || []).length}/12):</strong>
                    {(!service.portfolio_images || service.portfolio_images.length === 0) ? (
                      <p className="caption italic-font">No portfolio snapshots attached specifically for this lane.</p>
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
            <h3>Update Storefront Details</h3>
            <form onSubmit={handleProfileFormSubmit} className="modal-form-element">
              <div className="modal-input-block-container">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={tempProfileForm.full_name || ""}
                  onChange={handleProfileInputChange}
                  required
                />
              </div>

              <div className="modal-input-block-container">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={tempProfileForm.phone || ""}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    setIsPhoneChangeNoticeOpen(true);
                  }}
                  onClick={() => setIsPhoneChangeNoticeOpen(true)}
                  inputMode="numeric"
                  maxLength={10}
                  style={{ cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                />
              </div>

              <div className="modal-input-block-container">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={tempProfileForm.email || ""}
                  readOnly
                  onFocus={(e) => {
                    e.target.blur();
                    setIsEmailChangeNoticeOpen(true);
                  }}
                  onClick={() => setIsEmailChangeNoticeOpen(true)}
                  style={{ cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                />
              </div>

              <div className="modal-input-block-container">
                <label>City Hub Location</label>
                <input
                  type="text"
                  name="city"
                  value={tempProfileForm.city || ""}
                  onChange={handleProfileInputChange}
                  required
                />
              </div>

              <div className="modal-input-block-container">
                <label>PIN Code</label>
                <input
                  type="text"
                  name="pin_code"
                  value={tempProfileForm.pin_code || ""}
                  onChange={handleProfileInputChange}
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <div className="modal-actions-wrapper" style={{ borderTop: 'none' }}>
                <button type="button" className="btn-small-cancel" onClick={() => setIsProfileModalOpen(false)}>Discard</button>
                <button type="submit" className="btn-primary">Save Profile Setup</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHONE NUMBER CHANGE NOT ALLOWED NOTICE */}
      {isPhoneChangeNoticeOpen && (
        <div className="modal-overlay" onClick={() => setIsPhoneChangeNoticeOpen(false)}>
          <div className="modal-container text-center-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn-modal-close-x" onClick={() => setIsPhoneChangeNoticeOpen(false)}>✕</button>
            <h3 className="risk-header-title">Phone Number Can't Be Changed Here</h3>
            <p className="risk-warning-body-text">
              Your phone number can't be changed from the provider dashboard directly.
              Only the admin can change it. Please contact the NariBazar team if you need to update it.
            </p>
            <div className="modal-actions-wrapper dual-grid-actions-wrapper">
              <button type="button" className="btn-small-cancel" onClick={() => setIsPhoneChangeNoticeOpen(false)}>Close</button>
              <button type="button" className="btn-primary" onClick={() => { setIsPhoneChangeNoticeOpen(false); setIsProfileModalOpen(false); navigate('/contact'); }}>
                Contact NariBazar Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL CHANGE NOT ALLOWED NOTICE */}
      {isEmailChangeNoticeOpen && (
        <div className="modal-overlay" onClick={() => setIsEmailChangeNoticeOpen(false)}>
          <div className="modal-container text-center-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn-modal-close-x" onClick={() => setIsEmailChangeNoticeOpen(false)}>✕</button>
            <h3 className="risk-header-title">Email Can't Be Changed Here</h3>
            <p className="risk-warning-body-text">
              Your email is verified and used for login, so it can't be changed from the dashboard directly.
              Please contact the NariBazar team if you need to update it.
            </p>
            <div className="modal-actions-wrapper dual-grid-actions-wrapper">
              <button type="button" className="btn-small-cancel" onClick={() => setIsEmailChangeNoticeOpen(false)}>Close</button>
              <button type="button" className="btn-primary" onClick={() => { setIsEmailChangeNoticeOpen(false); setIsProfileModalOpen(false); navigate('/contact'); }}>
                Contact NariBazar Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 POPUP 2: DETAILED INTERACTIVE SERVICE GROUP EDITOR MODAL OVERLAY */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container multi-offer-modal">
            {/* Upper Right Explicit Close Button */}
            <button type="button" className="btn-modal-close-x" onClick={() => setIsServiceModalOpen(false)}>✕</button>
            
            <h3>{isEditingService ? 'Edit Changes Form - Service Category Row' : 'Service Offered Group Configuration'}</h3>
            
            {/* Scrollable Form Box Container */}
            <div className="modal-scrollable-content-body">
              <form onSubmit={handlePublishServicesForm} className="modal-form-element" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                <div className="modal-split-fields-grid" style={{ marginBottom: '4px' }}>
                  <div className="modal-input-block-container">
                    <label style={{ marginBottom: '8px', display: 'block' }}>Category Name *</label>
                    <select value={modalServiceName} onChange={handleCategoryDropdownSelection} required className="modal-select-field-element">
                      <option value="" disabled>-- Select core lane --</option>
                      {dbCategoriesList
                        .filter((item) => item.trim().toLowerCase() !== 'others')
                        .map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                      <option value="Others">Others ...</option>
                    </select>
                  </div>
                  
                  <div className="modal-input-block-container">
                    <label style={{ marginBottom: '8px', display: 'block' }}>Service Profile Cover Image *</label>
                    <div className="single-photo-uploader-row">
                      {modalServiceProfileImage && (
                        <img src={modalServiceProfileImage} alt="Lookup preview" className="single-photo-preview-thumbnail" />
                      )}
                      <button type="button" onClick={() => document.getElementById('serviceCategoryProfileCoverFileTrigger').click()} className="btn-select-photo-trigger">
                        Select Photo
                      </button>
                      <input type="file" id="serviceCategoryProfileCoverFileTrigger" accept="image/*" className="hidden-file-input" onChange={(e) => handleProcessSingleImageSelection(e, setModalServiceProfileImage)} />
                    </div>
                  </div>
                </div>

                <div className="modal-input-block-container service-title-input-block">
                  <label style={{ marginBottom: '8px', display: 'block' }}>Service Title *</label>
                  <input type="text" placeholder="e.g., Royal Rajasthani Mehndi Studio" value={modalCustomServiceTitle} onChange={e => setModalCustomServiceTitle(e.target.value)} required />
                </div>

                <div className="modal-input-block-container" style={{ marginTop: '0' }}>
                  <label style={{ marginBottom: '8px', display: 'block' }}>Service Description *</label>
                  <textarea placeholder="Provide unique training parameters or scope specific details summary overview text..." value={modalServiceBio} onChange={e => setModalServiceBio(e.target.value)} required className="modal-textarea-fixed-height" />
                </div>

                {/* --- MULTI PORTFOLIO UPLOADER ROW --- */}
                <div className="modal-input-block-container" style={{ marginTop: '0' }}>
                  <label className="portfolio-uploader-title-label" style={{ marginBottom: '10px', display: 'block' }}>
                    Service Portfolio Samples * ({modalPortfolioImages.length}/12)
                  </label>
                  <div className="mock-upload-field-box" onClick={() => document.getElementById('categoryGridMultiFilesTrigger').click()}>
                    <p className="mock-upload-field-box-text">Click to pick multiple portfolio images from gallery</p>
                  </div>
                  <input type="file" id="categoryGridMultiFilesTrigger" multiple accept="image/*" className="hidden-file-input" onChange={(e) => handleProcessLocalGallerySelection(e, setModalPortfolioImages)} />
                  
                  {modalPortfolioImages.length > 0 && (
                    <div className="modal-portfolio-preview-scroller-box" style={{ marginTop: '12px' }}>
                      {modalPortfolioImages.map((img, idx) => (
                        <div key={idx} className="portfolio-preview-thumb-wrapper">
                          <img src={img} alt="Portfolio snapshot lookup item" />
                          <button type="button" onClick={() => handleRemovePortfolioImageInForm(idx)} className="btn-portfolio-remove-round">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="offers-fields-scroll-area" style={{ marginTop: '0', gap: '16px' }}>
                  <label className="portfolio-uploader-title-label" style={{ marginBottom: '4px', display: 'block' }}>Sub-Offer Packages * (at least 1 required)</label>
                  {modalOffers.map((offer, index) => (
                    <div key={offer.id || index} className="offer-inputs-row-box">
                      <div className="offer-inputs-row-header-strip" style={{ marginBottom: '10px' }}>
                        <h4>Sub-Offer Package Option #{index + 1}</h4>
                        {modalOffers.length > 1 && <button type="button" className="remove-row-btn" onClick={() => removeOfferFieldFromForm(index)}>✕ Remove</button>}
                      </div>
                      <div className="modal-input-block-container" style={{ marginTop: '0', marginBottom: '10px' }}>
                        <input type="text" placeholder="Package Title Name" value={offer.offer_name || ''} onChange={e => handleOfferFieldChange(index, 'offer_name', e.target.value)} required />
                      </div>
                      <div className="price-inputs-split-row">
                        <input type="number" placeholder="Min Price (₹)" value={offer.price_min || ''} onChange={e => handleOfferFieldChange(index, 'price_min', e.target.value)} required />
                        <input type="number" placeholder="Max Price (₹)" value={offer.price_max || ''} onChange={e => handleOfferFieldChange(index, 'price_max', e.target.value)} required />
                      </div>
                    </div>
                  ))}
                </div>
                
                {modalOffers.length < 20 && <button type="button" className="btn-add-more-offers" style={{ marginTop: '2px' }} onClick={addMoreOffersInForm}>+ Add More Pricing Packages Options ({modalOffers.length}/20)</button>}

                <div className="modal-actions-wrapper" style={{ marginTop: '8px' }}>
                  <button type="button" className="btn-small-cancel" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Publish Service Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HOURLY AVAILABILITY EDITOR POPUP FOR A SINGLE CALENDAR DAY */}
      {selectedEditDate && (
        <div className="modal-overlay" onClick={() => setSelectedEditDate(null)}>
          <div className="modal-container hourly-availability-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn-modal-close-x" onClick={() => setSelectedEditDate(null)}>✕</button>
            <h3>
              {new Date(selectedEditDate + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="hourly-modal-subtext">Tap a time slot to mark it busy or available. Customers won't be able to book busy slots.</p>

            <div className="hourly-modal-quick-actions">
              <button type="button" className="btn-small-cancel" onClick={() => markWholeDayAvailable(selectedEditDate)}>Mark Entire Day Available</button>
              <button type="button" className="btn-small-cancel hourly-mark-busy-btn" onClick={() => markWholeDayBusy(selectedEditDate)}>Mark Entire Day Busy</button>
            </div>

            <div className="modal-scrollable-content-body">
              <div className="hourly-slots-grid">
                {BUSINESS_HOURS.map((hour) => {
                  const isHourBusy = (busyHoursMap[selectedEditDate] || []).includes(hour);
                  return (
                    <button
                      type="button"
                      key={hour}
                      className={`hourly-slot-btn ${isHourBusy ? "hourly-slot-busy" : "hourly-slot-available"}`}
                      onClick={() => toggleHourBusyStatus(selectedEditDate, hour)}
                    >
                      <span className="hourly-slot-time-label">{formatHourSlotLabel(hour)}</span>
                      <span className="hourly-slot-status-label">{isHourBusy ? "Busy" : "Available"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions-wrapper">
              <button type="button" className="btn-primary" onClick={() => setSelectedEditDate(null)}>Done</button>
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
            
            <h3 className="risk-header-title">Are you sure?</h3>
            
            <div className="modal-scrollable-content-body text-center-modal-box">
              <p className="risk-warning-body-text">Please note that this action initiates the permanent deletion of your NariBazar data. This process takes 30 days to complete. You may reverse this decision and prevent permanent deletion by logging into your account at any point during this 30-day window.</p>
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
            <div className="modal-logout-emoji-graphic"></div>
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
        <button type="button" className="btn-system-logout" onClick={handleLogoutAction}>Logout Account</button>
        <button type="button" className="btn-system-delete-footer" onClick={() => setIsDeleteAccountModalOpen(true)}>Delete Account</button>
      </div>

    </div>
  );
}

export default ProviderDashboard;