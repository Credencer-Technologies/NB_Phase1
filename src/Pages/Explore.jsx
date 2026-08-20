import "./Explore.css";
import api from "../services/api";

import bannerWomen from "../assets/Images/bannerWomen.png";

import provider1 from "../assets/Images/provider1.jpg";
import provider2 from "../assets/Images/provider2.jpg";
import provider3 from "../assets/Images/provider3.jpg";
import provider4 from "../assets/Images/provider4.jpg";
import provider5 from "../assets/Images/provider5.jpg";
import provider6 from "../assets/Images/provider6.jpg";
import provider7 from "../assets/Images/provider7.jpg";
import provider8 from "../assets/Images/provider8.jpg";
import customer1 from "../assets/Images/customer1.jpg";
import customer2 from "../assets/Images/customer2.jpg";
import customer3 from "../assets/Images/customer3.jpg";


import { useState, useEffect } from "react";
import { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaShieldAlt,
  FaAward,
  FaUsers,
  FaHeadset,
  FaRedoAlt,
  FaChevronDown,
  FaThLarge,
  FaLeaf,
  FaBars,
  FaSpa,
  FaPaintBrush,
  FaTshirt,
  FaUtensils,
  FaGraduationCap,
  FaBook,
  FaDumbbell,
  FaHome,
  FaPalette,
  FaHotel,
  FaEllipsisH
} from "react-icons/fa";

import { FaHouse } from "react-icons/fa6";

const CATEGORY_MAP = {
  1: "Beauty & Wellness",
  2: "Mehendi & Bridal",
  3: "Tailoring & Fashion",
  4: "Food & Catering",
  5: "Education & Tutoring",
  6: "Yoga & Fitness",
  7: "Home Services",
  8: "Arts & Crafts",
  9: "Others",
  10: "Hospitality",
  11: "House Cleaning",
  12: "Yoga Trainer",
  14: "Dance Trainer",
  15: "Bridal Makeup",
  16: "Mehendi Artist",
};

const FALLBACK_PROVIDER_IMAGES = [
  provider1,
  provider2,
  provider3,
  provider4,
  provider5,
  provider6,
  provider7,
  provider8,
];

const CARDS_PER_PAGE = 12;

const MAIN_CATEGORIES = [
  "Beauty & Wellness",
  "Mehendi & Bridal",
  "Tailoring & Fashion",
  "Food & Catering",
  "Education & Tutoring",
  "Yoga & Fitness",
  "Home Services",
  "Arts & Crafts",
  "Hospitality",
];

const CATEGORY_SEARCH_ALIASES = {
  "Beauty & Wellness": [
    "beauty",
    "wellness",
    "beauty service",
    "beauty services",
  ],
  "Mehendi & Bridal": [
    "mehndi",
    "mehendi",
    "mehandi",
    "bridal",
    "mehndi service",
    "mehendi service",
  ],
  "Tailoring & Fashion": [
    "tailoring",
    "tailor",
    "fashion",
  ],
  "Food & Catering": [
    "food",
    "catering",
    "food service",
  ],
  "Education & Tutoring": [
    "education",
    "tutoring",
    "tuition",
    "tutor",
  ],
  "Yoga & Fitness": [
    "yoga",
    "fitness",
    "trainer",
  ],
  "Home Services": [
    "home",
    "home service",
    "home services",
    "cleaning",
  ],
  "Arts & Crafts": [
    "art",
    "arts",
    "craft",
    "crafts",
  ],
  "Hospitality": [
    "hospitality",
    "hotel",
    "hotels",
    "guest house",
    "guesthouse",
    "accommodation",
  ],
  Others: [
    "others",
    "other",
  ],
};


const getCategoryFromSearch = (value) => {
  const normalizedValue =
    String(value || "")
      .trim()
      .toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  const categories = [
    ...MAIN_CATEGORIES,
    "Others",
  ];

  return (
    categories.find((category) => {
      const normalizedCategory =
        category.toLowerCase();

      const aliases =
        CATEGORY_SEARCH_ALIASES[
          category
        ] || [];

      return (
        normalizedCategory.includes(
          normalizedValue
        ) ||
        normalizedValue.includes(
          normalizedCategory
        ) ||
        aliases.some((alias) => {
          const normalizedAlias =
            String(alias)
              .trim()
              .toLowerCase();

          return (
            normalizedAlias.includes(
              normalizedValue
            ) ||
            normalizedValue.includes(
              normalizedAlias
            )
          );
        })
      );
    }) || null
  );
};



// The Admin Dashboard stores approval in providers.status.
// Explore reads the same provider records used by the Admin Dashboard and
// creates service cards only when status is exactly "approved".
const isProviderApproved = (provider) =>
  String(provider?.status || "")
    .trim()
    .toLowerCase() === "approved";

const getProviderBadge = (provider) => {
  // Check if provider joined within last 30 days → show "New"
  const isNew = provider.created_at
    ? Date.now() - new Date(provider.created_at).getTime() <
      30 * 24 * 60 * 60 * 1000
    : false;

  if (isNew) {
    return {
      text: "New",
      className: "new",
      icon: "🌱",
      reason: "Newly joined service provider",
    };
  }

  if (provider.rating === 5 && provider.reviews >= 50) {
    return {
      text: "Trending",
      className: "trending",
      icon: "🔥",
      reason: "Perfect 5-star rating with high customer engagement",
    };
  }

  if (provider.rating >= 4.5) {
    return {
      text: "Top Rated",
      className: "top",
      icon: "⭐",
      reason: "Consistently excellent customer ratings",
    };
  }

  if (provider.rating >= 4.0) {
    return {
      text: "Popular",
      className: "popular",
      icon: "💙",
      reason: "Highly preferred by customers",
    };
  }

  return {
    text: "New",
    className: "new",
    icon: "🌱",
    reason: "Newly joined service provider",
  };
};


