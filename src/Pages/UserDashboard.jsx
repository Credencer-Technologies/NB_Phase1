import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaChartPie,
  FaHeart,
  FaMapMarkerAlt,
  FaTrash,
} from "react-icons/fa";

import service1 from "../assets/Images/service1.jpeg";
import api from "../services/api";
import "./UserDashboard.css";

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

const getCategoryName = (service, provider, favorite) => {
  const directCategory =
    service?.category_name ??
    service?.category?.name ??
    (typeof service?.category === "string" ? service.category : null) ??
    favorite?.category_name ??
    favorite?.category?.name ??
    (typeof favorite?.category === "string" ? favorite.category : null) ??
    provider?.category_name ??
    provider?.category?.name ??
    (typeof provider?.category === "string" ? provider.category : null);

  if (String(directCategory || "").trim()) {
    return String(directCategory).trim();
  }

  const categoryId = Number(
    service?.category_id ??
      service?.category?.id ??
      favorite?.category_id ??
      favorite?.category?.id ??
      provider?.category_id ??
      provider?.category?.id ??
      0
  );

  return CATEGORY_MAP[categoryId] || "Uncategorized";
};

const normalizeAvailabilityFlag = (value, fallback = true) => {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return fallback;
};

const BUSINESS_HOURS = Array.from({ length: 12 }, (_, index) => index * 2);

const getISTTodayDateString = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getProviderDayAvailability = async (providerId) => {
  if (!providerId) {
    return {
      isUnavailableToday: false,
      busyHours: [],
    };
  }

  const today = getISTTodayDateString();

  const readCachedTodayHours = () => {
    try {
      const canonicalKey =
        `naaribazar_provider_availability_${providerId}`;
      const legacyKey =
        `naribazar_provider_availability_${providerId}`;

      const canonicalMap = JSON.parse(
        localStorage.getItem(canonicalKey) || "{}"
      );

      const legacyMap = JSON.parse(
        localStorage.getItem(legacyKey) || "{}"
      );

      const rawTodayHours =
        canonicalMap?.[today] ??
        legacyMap?.[today] ??
        [];

      return Array.isArray(rawTodayHours)
        ? [...new Set(rawTodayHours.map(Number))]
            .filter((hour) => BUSINESS_HOURS.includes(hour))
        : [];
    } catch {
      return [];
    }
  };

  try {
    const response = await api.get(
      `/availability/provider/${Number(providerId)}`
    );

    const backendMap =
      response.data?.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
        ? response.data.data
        : {};

    const backendTodayHours = Array.isArray(
      backendMap?.[today]
    )
      ? backendMap[today].map(Number)
      : [];

    // Backend is the shared source. Local cache is only used when this
    // provider/date has not been migrated to the backend yet.
    const todayBusyHours =
      Object.prototype.hasOwnProperty.call(
        backendMap,
        today
      )
        ? backendTodayHours
        : readCachedTodayHours();

    const isUnavailableToday =
      BUSINESS_HOURS.every(
        (hour) => todayBusyHours.includes(hour)
      );

    return {
      isUnavailableToday,
      busyHours: todayBusyHours,
    };
  } catch (error) {
    console.error(
      `Unable to load provider availability ${providerId}:`,
      error
    );

    // Network fallback keeps existing same-browser behavior working.
    const todayBusyHours =
      readCachedTodayHours();

    return {
      isUnavailableToday:
        BUSINESS_HOURS.every(
          (hour) => todayBusyHours.includes(hour)
        ),
      busyHours: todayBusyHours,
    };
  }
};