// Returns true if provider is available today (based on weekly availability)
const isAvailableToday = (provider) => {
  if (!provider.availability) return false;

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = days[new Date().getDay()];

  return (
    provider.availability[today] === true ||
    provider.availability[today] === 1
  );
};

const isAvailableThisWeek = (provider) => {
  // When no weekly schedule exists, use the service/provider toggle status.
  if (!provider.availability) {
    return provider.available === true;
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days.some(
    (day) =>
      provider.availability[day] === true ||
      provider.availability[day] === 1
  );
};


function Explore() {
  const location = useLocation();

  const navigate = useNavigate();

  const categorySectionRef = useRef(null);

  // Service-card results area used only after an explicit Search submit.
  const serviceResultsRef = useRef(null);

  const [searchParams] = useSearchParams();

  // searchInput is what the user is typing.
  // searchTerm is the submitted value that actually filters cards.
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [providers, setProviders] = useState([]);

  const [providersLoading, setProvidersLoading] =
    useState(true);

  const [providersError, setProvidersError] =
    useState(null);


  // Build the location dropdown from the real provider/service cards.
  // This prevents newly added cities from being missing from the filter.
  const availableLocations = Array.from(
    new Set(
      providers
        .map((provider) =>
          provider.city?.trim()
        )
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );


  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);


  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const [
          providersRes,
          servicesRes
        ] = await Promise.all([
          api.get("/providers/"),
          api.get("/services/"),
        ]);


        const normalizeList = (
          payload,
          possibleKeys = []
        ) => {
          if (Array.isArray(payload)) {
            return payload;
          }

          for (const key of possibleKeys) {
            if (Array.isArray(payload?.[key])) {
              return payload[key];
            }
          }

          return [];
        };


        const providersData =
          normalizeList(
            providersRes.data,
            [
              "data",
              "items",
              "results",
              "providers",
            ]
          );


        const servicesData =
          normalizeList(
            servicesRes.data,
            [
              "data",
              "items",
              "results",
              "services",
            ]
          );


        const approvedProviders = (
          Array.isArray(providersData)
            ? providersData
            : []
        ).filter(
          isProviderApproved
        );


        const providersById =
          new Map(
            approvedProviders.map(
              (provider) => [
                Number(provider.id),
                provider,
              ]
            )
          );


        // Every saved service must become its own Explore card.
        // Availability controls the card status, but it must not remove the card.
        const allServices =
          Array.isArray(servicesData)
            ? [...servicesData].sort(
                (a, b) => {
                  const providerDifference =
                    Number(a.provider_id) -
                    Number(b.provider_id);

                  if (
                    providerDifference !== 0
                  ) {
                    return providerDifference;
                  }

                  return (
                    Number(a.id) -
                    Number(b.id)
                  );
                }
              )
            : [];


        const mapped =
          await Promise.all(
            allServices.map(
              async (
                service,
                idx
              ) => {
                const provider =
                  providersById.get(
                    Number(
                      service.provider_id
                    )
                  );

                if (
                  !provider ||
                  !isProviderApproved(
                    provider
                  )
                ) {
                  return null;
                }


                let portfolioImages = [];

                let offers = [];


                try {
                  const [
                    portfolioRes,
                    offersRes,
                    reviewsRes,
                  ] =await Promise.all([
                      api.get(
                        `/portfolio/service/${service.id}`
                      ),

                      api.get(
                        `/offers/service/${service.id}`
                      ),

                      api.get(
                        `/reviews/service/${service.id}`
                      ),
                    ]);


                  const portfolioPayload =
                    portfolioRes.data
                      ?.data ||
                    portfolioRes.data ||
                    [];


                  const offersPayload =
                    offersRes.data
                      ?.data ||
                    offersRes.data ||
                    [];


                  portfolioImages =
                    Array.isArray(
                      portfolioPayload
                    )
                      ? portfolioPayload
                      : [];


                  offers =
                    Array.isArray(
                      offersPayload
                    )
                      ? offersPayload
                      : [];


                  const reviewSummary =
                    reviewsRes.data
                      ?.summary ||
                    {};


                  service.review_average =
                    Number(
                      reviewSummary.average_rating ||
                        0
                    );


                  service.review_count =
                    Number(
                      reviewSummary.total_reviews ||
                        0
                    );

                } catch (
                  serviceDetailsError
                ) {
                  console.error(
                    `Unable to load portfolio/offers for service ${service.id}:`,
                    serviceDetailsError
                  );
                }


                const firstOffer =
                  offers[0] ||
                  null;


                return {
                  id:
                    `service-${service.id}`,

                  service_id:
                    service.id,

                  provider_id:
                    provider.id,

                  name:
                    provider.full_name,

                  full_name:
                    provider.full_name,

                  city:
                    provider.city,

                  rating:
                    service.review_average ??
                    0,

                  reviews:
                    service.review_count ??
                    0,

                  price:
                    firstOffer?.price_min !=
                    null
                      ? Number(
                          firstOffer.price_min
                        )
                      : null,

                  price_min:
                    firstOffer?.price_min !=
                    null
                      ? Number(
                          firstOffer.price_min
                        )
                      : null,

                  price_max:
                    firstOffer?.price_max !=
                    null
                      ? Number(
                          firstOffer.price_max
                        )
                      : null,

                  experience:
                    service.experience_years ??
                    null,

                  serviceMode:
                    service.service_mode ??
                    null,

                  title:
                    service.custom_service_title ||
                    service.service_name ||
                    provider.full_name,


                  // A service card is only "available" when BOTH are true:
                  //  1) the service's own toggle
                  //  2) the provider's master toggle
                  available:
                    service.is_item_available !==
                      false &&
                    service.is_item_available !==
                      0 &&
                    service.is_item_available !==
                      "0" &&
                    provider.is_available !==
                      false &&
                    provider.is_available !==
                      0 &&
                    provider.is_available !==
                      "0",


                  availability:
                    provider.availability ??
                    null,

                  created_at:
                    service.created_at ||
                    provider.created_at ||
                    null,

                  category:
                    CATEGORY_MAP[
                      service.category_id ||
                        provider.category_id
                    ] ||
                    "Uncategorized",

                  image:
                    service.service_profile_image ||
                    portfolioImages[0]
                      ?.image_url ||
                    provider.profile_image ||
                    FALLBACK_PROVIDER_IMAGES[
                      idx %
                        FALLBACK_PROVIDER_IMAGES.length
                    ],

                  portfolio_images:
                    portfolioImages,

                  offers,

                  bio:
                    service.service_bio ||
                    provider.bio,

                  service_description:
                    service.service_bio ||
                    provider.service_description,
                };
              }
            )
          );


        setProviders(
          mapped.filter(Boolean)
        );

      } catch (error) {
        console.error(
          "Error fetching providers:",
          error
        );

        setProvidersError(
          "Unable to load providers. Please try again later."
        );

      } finally {
        setProvidersLoading(false);
      }
    };


    fetchProviders();

  }, []);


  const [
    selectedLocation,
    setSelectedLocation
  ] = useState("All");


  const [
    sortBy,
    setSortBy
  ] = useState(
    "topRated"
  );


  const [
    viewMode,
    setViewMode
  ] = useState(
    "grid"
  );


  const [
    activeCategory,
    setActiveCategory
  ] = useState(
    "All"
  );


  const [
    selectedCategories,
    setSelectedCategories
  ] = useState([]);


  const [
    selectedRating,
    setSelectedRating
  ] = useState(0);


  // Favorites belong to the logged-in CUSTOMER/USER account.
  const [
    wishlist,
    setWishlist
  ] = useState([]);


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
      if (role === "provider") {
        return null;
      }

      // IMPORTANT: user_id must be preferred over id.
      const rawUserId =
        storedUser?.user_id ??
        localStorage.getItem("user_id") ??
        storedUser?.id ??
        null;

      const numericUserId = Number(rawUserId);

      return Number.isFinite(numericUserId) &&
        numericUserId > 0
        ? numericUserId
        : null;

    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      return null;
    }
  };


  const unwrapFavorites = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.favorites)) {
      return payload.favorites;
    }

    if (Array.isArray(payload?.favourites)) {
      return payload.favourites;
    }

    return [];
  };


  const loadFavorites = async () => {
    const userId =
      getLoggedInUserId();

    if (!userId) {
      setWishlist([]);
      return;
    }

    try {
      const response =
        await api.get(
          `/favorites/user/${userId}`
        );

      setWishlist(
        unwrapFavorites(
          response.data
        ).map((item) => ({
          ...item,

          service_id:
            Number(
              item.service_id ??
              item.service?.id ??
              item.service_details?.id ??
              0
            ),
        }))
      );

    } catch (error) {
      console.error(
        "Error loading favorites:",
        error
      );

      setWishlist([]);
    }
  };


  // Load existing favorites and refresh whenever favorites/auth changes.
  useEffect(() => {
    loadFavorites();

    const refreshFavorites =
      () => loadFavorites();

    window.addEventListener(
      "authChange",
      refreshFavorites
    );

    window.addEventListener(
      "favoritesChange",
      refreshFavorites
    );

    return () => {
      window.removeEventListener(
        "authChange",
        refreshFavorites
      );

      window.removeEventListener(
        "favoritesChange",
        refreshFavorites
      );
    };
  }, []);


  const categoryMap = {

    "beauty-wellness":
      "Beauty & Wellness",

    "mehendi-bridal":
      "Mehendi & Bridal",

    "tailoring-fashion":
      "Tailoring & Fashion",

    "food-catering":
      "Food & Catering",

    "education":
      "Education & Tutoring",

    "yoga-fitness":
      "Yoga & Fitness",

    "home-services":
      "Home Services",

    "arts-crafts":
      "Arts & Crafts",

    "hospitality":
      "Hospitality",

    "others":
      "Others",
  };


  useEffect(() => {

    const category =
      searchParams.get(
        "category"
      );


    if (
      category &&
      categoryMap[
        category
      ]
    ) {

      setActiveCategory(
        categoryMap[
          category
        ]
      );


      setTimeout(
        () => {

          const element =
            document.getElementById(
              "category-pills"
            );


          if (element) {

            const navbarHeight =
              120;


            const y =
              element
                .getBoundingClientRect()
                .top +
              window.pageYOffset -
              navbarHeight;


            window.scrollTo({
              top: y,
              behavior:
                "smooth",
            });

          }},
        300
      );
    }

  }, [
    searchParams
  ]);


  // ============================================================
  // GLOBAL HEADER SEARCH
  // ============================================================
  // Header sends service/provider/category/offer/location searches as:
  // /explore?search=<value>
  //
  // Read that value here so a search submitted from ANY page immediately
  // filters the real Explore service cards.
  useEffect(() => {
    const globalSearchValue =
      String(
        searchParams.get("search") || ""
      ).trim();

    if (!globalSearchValue) {
      return;
    }

    const matchedCategory =
      getCategoryFromSearch(
        globalSearchValue
      );

    // A new global search should not remain trapped inside filters selected
    // during an earlier Explore visit.
    setSearchInput(
      globalSearchValue
    );

    setSelectedLocation(
      "All"
    );

    setSelectedCategories(
      []
    );

    setSelectedRating(
      0
    );

    setSelectedPrice(
      "all"
    );

    setSelectedAvailability(
      ""
    );

    setAppliedFilters({
      price: "all",
      availability: "",
    });

    setSortBy(
      "topRated"
    );

    setCurrentPage(
      1
    );

    if (matchedCategory) {
      // Example: "Mehendi", "Beauty", "Yoga", "Home Services".
      // Activate the corresponding category and show its service cards.
      setActiveCategory(
        matchedCategory
      );

      setSearchTerm(
        ""
      );
    } else {
      // Provider name, exact service title, offer/package or city search.
      setActiveCategory(
        "All"
      );

      setSearchTerm(
        globalSearchValue
      );
    }

    // Move the visitor directly to the matching service-card area after the
    // route/search state has updated.
    window.setTimeout(
      () => {
        const targetSection =
          serviceResultsRef.current;

        if (!targetSection) {
          return;
        }

        const navbarHeight =
          120;

        const scrollTop =
          targetSection
            .getBoundingClientRect()
            .top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top: Math.max(
            0,
            scrollTop
          ),
          behavior: "smooth",
        });
      },
      120
    );
  }, [
    searchParams
  ]);


  const [
    openSections,
    setOpenSections
  ] = useState({
    category: true,
    rating: true,
    price: true,
    availability: true,
  });


  const toggleSection =
    (section) => {

      setOpenSections(
        (prev) => ({
          ...prev,
          [section]:
            !prev[
              section
            ],
        })
      );

    };


  // Add/remove a service from the logged-in USER'S database favorites.
  const toggleWishlist =
    async (
      provider
    ) => {

      const userId =
        getLoggedInUserId();


      if (!userId) {

        alert(
          "Please login as a user to use Favorites."
        );

        return;
      }


      const serviceId =
        Number(
          provider.service_id ??
          String(
            provider.id || ""
          ).replace(
            "service-",
            ""
          )
        );


      if (!serviceId) {

        alert(
          "Unable to identify this service."
        );

        return;
      }


      const alreadySaved =
        wishlist.some(
          (item) =>
            Number(
              item.service_id
            ) ===
            serviceId
        );


      // Save the old state in case the backend request fails.
      const previousWishlist =
        [...wishlist];


      // Update the heart IMMEDIATELY.
      if (alreadySaved) {

        setWishlist(
          (previous) =>
            previous.filter(
              (item) =>
                Number(
                  item.service_id
                ) !==
                serviceId
            )
        );

      } else {

        setWishlist(
          (previous) => [
            ...previous.filter(
              (item) =>
                Number(
                  item.service_id
                ) !==
                serviceId
            ),

            {
              id:
                `temporary-favorite-${serviceId}`,

              user_id:
                userId,

              service_id:
                serviceId,
            },
          ]
        );
      }


      try {

        if (alreadySaved) {

          await api.delete(
            `/favorites/${userId}/${serviceId}`
          );

        } else {

          const response =
            await api.post(
              "/favorites/",
              {
                user_id:
                  userId,

                service_id:
                  serviceId,
              }
            );


          const savedFavorite =
            response.data?.favorite ??
            response.data?.data ??
            response.data ??
            {};


          // Replace temporary favorite with the actual DB favorite.
          setWishlist(
            (previous) => [
              ...previous.filter(
                (item) =>
                  Number(
                    item.service_id
                  ) !==
                  serviceId
              ),

              {
                ...(
                  typeof savedFavorite ===
                    "object" &&
                  savedFavorite !==
                    null &&
                  !Array.isArray(
                    savedFavorite
                  )
                    ? savedFavorite
                    : {}
                ),

                user_id:
                  Number(
                    savedFavorite?.user_id ??
                    userId
                  ),

                service_id:
                  Number(
                    savedFavorite?.service_id ??
                    serviceId
                  ),
              },
            ]
          );
        }


        // UserDashboard listens for this event and reloads My Favorites.
        window.dispatchEvent(
          new Event(
            "favoritesChange"
          )
        );

      } catch (error) {

        console.error(
          "Error updating favorite:",
          error
        );


        // Backend failed: restore the previous heart state.
        setWishlist(
          previousWishlist
        );


        alert(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to update this favorite. Please try again."
        );
      }

    };


  const handleCategoryChange =
    (category) => {

      if (
        selectedCategories.includes(
          category
        )
      ) {

        setSelectedCategories(
          selectedCategories.filter(
            (item) =>
              item !==
              category
          )
        );

      } else {

        setSelectedCategories([
          ...selectedCategories,
          category,
        ]);

      }

    };


  const applyFilters =
    () => {

      setAppliedFilters({
        price:
          selectedPrice,

        availability:
          selectedAvailability,
      });


      setCurrentPage(1);

    };


  const resetFilters =
    () => {

      setSearchInput("");
      setSearchTerm("");

      setSelectedLocation(
        "All"
      );

      setSelectedCategories(
        []
      );

      setActiveCategory(
        "All"
      );

      setSelectedRating(
        0
      );

      setSortBy(
        "topRated"
      );


      setViewMode(
        "grid"
      );

      setSelectedPrice(
        "all"
      );

      setSelectedAvailability(
        ""
      );

      setAppliedFilters({
        price:
          "all",

        availability:
          "",
      });

      setCurrentPage(
        1
      );

    };


  const [
    selectedPrice,
    setSelectedPrice
  ] = useState(
    "all"
  );


  const [
    selectedAvailability,
    setSelectedAvailability
  ] = useState(
    ""
  );


  const [
    appliedFilters,
    setAppliedFilters
  ] = useState({
    price:
      "all",

    availability:
      "",
  });


  // FILTERED + SORTED DATA
  const filteredProviders =
    providers

      .filter(
        (provider) => {

          const normalizedSearch =
            searchTerm
              .trim()
              .toLowerCase();


          const searchableValues =[
              provider.name,

              provider.full_name,

              provider.title,

              provider.category,

              provider.city,

              provider.bio,

              provider.service_description,

              ...(CATEGORY_SEARCH_ALIASES[
                provider.category
              ] || []),

              ...(
                provider.offers ||
                []
              ).map(
                (offer) =>
                  offer.offer_name
              ),
            ]

              .filter(
                Boolean
              )

              .map(
                (value) =>
                  String(
                    value
                  ).toLowerCase()
              );


          const searchMatch =
            normalizedSearch ===
              "" ||

            searchableValues.some(
              (value) =>
                value.includes(
                  normalizedSearch
                )
            );


          const locationMatch =
            selectedLocation ===
              "All" ||

            String(
              provider.city ||
                ""
            )
              .trim()
              .toLowerCase() ===

              selectedLocation
                .trim()
                .toLowerCase();


          let categoryMatch =
            true;


          if (
            activeCategory !==
            "All"
          ) {

            if (
              activeCategory ===
              "Others"
            ) {

              categoryMatch =
                !MAIN_CATEGORIES.includes(
                  provider.category
                );

            } else {

              categoryMatch =
                provider.category ===
                activeCategory;

            }
          }


          if (
            selectedCategories.length >
            0
          ) {

            categoryMatch =
              categoryMatch &&

              selectedCategories.some(
                (cat) => {

                  if (
                    cat ===
                    "Others"
                  ) {

                    return !MAIN_CATEGORIES.includes(
                      provider.category
                    );

                  }

                  return (
                    provider.category ===
                    cat
                  );

                }
              );
          }


          const ratingMatch =
            Number(
              provider.rating ||
                0
            ) >=
            selectedRating;


          const priceMatch =
            appliedFilters.price ===
              "all" ||

            (
              provider.price !=
                null &&

              (
                (
                  appliedFilters.price ===
                    "0-499" &&

                  provider.price <=
                    499
                ) ||

                (
                  appliedFilters.price ===
                    "500-999" &&

                  provider.price >=
                    500 &&

                  provider.price <=
                    999
                ) ||

                (
                  appliedFilters.price ===
                    "1000+" &&

                  provider.price >=
                    1000
                )
              )
            );


          const availabilityMatch =
            !appliedFilters.availability ||

            (
              appliedFilters.availability ===
                "today" &&

              (
                provider.availability
                  ? isAvailableToday(
                      provider
                    )
                  : provider.available ===
                    true
              )
            ) ||

            (
              appliedFilters.availability ===
                "week" &&

              isAvailableThisWeek(
                provider
              )
            );


          return (
            searchMatch &&
            locationMatch &&
            categoryMatch &&
            ratingMatch &&
            priceMatch &&
            availabilityMatch &&
            provider.available === true
          );

        }
      )

      .sort(
        (a, b) => {

          if (
            sortBy ===
            "topRated"
          ) {
            return (
              b.rating -
              a.rating
            );
          }


          if (
            sortBy ===
            "priceLow"
          ) {
            return (
              a.price -
              b.price
            );
          }


          if (
            sortBy ===
            "priceHigh"
          ) {
            return (
              b.price -
              a.price
            );
          }


          return 0;
        }
      );


  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    searchTerm,
    selectedLocation,
    activeCategory,
    selectedCategories,
    selectedRating,
    sortBy,
    appliedFilters.price,
    appliedFilters.availability,
  ]);


  // PAGINATION LOGIC
  const totalPages =
    Math.ceil(
      filteredProviders.length /
        CARDS_PER_PAGE
    );


  const paginatedProviders =
    filteredProviders.slice(
      (
        currentPage -
        1
      ) *
        CARDS_PER_PAGE,

      currentPage *
        CARDS_PER_PAGE
    );


  const handleSearchSubmit = () => {
    const submittedSearch =
      searchInput.trim();

    const matchedCategory =
      getCategoryFromSearch(
        submittedSearch
      );

    // Search should never remain trapped inside a previously selected
    // category/sidebar category filter.
    setSelectedCategories(
      []
    );

    if (matchedCategory) {
      // Category search:
      // activate the matching category pill and let that category
      // decide which service cards are shown.
      setActiveCategory(
        matchedCategory
      );

      setSearchTerm(
        ""
      );
    } else {
      // Provider/service/location/offer search:
      // search across every category.
      setActiveCategory(
        "All"
      );

      setSearchTerm(
        submittedSearch
      );
    }

    setCurrentPage(
      1
    );

    // For a category search, show the selected category pill and the
    // service cards directly below it. For a normal text search, move
    // straight to the results.
    setTimeout(() => {
      const targetSection =
        matchedCategory
          ? categorySectionRef.current
          : serviceResultsRef.current;

      if (!targetSection) {
        return;
      }

      const navbarHeight =
        120;

      const scrollTop =
        targetSection
          .getBoundingClientRect()
          .top +
        window.pageYOffset -
        navbarHeight;

      window.scrollTo({
        top: Math.max(
          0,
          scrollTop
        ),
        behavior:
          "smooth",
      });
    }, 80);
  };


  const handlePageChange =
    (page) => {

      setCurrentPage(
        page
      );


      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });

    };


  return (

    <div className="explore-page">

      {/* SEARCH */}
      <section className="search-section">

        <div
          className="search-box"
          style={{
            paddingRight: 0,
            gap: 12,
          }}
        >

          <FaSearch />

          <input
            type="text"
            placeholder="Search provider, service, category, offer or location..."
            value={searchInput}
            onChange={(e) => {
              // Typing alone does not change the cards.
              setSearchInput(
                e.target.value
              );
            }}
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
          />

          <button
            type="button"
            onClick={
              handleSearchSubmit
            }
            aria-label="Search services"
            style={{
              alignSelf:
                "stretch",
              minWidth:
                "112px",
              padding:
                "0 22px",
              border:
                "none",
              borderLeft:
                "1px solid #f0d5e1",
              borderRadius:
                "0 16px 16px 0",
              background:
                "#ec4899",
              color:
                "#ffffff",
              font:
                "inherit",
              fontWeight:
                700,
              cursor:
                "pointer",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap:
                "8px",
              flexShrink:
                0,
            }}
          >
            <FaSearch />
            <span>
              Search
            </span>
          </button>

        </div>


        <div className="location-box">

          <FaMapMarkerAlt />

          <select
            value={selectedLocation}
            onChange={(e) => {

              setSelectedLocation(
                e.target.value
              );

              setCurrentPage(
                1
              );

            }}
          >

            <option value="All">
              All Locations
            </option>{availableLocations.map(
              (location) => (

                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>

              )
            )}

          </select>

        </div>

      </section>


      {/* HEADER */}
      <section className="service-header">

        <div className="header-left">

          <span className="hero-tag">
            🌸 EMPOWERING WOMEN, BUILDING FUTURES
          </span>

          <h1 className="hero-title">
            Our Service Providers
          </h1>

          <div className="title-line"></div>

          <p className="hero-desc">
            Discover skilled and trusted women professionals near you.
          </p>

          <div className="hero-features">

            <div className="feature-box">
              <FaAward />
              <span>
                Verified Experts
              </span>
            </div>

            <div className="feature-box">
              <FaStar />
              <span>
                Quality Services
              </span>
            </div>

            <div className="feature-box">
              <FaMapMarkerAlt />
              <span>
                Available Near You
              </span>
            </div>

            <div className="feature-box">
              <FaShieldAlt />
              <span>
                Safe & Reliable
              </span>
            </div>

          </div>

        </div>


        <div className="header-right">

          <img
            src={bannerWomen}
            alt="Providers Banner"
          />

        </div>

      </section>


      {/* CATEGORY PILLS */}
      <div
        ref={categorySectionRef}
        className="categories-container"
      >

        <div
          id="category-pills"
          className="categories-container"
        >

          <section className="category-row">

            <button
              className={`category-pill ${
                activeCategory ===
                "All"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "All"
                );

                // Clear any previous search/category selection so
                // All Categories can show every active service card.
                setSelectedCategories(
                  []
                );

                setSearchInput(
                  ""
                );

                setSearchTerm(
                  ""
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaThLarge />
              All Categories
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Beauty & Wellness"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Beauty & Wellness"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaSpa />
              Beauty & Wellness
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Mehendi & Bridal"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Mehendi & Bridal"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaPaintBrush />
              Mehendi & Bridal
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Tailoring & Fashion"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Tailoring & Fashion"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaTshirt />
              Tailoring & Fashion
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Food & Catering"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Food & Catering"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaUtensils />
              Food & Catering
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Education & Tutoring"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Education & Tutoring"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaBook />
              Education & Tutoring
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Yoga & Fitness"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Yoga & Fitness"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaDumbbell />
              Yoga & Fitness
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Home Services"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Home Services"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaHome />
              Home Services
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Arts & Crafts"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Arts & Crafts"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaPalette />
              Arts & Crafts
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Hospitality"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Hospitality"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaHotel />
              Hospitality
            </button>


            <button
              className={`category-pill ${
                activeCategory ===
                "Others"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  "Others"
                );

                setCurrentPage(
                  1
                );
              }}
            >
              <FaEllipsisH />
              Others
            </button>

          </section>

        </div>

      </div>


      {/* MAIN SECTION */}
      <section className="main-layout">


        {/* SIDEBAR */}
        <aside className="filters">

          <div className="filter-header">

            <h3>
              Filters
            </h3>

            <span
              className="reset"
              onClick={
                resetFilters
              }
            >
              <FaRedoAlt />
              Reset
            </span>

          </div>


          {/* CATEGORY */}
          <div className="filter-group">

            <h4
              onClick={() =>
                toggleSection(
                  "category"
                )
              }
            >
              Category
              <FaChevronDown />
            </h4>


            {openSections.category && (

              <>

                {[
                  "Beauty & Wellness",
                  "Mehendi & Bridal",
                  "Tailoring & Fashion",
                  "Food & Catering",
                  "Education & Tutoring",
                  "Yoga & Fitness",
                  "Home Services",
                  "Arts & Crafts",
                  "Hospitality",
                  "Others",
                ].map(
                  (cat) => (

                    <label key={cat}>

                      <input
                        type="checkbox"
                        checked={
                          selectedCategories.includes(
                            cat
                          )
                        }
                        onChange={() =>
                          handleCategoryChange(
                            cat
                          )
                        }
                      />

                      {cat}

                    </label>

                  )
                )}

              </>

            )}

          </div>


          {/* RATING */}
          <div className="filter-group">

            <h4
              onClick={() =>
                toggleSection(
                  "rating"
                )
              }
            >
              Rating
              <FaChevronDown />
            </h4>


            {openSections.rating && (

              <>

                <label>

                  <input
                    type="checkbox"
                    checked={
                      selectedRating ===
                      4.5
                    }
                    onChange={() =>
                      setSelectedRating(
                        selectedRating ===
                          4.5
                          ? 0
                          : 4.5
                      )
                    }
                  />

                  <FaStar className="star" />

                4.5 & Above

                </label>


                <label>

                  <input
                    type="checkbox"checked={
                      selectedRating ===
                      4.0
                    }
                    onChange={() =>
                      setSelectedRating(
                        selectedRating ===
                          4.0
                          ? 0
                          : 4.0
                      )
                    }
                  />

                  <FaStar className="star" />

                  4.0 & Above

                </label>


                <label>

                  <input
                    type="checkbox"
                    checked={
                      selectedRating ===
                      3.5
                    }
                    onChange={() =>
                      setSelectedRating(
                        selectedRating ===
                          3.5
                          ? 0
                          : 3.5
                      )
                    }
                  />

                  <FaStar className="star" />

                  3.5 & Above

                </label>

              </>

            )}

          </div>


          {/* PRICE */}
          <div className="filter-group">

            <h4
              onClick={() =>
                toggleSection(
                  "price"
                )
              }
            >
              Price Range
              <FaChevronDown />
            </h4>


            {openSections.price && (

              <div className="price-tags">

                <span
                  className={
                    selectedPrice ===
                    "0-499"
                      ? "active-tag"
                      : ""
                  }
                  onClick={() =>
                    setSelectedPrice(
                      "0-499"
                    )
                  }
                >
                  ₹0-499
                </span>


                <span
                  className={
                    selectedPrice ===
                    "500-999"
                      ? "active-tag"
                      : ""
                  }
                  onClick={() =>
                    setSelectedPrice(
                      "500-999"
                    )
                  }
                >
                  ₹500-999
                </span>


                <span
                  className={
                    selectedPrice ===
                    "1000+"
                      ? "active-tag"
                      : ""
                  }
                  onClick={() =>
                    setSelectedPrice(
                      "1000+"
                    )
                  }
                >
                  ₹1000+
                </span>

              </div>

            )}

          </div>


          {/* AVAILABILITY */}
          <div className="filter-group">

            <h4
              onClick={() =>
                toggleSection(
                  "availability"
                )
              }
            >
              Availability
              <FaChevronDown />
            </h4>


            {openSections.availability && (

              <>

                <label>

                  <input
                    type="checkbox"
                    checked={
                      selectedAvailability ===
                      "today"
                    }
                    onChange={(e) =>
                      setSelectedAvailability(
                        e.target.checked
                          ? "today"
                          : ""
                      )
                    }
                  />

                  Available Today

                </label>


                <label>

                  <input
                    type="checkbox"
                    checked={
                      selectedAvailability ===
                      "week"
                    }
                    onChange={(e) =>
                      setSelectedAvailability(
                        e.target.checked
                          ? "week"
                          : ""
                      )
                    }
                  />

                  Available This Week

                </label>

              </>

            )}

          </div>


          <button
            className="apply-btn"
            onClick={
              applyFilters
            }
          >
            Apply Filters
          </button>

        </aside>


        {/* CONTENT */}
        <div
          ref={
            serviceResultsRef
          }
          className="provider-section"
        >

          <div className="top-bar">

            <p>
              Showing{" "}
              {filteredProviders.length >
              0
                ? `${(
                    currentPage -
                    1
                  ) *
                    CARDS_PER_PAGE +
                    1}–${Math.min(
                    currentPage *
                      CARDS_PER_PAGE,
                    filteredProviders.length
                  )}`
                : "0"}{" "}
              of{" "}
              {
                filteredProviders.length
              }{" "}
              services
            </p>


            <div className="sort-area">

              <div className="sort-box">

                <span>
                  Sort by:
                </span>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                >

                  <option value="topRated">
                    Top Rated
                  </option>

                  <option value="priceLow">
                    Price Low To High
                  </option>

                  <option value="priceHigh">
                    Price High To Low
                  </option>

                </select>

              </div>


              <div className="view-buttons">

                <button
                  onClick={() =>
                    setViewMode(
                      "grid"
                    )
                  }
                  className={
                    viewMode ===
                    "grid"
                      ? "active-view"
                      : ""
                  }
                >
                  <FaThLarge />
                </button>


                <button
                  onClick={() =>
                    setViewMode(
                      "list"
                    )
                  }
                  className={
                    viewMode ===
                    "list"
                      ? "active-view"
                      : ""
                  }
                >
                  <FaBars />
                </button>

              </div>

            </div>

          </div>


          {providersLoading && (

            <p
              style={{
                textAlign:
                  "center",

                width:
                  "100%",

                padding:
                  "40px 0",
              }}
            >
              Loading services...
            </p>

          )}


          {!providersLoading &&
            providersError && (

              <p
                style={{
                  textAlign:
                    "center",

                  width:
                    "100%",

                  padding:
                    "40px 0",

                  color:
                    "crimson",
                }}
              >
                {
                  providersError
                }
              </p>

            )}


          {!providersLoading &&
            !providersError &&
            filteredProviders.length ===
              0 && (

              <div
                style={{
                  textAlign:
                    "center",

                  width:
                    "100%",

                  padding:
                    "40px 0",
                }}
              >

                <h3>
                  No matching services found
                </h3>

                <p>
                  Try another provider name, service, category, offer or location.
                </p>

              </div>

            )}


          {!providersLoading &&
            !providersError && (

              <div
                className={`providers-grid ${
                  viewMode ===
                  "list"
                    ? "list"
                    : ""
                }`}
              >

                {paginatedProviders.map(
                  (provider) => {

                    const badge =
                      getProviderBadge(
                        provider
                      );


                    const hasWeeklySchedule =
                      Boolean(
                        provider.availability
                      );


                    const availableToday =
                      hasWeeklySchedule
                        ? isAvailableToday(
                            provider
                          )
                        : provider.available;


                    const availabilityLabel =
                      hasWeeklySchedule
                        ? availableToday
                          ? "✓ Available Today"
                          : "✗ Unavailable Today"
                        : availableToday
                        ? "✓ Available"
                        : "✗ Unavailable";


                    const isFavorited =
                      wishlist.some(
                        (item) =>
                          Number(
                            item.service_id
                          ) ===
                          Number(
                            provider.service_id
                          )
                      );


                    return (

                      <div
                        className="provider-card"
                        key={
                          provider.id
                        }
                      >

                        <div className="card-overlay">

                          <button
                            className={`wishlist-btn ${
                              isFavorited
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleWishlist(
                                provider
                              )
                            }
                          >

                            {isFavorited
                              ? (
                                <FaHeart />
                              )
                              : (
                                <FaRegHeart />
                              )
                            }

                          </button>

                        </div>


                        <img
                          src={
                            provider.image
                          }
                          alt={
                            provider.name
                          }
                        /><div className="provider-status-bar">

                          <div
                            className={`status-left ${
                              badge.className
                            }`}
                          >
                            {
                              badge.icon
                            }{" "}
                            {
                              badge.text
                            }
                          </div>


                          <div
                            className={`status-right ${
                              availableToday
                                ? "available"
                                : "unavailable"
                            }`}
                            style={{
                              marginLeft: "0.02rem",
                            }}
                          >
                            {
                              availabilityLabel
                            }
                          </div>


                          {viewMode === "list" && (
                            <button
                              type="button"
                              aria-label={
                                isFavorited
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              title={
                                isFavorited
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              onClick={() =>
                                toggleWishlist(
                                  provider
                                )
                              }
                              style={{
                                width: "32px",
                                height: "32px",
                                flexShrink: 0,
                                marginLeft: "14px",
                                padding: 0,
                                border: "none",
                                borderRadius: 0,
                                background: "transparent",
                                color: "#e6398a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "22px",
                                cursor: "pointer",
                                transition:
                                  "transform 0.25s ease",
                              }}
                            >
                              {isFavorited
                                ? (
                                  <FaHeart />
                                )
                                : (
                                  <FaRegHeart />
                                )
                              }
                            </button>
                          )}

                        </div>


                        <div className="card-wave"></div>


                        <div className="provider-hover-info">

                          <h4>
                            {
                              provider.title ||
                              provider.name
                            }
                          </h4>

                          <p>
                            ⭐{" "}
                            {
                              provider.rating
                            }{" "}
                            Rating
                          </p>

                          <p>
                            {
                              provider.reviews
                            }
                            + Reviews
                          </p>


                          <button
                            className="hover-profile-btn"
                            onClick={() =>
                              navigate(
                                `/provider-profile/${provider.provider_id}?service=${provider.service_id}`
                              )
                            }
                          >
                            View Profile
                          </button>

                        </div>


                        <div className="card-content">

                          <h3>
                            {
                              provider.title ||
                              provider.name
                            }
                          </h3>


                          <div className="meta-row">

                            <span className="rating">

                              ⭐{" "}
                              {
                                provider.rating
                              }

                              <small>
                                (
                                {
                                  provider.reviews
                                }
                                )
                              </small>

                            </span>


                            <span className="location">

                              📍{" "}
                              {
                                provider.city
                              }

                            </span>

                          </div>


                          <p className="price">

                            {provider.price_min !=
                            null
                              ? "Price Range"
                              : "Pricing"}


                            <span>

                              {provider.price_min !=
                              null

                                ? `₹${provider.price_min.toLocaleString(
                                    "en-IN"
                                  )}${
                                    provider.price_max !=
                                    null
                                      ? ` – ₹${provider.price_max.toLocaleString(
                                          "en-IN"
                                        )}`
                                      : "+"
                                  }`

                                : "Contact for details"
                              }

                            </span>

                          </p>


                          <button
                            className="profile-btn"
                            onClick={() =>
                              navigate(
                                `/provider-profile/${provider.provider_id}?service=${provider.service_id}`
                              )
                            }
                          >
                            View Profile →
                          </button>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}


          {/* PAGINATION */}
          {!providersLoading &&
            !providersError &&
            totalPages >
              1 && (

              <div className="pagination">

                <button
                  className={`page-btn ${
                    currentPage ===
                    1
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() =>
                    currentPage >
                      1 &&
                    handlePageChange(
                      currentPage -
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    1
                  }
                >
                  ‹
                </button>


                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (
                    _,
                    i
                  ) =>
                    i +
                    1
                ).map(
                  (page) => (

                    <button
                      key={
                        page
                      }
                      className={`page-btn ${
                        currentPage ===
                        page
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handlePageChange(
                          page
                        )
                      }
                    >
                      {
                        page
                      }
                    </button>

                  )
                )}


                <button
                  className={`page-btn ${
                    currentPage ===
                    totalPages
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() =>
                    currentPage <
                      totalPages &&
                    handlePageChange(
                      currentPage +
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  ›
                </button>

              </div>

            )}

        </div>

      </section>


      {/* TESTIMONIALS */}
      <section className="testimonial-section">

        <div className="testimonial-wave"></div>

        <h2 className="testimonial-title">
          🌿 What Our Customers Say 🌿
        </h2>


        <div className="testimonial-grid">


          <div className="testimonial-card">

            <div className="stars">
              ★★★★★
            </div>

            <p>
              Found an amazing bridal artist within minutes. The process was smooth and trustworthy.
            </p>


            <div className="customer-info">

              <img
                src={
                  customer1
                }
                alt="Ayesha Khan"
              />


              <div>

                <h4>
                  Ayesha Khan
                </h4>

                <span>
                  Hyderabad
                </span>

              </div>

            </div>

          </div>


          <div className="testimonial-card">

            <div className="stars">
              ★★★★★
            </div>

            <p>
              Excellent tailoring service. The quality exceeded my expectations.
            </p>


            <div className="customer-info">

              <img
                src={
                  customer2
                }
                alt="Sneha Reddy"
              />


              <div>

                <h4>
                  Sneha Reddy
                </h4>

                <span>
                  Hyderabad
                </span>

              </div>

            </div>

          </div>


          <div className="testimonial-card">

            <div className="stars">
              ★★★★★
            </div>

            <p>
              NariBazar helped me discover local women-led businesses I never knew existed.
            </p>


            <div className="customer-info">

              <img
                src={
                  customer3
                }
                alt="Kavya Sharma"
              />


              <div>

                <h4>
                  Kavya Sharma
                </h4>

                <span>
                  Hyderabad
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* TRUST SECTION */}
      <section className="trust-section">

        <div className="trust-card">

          <FaShieldAlt
            size={
              30
            }
          />

          <h4>
            Verified & Trusted
          </h4>

          <p>
            All service providers are verified for your safety.
          </p>

        </div>


        <div className="trust-card">

          <FaAward
            size={
              30
            }
          />

          <h4>
            Top Quality Service
          </h4>

          <p>
            We ensure the best quality services.
          </p>

        </div>


        <div className="trust-card">

          <FaUsers
            size={
              30
            }
          />

          <h4>
            Empowering Women
          </h4>

          <p>
            Every booking supports women entrepreneurs.
          </p>

        </div>


        <div className="trust-card">

          <FaHeadset
            size={
              30
            }
          />

          <h4>
            24/7 Support
          </h4>

          <p>
            We are here to help anytime.
          </p>

        </div>

      </section>

    </div>
  );
}


export default Explore;