function UserDashboard() {
  const navigate = useNavigate();

  const initialUser = {
    full_name: "",
    email: "",
    phone: "",
    city: "",
  };

  const [user, setUser] = useState(initialUser);

  // Stores only the last saved/loaded profile values.
  // Profile Completion is calculated from this state so typing in the
  // Personal Details form does not change the percentage before Save.
  const [savedProfile, setSavedProfile] = useState(initialUser);

  const [services, setServices] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  // ============================================
  // LOAD LOGGED-IN USER FROM DATABASE
  // ============================================

  const getStoredLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error("Unable to read stored login data:", error);
      return null;
    }
  };

  const normalizeUser = (data, fallback = {}) => {
    const userData =
      data?.user ??
      data?.data ??
      data ??
      {};

    return {
      full_name:
        userData.full_name ??
        userData.name ??
        fallback.full_name ??
        localStorage.getItem("full_name") ??
        "",
      email:
        userData.email ??
        fallback.email ??
        "",
      phone:
        userData.phone ??
        userData.phone_number ??
        fallback.phone ??
        localStorage.getItem("phone") ??
        "",
      city:
        userData.city ??
        fallback.city ??
        "",
    };
  };

  const loadLoggedInUser = async () => {
    const storedUser = getStoredLoggedInUser();

    const userId =
      storedUser?.id ??
      storedUser?.user_id ??
      localStorage.getItem("user_id");

    const storedPhone =
      storedUser?.phone ??
      storedUser?.phone_number ??
      localStorage.getItem("phone");

    // Show available login data immediately while the database request runs.
    if (storedUser || storedPhone) {
      const storedProfile = normalizeUser(
        storedUser || {},
        {
          phone: storedPhone || "",
        }
      );

      setUser(storedProfile);
      setSavedProfile(storedProfile);
    }

    try {
      let response;

      if (userId) {
        // Expected backend endpoint:
        // GET /users/{user_id}
        response = await api.get(`/users/${userId}`);
      } else if (storedPhone) {
        // Fallback when the login response contains only the phone number.
        // Expected backend endpoint:
        // GET /users/phone/{phone}
        response = await api.get(
          `/users/phone/${encodeURIComponent(storedPhone)}`
        );
      } else {
        console.warn(
          "No logged-in user ID or phone number was found."
        );
        return;
      }

      const databaseUser = normalizeUser(
        response.data,
        storedUser || {}
      );

      setUser(databaseUser);
      setSavedProfile(databaseUser);

      // Keep the current database values available across page refreshes.
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...(storedUser || {}),
          ...(response.data?.user ||
            response.data?.data ||
            response.data ||
            {}),
          ...databaseUser,
          id:
            response.data?.user?.id ??
            response.data?.data?.id ??
            response.data?.id ??
            userId ??
            storedUser?.id ??
            null,
        })
      );
    } catch (error) {
      console.error(
        "Unable to fetch logged-in user from database:",
        error.response?.data || error
      );

      // Keep showing stored login details if the database request fails.
      if (!storedUser && !storedPhone) {
        setUser(initialUser);
        setSavedProfile(initialUser);
      }
    }
  };

  useEffect(() => {
    loadLoggedInUser();
  }, []);

  // ============================================
  // LOAD ONLY DYNAMIC SERVICE LISTINGS
  // ============================================

  const loadDashboardServices = async () => {
    try {
      const storedServices = JSON.parse(
        localStorage.getItem("providerDashboardServices") || "[]"
      );

      if (!Array.isArray(storedServices)) {
        setServices([]);
        return;
      }

      const normalizedServices = await Promise.all(
        storedServices.map(async (service, index) => {
          const serviceId = Number(
            service.service_id ?? service.id ?? 0
          );

          // Always fetch the latest service row from the database.
          // The saved dashboard item can become stale after the provider
          // pauses/resumes the service from Provider Dashboard.
          let latestService = null;

          if (serviceId) {
            try {
              const serviceResponse = await api.get(
                `/services/${serviceId}`
              );

              latestService =
                serviceResponse.data?.data ??
                serviceResponse.data ??
                null;
            } catch (serviceError) {
              console.error(
                `Unable to load latest dashboard service ${serviceId}:`,
                serviceError
              );
            }
          }

          const serviceIsAvailable =
            normalizeAvailabilityFlag(
              latestService?.is_item_available ??
                service.is_item_available,
              true
            );

          let priceMin =
            service.price_min ??
            service.price ??
            null;

          let priceMax =
            service.price_max ??
            null;

          // The dashboard item saved from ProviderProfile currently stores
          // price as null. Load the real offer prices used on Explore.
          if (serviceId && priceMin == null) {
            try {
              const offersResponse = await api.get(
                `/offers/service/${serviceId}`
              );

              const offersPayload =
                offersResponse.data?.data ||
                offersResponse.data ||
                [];

              const offers = Array.isArray(offersPayload)
                ? offersPayload
                : [];

              const firstOffer = offers[0] || null;

              if (firstOffer) {
                priceMin =
                  firstOffer.price_min ??
                  firstOffer.price ??
                  null;

                priceMax =
                  firstOffer.price_max ??
                  null;
              }
            } catch (offerError) {
              console.error(
                `Unable to load offers for service ${serviceId}:`,
                offerError
              );
            }
          }

          const providerId = Number(
            latestService?.provider_id ??
              service.provider_id ??
              service.provider?.id ??
              0
          );

          // Fetch the latest provider row so we always know the current
          // verification status (approved / rejected / pending) — the
          // admin may have rejected this provider after the user added
          // the service to their dashboard list.
          let providerStatus = null;
          let isProviderDeleted = false;
          let providerIsAvailable = true;

          if (providerId) {
            try {
              const providerResponse = await api.get(
                `/providers/${providerId}`
              );

              const provider =
                providerResponse.data?.data ??
                providerResponse.data ??
                null;

              providerStatus = provider?.status ?? null;
              providerIsAvailable =
                normalizeAvailabilityFlag(
                  provider?.is_available,
                  true
                );
            } catch (providerError) {
              console.error(
                `Unable to load provider ${providerId} for dashboard service ${serviceId}:`,
                providerError
              );

              // Keep the user's already-saved dashboard card even when the
              // provider account no longer exists. The card is locked below
              // and shown as "Service No Longer Available".
              if (
                providerError.response?.status === 404 ||
                providerError.response?.status === 410
              ) {
                isProviderDeleted = true;
                providerStatus = "deleted";
                providerIsAvailable = false;
              }
            }
          }

          const normalizedProviderStatus =
            String(providerStatus || "")
              .trim()
              .toLowerCase();

          const isProviderRejected =
            normalizedProviderStatus === "rejected";

          return {
            ...service,

            id:
              service.id ??
              service.service_id ??
              `dashboard-service-${index}`,

            service_id:
              service.service_id ??
              service.id ??
              null,

            provider_id: providerId || null,

            category_name:
              service.category_name ||
              service.category ||
              "Uncategorized",

            service_name:
              service.service_name ||
              service.custom_service_title ||
              service.title ||
              "Service",

            rating: Number(
              service.rating ??
                service.avg_rating ??
                service.average_rating ??
                0
            ),

            image:
              service.image ||
              service.service_profile_image ||
              service.profile_image ||
              service1,

            city:
              service.city ||
              service.provider_city ||
              "Location not available",

            price_min:
              priceMin != null ? Number(priceMin) : null,

            price_max:
              priceMax != null ? Number(priceMax) : null,

            // Latest database-backed pause/resume status.
            service_is_available: serviceIsAvailable,

            // Latest provider-level master availability.
            provider_is_available: providerIsAvailable,

            // Provider verification status. Drives the locked/greyed-out
            // "Service Temporarily Unavailable" card state until the admin
            // marks the provider as verified/approved again.
            provider_status:
              normalizedProviderStatus || providerStatus,
            is_provider_rejected: isProviderRejected,
            is_provider_deleted: isProviderDeleted,
          };
        })
      );

      const uniqueServices = normalizedServices.filter(
        (service, index, array) =>
          index ===
          array.findIndex(
            (currentService) =>
              String(currentService.id) === String(service.id)
          )
      );

      setServices(uniqueServices);
    } catch (error) {
      console.error(
        "Unable to load dashboard services:",
        error
      );

      setServices([]);
    }
  };

  useEffect(() => {
    loadDashboardServices();

    const refreshServices = () => {
      loadDashboardServices();
    };

    // The provider's pause/resume toggle is stored in the database.
    // Refresh only while this page is visible so an already-open User
    // Dashboard also picks up the latest service status automatically.
    const serviceStatusRefreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardServices();
      }
    }, 5000);

    window.addEventListener("storage", refreshServices);
    window.addEventListener(
      "dashboardServicesChange",
      refreshServices
    );
    window.addEventListener("focus", refreshServices);

    return () => {
      window.clearInterval(serviceStatusRefreshTimer);

      window.removeEventListener(
        "storage",
        refreshServices
      );

      window.removeEventListener(
        "dashboardServicesChange",
        refreshServices
      );
      window.removeEventListener("focus", refreshServices);
    };
  }, []);

  // ============================================
  // LOAD FAVOURITES SAVED FROM EXPLORE
  // ============================================

  const getLoggedInUserId = () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const role =
        localStorage.getItem("role") ||
        storedUser?.role ||
        "";

      // Never use a provider id as a customer/user id.
      if (role === "provider") return null;

      const rawUserId =
        storedUser?.user_id ??
        localStorage.getItem("user_id") ??
        storedUser?.id ??
        null;

      const numericUserId = Number(rawUserId);

      return Number.isFinite(numericUserId) && numericUserId > 0
        ? numericUserId
        : null;
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  };

  const unwrapArray = (payload) => {
    if (Array.isArray(payload)) return payload;

    for (const key of [
      "data",
      "items",
      "results",
      "favorites",
      "favourites",
    ]) {
      if (Array.isArray(payload?.[key])) {
        return payload[key];
      }
    }

    return [];
  };

  const loadFavorites = async () => {
    const userId = getLoggedInUserId();

    if (!userId) {
      setWishlistItems([]);
      return;
    }

    try {
      const favoritesResponse = await api.get(
        `/favorites/user/${userId}`
      );

      const favoriteRows = unwrapArray(
        favoritesResponse.data
      );

      const favoriteCards = await Promise.all(
        favoriteRows.map(async (favorite, index) => {
          const serviceId = Number(
            favorite.service_id ??
              favorite.service?.id ??
              favorite.service_details?.id ??
              0
          );

          if (!serviceId) return null;

          // Always fetch the latest service row from the database.
          // This is important because the provider may have changed
          // is_item_available after the user originally added the favorite.
          let service = null;
          let isServiceDeleted = false;

          try {
            const serviceResponse = await api.get(
              `/services/${serviceId}`
            );

            service =
              serviceResponse.data?.data ??
              serviceResponse.data ??
              null;
          } catch (serviceError) {
            console.error(
              `Unable to load favourite service ${serviceId}:`,
              serviceError
            );

            // IMPORTANT:
            // Never remove an already-saved favourite just because the service
            // was deleted together with the provider account. Keep the card and
            // show "Service No Longer Available" instead.
            if (
              serviceError.response?.status === 404 ||
              serviceError.response?.status === 410
            ) {
              isServiceDeleted = true;
            }

            // Keep whatever information was already saved with the favourite.
            service =
              favorite.service ??
              favorite.service_details ??
              null;
          }

          const providerId = Number(
            service?.provider_id ??
              service?.provider?.id ??
              favorite.provider_id ??
              0
          );

          // Always fetch the latest provider row too, so provider.is_available
          // is never taken from an old/stale favorite object.
          let provider = null;
          let isProviderDeleted = false;

          if (providerId) {
            try {
              const providerResponse = await api.get(
                `/providers/${providerId}`
              );

              provider =
                providerResponse.data?.data ??
                providerResponse.data ??
                null;
            } catch (providerError) {
              console.error(
                `Unable to load provider ${providerId}:`,
                providerError
              );

              // Keep the favourite card when the provider account no longer
              // exists. The card becomes locked and clearly shows that the
              // service is no longer available.
              if (
                providerError.response?.status === 404 ||
                providerError.response?.status === 410
              ) {
                isProviderDeleted = true;
              }

              provider =
                favorite.provider ??
                service?.provider ??
                null;
            }
          }

          const serviceIsAvailable = isServiceDeleted
            ? false
            : normalizeAvailabilityFlag(
                service?.is_item_available,
                true
              );

          const providerIsAvailable = isProviderDeleted
            ? false
            : normalizeAvailabilityFlag(
                provider?.is_available,
                true
              );

          // Provider verification status (set by admin). If the admin has
          // rejected an already-verified provider, any service card the
          // user previously saved must turn into a locked/greyed card.
          const providerStatus = isProviderDeleted
            ? "deleted"
            : provider?.status ?? null;

          const isProviderRejected =
            providerStatus === "rejected";

          const isServiceNoLongerAvailable =
            isProviderDeleted || isServiceDeleted;

          const {
            isUnavailableToday,
          } = isServiceNoLongerAvailable
            ? { isUnavailableToday: false }
            : await getProviderDayAvailability(
                providerId
              );

          const currentlyAvailable =
            !isServiceNoLongerAvailable &&
            !isProviderRejected &&
            serviceIsAvailable &&
            providerIsAvailable &&
            !isUnavailableToday;

          const availabilityLabel = isServiceNoLongerAvailable
            ? "Service No Longer Available"
            : isProviderRejected
            ? "Service Temporarily Unavailable"
            : !serviceIsAvailable || !providerIsAvailable
            ? "⏸ Service Paused"
            : isUnavailableToday
            ? "✕ Unavailable Today"
            : currentlyAvailable
            ? "✓ Available"
            : "✕ Not Available";

          let priceMin =
            favorite.price_min ??
            service?.price_min ??
            null;

          let priceMax =
            favorite.price_max ??
            service?.price_max ??
            null;

          if (
            !isServiceDeleted &&
            priceMin == null &&
            priceMax == null
          ) {
            try {
              const offersResponse = await api.get(
                `/offers/service/${serviceId}`
              );

              const offers = unwrapArray(
                offersResponse.data
              );

              const firstOffer = offers[0] ?? null;

              priceMin =
                firstOffer?.price_min ??
                firstOffer?.price ??
                null;

              priceMax =
                firstOffer?.price_max ??
                null;
            } catch (offerError) {
              console.error(
                `Unable to load favourite price for service ${serviceId}:`,
                offerError
              );
            }
          }

          return {
            id:
              favorite.id ??
              favorite.favorite_id ??
              `favorite-${serviceId}-${index}`,
            favorite_id:
              favorite.favorite_id ??
              favorite.id ??
              null,
            service_id: serviceId,
            provider_id: providerId || null,
            name:
              service?.custom_service_title ??
              service?.service_name ??
              favorite.service_name ??
              "Service",
            category: getCategoryName(
              service,
              provider,
              favorite
            ),
            city:
              provider?.city ??
              service?.city ??
              favorite.city ??
              "Location not available",
            rating: Number(
              service?.rating ??
                service?.avg_rating ??
                provider?.avg_rating ??
                favorite.rating ??
                0
            ),
            image:
              service?.service_profile_image ??
              service?.image ??
              provider?.profile_image ??
              favorite.image ??
              service1,
            price_min:
              priceMin != null ? Number(priceMin) : null,
            price_max:
              priceMax != null ? Number(priceMax) : null,

            // Latest service/provider status + provider's day calendar status.
            service_is_available: serviceIsAvailable,
            provider_is_available: providerIsAvailable,
            is_unavailable_today: isUnavailableToday,
            is_available: currentlyAvailable,
            availability_label: availabilityLabel,

            // Provider verification status. Drives the locked/greyed-out
            // "Service Temporarily Unavailable" card state until the admin
            // marks the provider as verified/approved again.
            provider_status: providerStatus,
            is_provider_rejected: isProviderRejected,
            is_provider_deleted: isProviderDeleted,
            is_service_deleted: isServiceDeleted,
          };
        })
      );

      // A provider/service delete may also remove its favorite DB row by
      // cascade. In that case, preserve only the previously cached card when
      // the related provider/service truly no longer exists. Normal unfavorites
      // are NOT restored because their provider/service still exists.
      let cachedFavorites = [];

      try {
        const cachedPayload = JSON.parse(
          localStorage.getItem("wishlistServices") || "[]"
        );

        cachedFavorites = Array.isArray(cachedPayload)
          ? cachedPayload
          : [];
      } catch {
        cachedFavorites = [];
      }

      const liveFavoriteServiceIds = new Set(
        favoriteRows
          .map((favorite) =>
            Number(
              favorite.service_id ??
                favorite.service?.id ??
                favorite.service_details?.id ??
                0
            )
          )
          .filter(Boolean)
      );

      const deletedCachedCards = await Promise.all(
        cachedFavorites
          .filter(
            (cachedItem) =>
              cachedItem?.service_id &&
              !liveFavoriteServiceIds.has(
                Number(cachedItem.service_id)
              )
          )
          .map(async (cachedItem) => {
            const cachedServiceId = Number(
              cachedItem.service_id || 0
            );

            const cachedProviderId = Number(
              cachedItem.provider_id || 0
            );

            let providerDeleted =
              Boolean(cachedItem.is_provider_deleted);

            let serviceDeleted =
              Boolean(cachedItem.is_service_deleted);

            if (!providerDeleted && cachedProviderId) {
              try {
                await api.get(
                  `/providers/${cachedProviderId}`
                );
              } catch (providerError) {
                if (
                  providerError.response?.status === 404 ||
                  providerError.response?.status === 410
                ) {
                  providerDeleted = true;
                }
              }
            }

            if (
              !providerDeleted &&
              !serviceDeleted &&
              cachedServiceId
            ) {
              try {
                await api.get(
                  `/services/${cachedServiceId}`
                );
              } catch (serviceError) {
                if (
                  serviceError.response?.status === 404 ||
                  serviceError.response?.status === 410
                ) {
                  serviceDeleted = true;
                }
              }
            }

            if (!providerDeleted && !serviceDeleted) {
              return null;
            }

            return {
              ...cachedItem,
              is_available: false,
              service_is_available: false,
              provider_is_available: false,
              is_unavailable_today: false,
              availability_label:
                "Service No Longer Available",
              provider_status: providerDeleted
                ? "deleted"
                : cachedItem.provider_status,
              is_provider_rejected: false,
              is_provider_deleted: providerDeleted,
              is_service_deleted: serviceDeleted,
            };
          })
      );

      const normalizedFavorites = [
        ...favoriteCards.filter(Boolean),
        ...deletedCachedCards.filter(Boolean),
      ].filter(
        (item, index, array) =>
          index ===
          array.findIndex(
            (currentItem) =>
              Number(currentItem.service_id) ===
              Number(item.service_id)
          )
      );

      setWishlistItems(normalizedFavorites);

      localStorage.setItem(
        "wishlistServices",
        JSON.stringify(normalizedFavorites)
      );
    } catch (error) {
      console.error("Unable to load favourites:", error);

      try {
        const cachedFavorites = JSON.parse(
          localStorage.getItem("wishlistServices") || "[]"
        );

        setWishlistItems(
          Array.isArray(cachedFavorites)
            ? cachedFavorites
            : []
        );
      } catch {
        setWishlistItems([]);
      }
    }
  };

  useEffect(() => {
    loadFavorites();

    const refreshFavorites = () => loadFavorites();

    const favoritesStatusRefreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadFavorites();
      }
    }, 5000);

    window.addEventListener(
      "favoritesChange",
      refreshFavorites
    );
    window.addEventListener(
      "authChange",
      refreshFavorites
    );

    const refreshAvailability = (event) => {
      if (
        !event?.key ||
        event.key.startsWith("naaribazar_provider_availability_") ||
        event.key.startsWith("naribazar_provider_availability_")
      ) {
        loadFavorites();
      }
    };

    const refreshSameTabAvailability = () => {
      loadFavorites();
    };

    window.addEventListener(
      "storage",
      refreshAvailability
    );

    window.addEventListener(
      "naaribazar-availability-updated",
      refreshSameTabAvailability
    );

    return () => {
      window.clearInterval(favoritesStatusRefreshTimer);

      window.removeEventListener(
        "favoritesChange",
        refreshFavorites
      );
      window.removeEventListener(
        "authChange",
        refreshFavorites
      );
      window.removeEventListener(
        "storage",
        refreshAvailability
      );
      window.removeEventListener(
        "naaribazar-availability-updated",
        refreshSameTabAvailability
      );
    };
  }, []);

  // ============================================
  // PERSONAL DETAILS
  // ============================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser((previousUser) => ({
      ...previousUser,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    // Update Profile Completion only after Save Changes is clicked.
    setSavedProfile({
      ...user,
    });

    setSaved(true);

    setLastUpdated(
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  };

  const handleReset = () => {
    setUser((previousUser) => ({
      ...previousUser,
      email: "",
      city: "",
    }));

    setSaved(false);
  };

  // ============================================
  // PROFILE COMPLETION
  // ============================================

  const profileFields = [
    savedProfile.full_name,
    savedProfile.email,
    savedProfile.phone,
    savedProfile.city,
  ];

  const completedFields = profileFields.filter(
    (field) => String(field || "").trim() !== ""
  ).length;

  const completion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // ============================================
  // DELETE DYNAMIC SERVICE
  // ============================================

  const handleDeleteService = (id) => {
    const shouldDelete = window.confirm(
      "Remove this service from your dashboard?"
    );

    if (!shouldDelete) {
      return;
    }

    const updatedServices = services.filter(
      (service) =>
        String(service.id) !== String(id)
    );

    setServices(updatedServices);

    try {
      const dashboardServices = JSON.parse(
        localStorage.getItem(
          "providerDashboardServices"
        ) || "[]"
      );

      const updatedDashboardServices =
        Array.isArray(dashboardServices)
          ? dashboardServices.filter(
              (service) =>
                String(
                  service.id ?? service.service_id
                ) !== String(id)
            )
          : [];

      localStorage.setItem(
        "providerDashboardServices",
        JSON.stringify(updatedDashboardServices)
      );

      const savedProviders = JSON.parse(
        localStorage.getItem(
          "naaribazar_saved_providers"
        ) || "[]"
      );

      if (Array.isArray(savedProviders)) {
        const updatedSavedProviders =
          savedProviders.filter(
            (service) =>
              String(
                service.id ?? service.service_id
              ) !== String(id)
          );

        localStorage.setItem(
          "naaribazar_saved_providers",
          JSON.stringify(updatedSavedProviders)
        );
      }

      window.dispatchEvent(
        new Event("dashboardServicesChange")
      );
    } catch (error) {
      console.error(
        "Unable to delete dashboard service:",
        error
      );
    }
  };

  // ============================================
  // REMOVE WISHLIST ITEM
  // ============================================

  const removeWishlistItem = async (item) => {
    const userId = getLoggedInUserId();
    const serviceId = Number(item?.service_id);

    if (!userId || !serviceId) {
      alert("Unable to remove this favourite.");
      return;
    }

    try {
      await api.delete(
        `/favorites/${userId}/${serviceId}`
      );

      const updatedWishlist = wishlistItems.filter(
        (favorite) =>
          Number(favorite.service_id) !== serviceId
      );

      setWishlistItems(updatedWishlist);

      localStorage.setItem(
        "wishlistServices",
        JSON.stringify(updatedWishlist)
      );

      window.dispatchEvent(
        new Event("favoritesChange")
      );
    } catch (error) {
      console.error("Unable to remove favourite:", error);
      alert(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to remove this favourite."
      );
    }
  };

  const openProviderProfile = (service) => {
    if (!service.provider_id || !service.service_id) {
      console.error(
        "Provider or service ID is missing:",
        service
      );
      return;
    }

    navigate(
      `/provider-profile/${service.provider_id}?service=${service.service_id}`
    );
  };

  const formatServicePrice = (service) => {
    const min = service.price_min;
    const max = service.price_max;

    if (min == null && max == null) {
      return "Price on request";
    }

    if (min != null && max != null && Number(min) !== Number(max)) {
      return `₹${Number(min).toLocaleString("en-IN")} – ₹${Number(
        max
      ).toLocaleString("en-IN")}`;
    }

    const price = min ?? max;
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const avatarLetter =
    user.full_name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <div className="user-dashboard">
      <div className="dashboard-wrapper">
        {/* ============================
            WELCOME BANNER
        ============================ */}

        <div className="dashboard-banner">
          <div>
            <h1>Welcome Back 👋</h1>

            <p>
              Manage your personal information
              securely.
            </p>
          </div>

          <div className="avatar">
            {avatarLetter}
          </div>
        </div>

        {/* ============================
            PROFILE COMPLETION
        ============================ */}

        <div className="profile-progress-card">
          <div className="profile-progress-heading">
            <FaChartPie />

            <div>
              <h3>Profile Completion</h3>
              <p>{completion}% complete</p>
            </div>
          </div>

          <div className="profile-progress-track">
            <span
              className="profile-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="profile-progress-footer">
            <p className="profile-last-updated">
              <FaCalendarAlt />
              <span>Last updated: {lastUpdated}</span>
            </p>

            <button
              type="button"
              className="complete-profile-btn"
              onClick={() =>
                document
                  .querySelector(".details-card")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
              }
            >
              Complete Profile →
            </button>
          </div>
        </div>

        {/* ============================
            PERSONAL DETAILS
        ============================ */}

        <div className="details-card">
          <div className="card-header">
            <h2>Personal Details</h2>

            {!saved && (
              <span className="edit-warning">
                Unsaved Changes
              </span>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                value={user.full_name}
                readOnly
                className="readonly-field"
              />

              <small>
                Full name is linked to your
                registered account.
              </small>
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              <small>
                This email will be used for
                notifications and account updates.
              </small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                value={user.phone}
                disabled
              />

              <small>
                Phone number is used for login and
                cannot be edited.
              </small>
            </div>

            <div className="form-group">
              <label>City</label>

              <input
                type="text"
                name="city"
                value={user.city}
                onChange={handleChange}
                placeholder="Enter your city"
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="save-btn"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>

            {saved && (
              <div className="success-message">
                Profile updated successfully ✅
              </div>
            )}
          </form>
        </div>

        {/* ============================
            DYNAMIC SERVICE LISTINGS
        ============================ */}

        <div className="services-section">
          <div className="services-header">
            <h2>Service Listings</h2>

            <span>
              {services.length} Services
            </span>
          </div>

          {services.length === 0 ? (
            <div className="services-empty">
              <h3>No services added yet</h3>

              <p>
                Services added using “Add to
                Dashboard List” will appear here.
              </p>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => {
                const isLocked =
                  service.is_provider_rejected ||
                  service.is_provider_deleted;

                const isServicePaused =
                  service.service_is_available === false ||
                  service.provider_is_available === false;

                return (
                  <div
                    className={
                      isLocked
                        ? "service-card service-card--locked"
                        : "service-card service-card-clickable"
                    }
                    key={service.id}
                    role={isLocked ? undefined : "button"}
                    tabIndex={isLocked ? undefined : 0}
                    aria-disabled={isLocked || undefined}
                    onClick={() => {
                      if (isLocked) return;
                      openProviderProfile(service);
                    }}
                    onKeyDown={(event) => {
                      if (isLocked) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProviderProfile(service);
                      }
                    }}
                  >
                    <img
                      src={
                        service.image || service1
                      }
                      alt={
                        service.service_name ||
                        "Service"
                      }
                      className="service-image"
                      onError={(event) => {
                        event.currentTarget.src =
                          service1;
                      }}
                    />

                    <div className="service-content">
                      <div className="service-rating">
                        ⭐{" "}
                        {Number(
                          service.rating || 0
                        ).toFixed(1)}
                      </div>

                      <h3
                        style={{
                          width: "fit-content",
                          marginBottom: "8px",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          background: "#fce7f3",
                          color: "#be185d",
                          fontSize: "1.1rem",
                          fontWeight: "800",
                        }}
                      >
                        {service.service_name ||
                          "Service"}
                      </h3>

                      <p className="service-name">
                        {service.category_name ||
                          "Uncategorized"}
                      </p>

                      <div className="service-location">
                        <FaMapMarkerAlt />

                        <span>
                          {(
                            service.city ||
                            "Location not available"
                          ).split(",")[0]}
                        </span>
                      </div>

                      {isLocked && (
                        <div className="service-unavailable-badge">
                          {service.is_provider_deleted
                            ? "Service No Longer Available"
                            : "Service Temporarily Unavailable"}
                        </div>
                      )}

                      {!isLocked && isServicePaused && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "fit-content",
                            marginTop: "10px",
                            marginBottom: "10px",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: "#fef2f2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca",
                          }}
                        >
                          ⏸ Service Paused
                        </div>
                      )}

                      <div className="service-card-footer">
                        <div className="service-price">
                          {formatServicePrice(service)}
                        </div>

                        <button
                          type="button"
                          className="delete-service"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteService(service.id);
                          }}
                          aria-label="Remove service"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================
            MY FAVOURITES
        ============================ */}

        <div className="wishlist-dashboard-section">
          <div className="wishlist-dashboard-header">
            <h2>
              <FaHeart />
              My Favourite
            </h2>

            <span>
              {wishlistItems.length} Saved
            </span>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="wishlist-empty">
              No favourite services yet ❤️
            </div>
          ) : (
            <div className="wishlist-dashboard-grid">
              {wishlistItems.map((item) => {
                const isNoLongerAvailable =
                  item.is_provider_deleted ||
                  item.is_service_deleted;

                const isLocked =
                  item.is_provider_rejected ||
                  isNoLongerAvailable;

                return (
                  <div
                    className={
                      isLocked
                        ? "wishlist-dashboard-card wishlist-dashboard-card--locked"
                        : "wishlist-dashboard-card"
                    }
                    key={item.id}
                    role={isLocked ? undefined : "button"}
                    tabIndex={isLocked ? undefined : 0}
                    aria-disabled={isLocked || undefined}
                    onClick={() => {
                      if (isLocked) return;
                      openProviderProfile(item);
                    }}
                    onKeyDown={(event) => {
                      if (isLocked) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProviderProfile(item);
                      }
                    }}
                  >
                    <img
                      src={item.image || service1}
                      alt={item.name || "Service"}
                      onError={(event) => {
                        event.currentTarget.src =
                          service1;
                      }}
                    />

                    <div className="wishlist-dashboard-content">
                      <h3>
                        {item.name || "Service"}
                      </h3>

                      <p>
                        {item.category ||
                          "Uncategorized"}
                      </p>

                      <div className="wishlist-dashboard-location">
                        <FaMapMarkerAlt />

                        {item.city ||
                          "Location not available"}
                      </div>

                      {isLocked ? (
                        <div className="wishlist-dashboard-unavailable-badge">
                          {isNoLongerAvailable
                            ? "Service No Longer Available"
                            : "Service Temporarily Unavailable"}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "fit-content",
                            marginTop: "10px",
                            marginBottom: "10px",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: item.is_available
                              ? "#ecfdf5"
                              : "#fef2f2",
                            color: item.is_available
                              ? "#047857"
                              : "#b91c1c",
                            border: item.is_available
                              ? "1px solid #a7f3d0"
                              : "1px solid #fecaca",
                          }}
                        >
                          {item.availability_label ||
                            (item.is_available
                              ? "✓ Available"
                              : "✕ Not Available")}
                        </div>
                      )}

                      <div className="wishlist-dashboard-bottom">
                        <div>
                          ⭐ {item.rating || 0}
                        </div>

                        <div>
                          {formatServicePrice(item)}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeWishlistItem(item);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================
            QUICK ACTION
        ============================ */}

        <div className="quick-actions">
          <div className="action-buttons">
            <button
              type="button"
              className="action-btn"
              onClick={() =>
                setShowSupport(true)
              }
            >
              Contact Support
            </button>
          </div>

          {showSupport && (
            <div className="support-modal">
              <div className="support-card">
                <button
                  type="button"
                  className="close-btn"
                  onClick={() =>
                    setShowSupport(false)
                  }
                >
                  ✕
                </button>

                <h2>Customer Support</h2>

                <p>
                  Our team is happy to assist you.
                </p>

                <div className="support-item">
                  <strong>Support Email</strong>
                  <span>
                    support@naribazar.in
                  </span>
                </div>

                <div className="support-item">
                  <strong>
                    Business Enquiries
                  </strong>
                  <span>
                    info@naribazar.in
                  </span>
                </div>

                <div className="support-item">
                  <strong>Customer Care</strong>
                  <span>
                    +91 9490594867
                  </span>
                </div>

                <div className="support-item">
                  <strong>
                    Corporate Office
                  </strong>

                  <span>
                    8th Floor, Vaishnavi&apos;s
                    Cynosure,
                    <br />
                    2-48/5/6,
                    <br />
                    Gachibowli Road, Opp. RTTC,
                    <br />
                    Telecom Nagar, Hyderabad,
                    <br />
                    Telangana - 500032
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;