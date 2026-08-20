import { useEffect, useMemo, useState } from "react";
import India from "@react-map/india";
import "./AboutBanner.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const AboutBanner = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeProvider, setActiveProvider] = useState(null);
  const [completedProviders, setCompletedProviders] = useState([]);

  /* =====================================================
     FETCH PROVIDERS FROM DATABASE
  ===================================================== */

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/v1/providers/`
        );

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("Providers received:", result);

        const providerList = Array.isArray(result)
          ? result
          : result.providers ||
            result.data ||
            result.items ||
            [];

        setProviders(providerList);
      } catch (error) {
        console.error(
          "Provider fetch failed:",
          error
        );

        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  /* =====================================================
     ALL REGISTERED PROVIDERS
     + ALPHABETICAL ORDER
  ===================================================== */

  const verifiedProviders = useMemo(() => {
    return [...providers].sort((a, b) =>
      String(a.name || a.full_name || "").localeCompare(
        String(b.name || b.full_name || "")
      )
    );
  }, [providers]);

  /* =====================================================
     CITY → MAP POSITION

     For now this uses city coordinates.

     Later database can directly store latitude
     and longitude.
  ===================================================== */

  const cityCoordinates = {
    Delhi: {
      latitude: 28.6139,
      longitude: 77.209,
    },

    Mumbai: {
      latitude: 19.076,
      longitude: 72.8777,
    },

    Hyderabad: {
      latitude: 17.385,
      longitude: 78.4867,
    },

    Chennai: {
      latitude: 13.0827,
      longitude: 80.2707,
    },

    Kolkata: {
      latitude: 22.5726,
      longitude: 88.3639,
    },

    Bangalore: {
      latitude: 12.9716,
      longitude: 77.5946,
    },

    Bengaluru: {
      latitude: 12.9716,
      longitude: 77.5946,
    },

    Pune: {
      latitude: 18.5204,
      longitude: 73.8567,
    },

    Ahmedabad: {
      latitude: 23.0225,
      longitude: 72.5714,
    },

    Jaipur: {
      latitude: 26.9124,
      longitude: 75.7873,
    },

    Kochi: {
      latitude: 9.9312,
      longitude: 76.2673,
    },

    Lucknow: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
  };

  /* =====================================================
     GET PROVIDER POSITION
  ===================================================== */

  const getMapPosition = (provider) => {
    let latitude = provider.latitude;
    let longitude = provider.longitude;

    /* If database doesn't have coordinates,
       use city coordinates */

    if (
      !latitude ||
      !longitude
    ) {
      const city =
        provider.city ||
        provider.location ||
        "";

      const coordinates =
        cityCoordinates[city];

      if (coordinates) {
        latitude =
          coordinates.latitude;

        longitude =
          coordinates.longitude;
      }
    }

    /* fallback */

    latitude =
      Number(latitude) || 20.5937;

    longitude =
      Number(longitude) || 78.9629;

    /*
      India approximate bounds

      Longitude: 68 → 97
      Latitude: 8 → 35
    */

    let x =
      ((longitude - 68) / 29) * 100;

    let y =
      ((35 - latitude) / 27) * 100;

    x = Math.min(
      92,
      Math.max(8, x)
    );

    y = Math.min(
      92,
      Math.max(8, y)
    );

    return {
      x,
      y,
    };
  };

  /* =====================================================
     PROVIDER ANIMATION

     Faster:
     1. Provider appears
     2. Card pops
     3. Provider stays
     4. Next provider
  ===================================================== */

  useEffect(() => {
    if (!verifiedProviders.length) {
      setActiveProvider(null);
      return;
    }

    if (
      activeIndex >=
      verifiedProviders.length
    ) {
      setActiveIndex(0);
      return;
    }

    const provider =
      verifiedProviders[activeIndex];

    setActiveProvider(provider);

    /* Card duration */

    const finishTimer =
      setTimeout(() => {
        setCompletedProviders(
          (previous) => {
            if (
              previous.includes(
                provider.id
              )
            ) {
              return previous;
            }

            return [
              ...previous,
              provider.id,
            ];
          }
        );

        setActiveProvider(null);
      }, 1500);

    /* Next provider */

    const nextTimer =
      setTimeout(() => {
        setActiveIndex(
          (previous) =>
            (previous + 1) %
            verifiedProviders.length
        );
      }, 1800);

    return () => {
      clearTimeout(
        finishTimer
      );

      clearTimeout(
        nextTimer
      );
    };
  }, [
    activeIndex,
    verifiedProviders,
  ]);

  /* =====================================================
     RESET AFTER COMPLETE A-Z CYCLE
  ===================================================== */

  useEffect(() => {
    if (
      verifiedProviders.length > 0 &&
      completedProviders.length ===
        verifiedProviders.length
    ) {
      const timer =
        setTimeout(() => {
          setCompletedProviders([]);
          setActiveIndex(0);
        }, 700);

      return () =>
        clearTimeout(timer);
    }
  }, [
    completedProviders,
    verifiedProviders,
  ]);

  /* =====================================================
     IMAGE HELPER
  ===================================================== */

  const getProviderImage = (
    provider
  ) => {
    return (
      provider.image ||
      provider.profile_image ||
      provider.profileImage ||
      provider.photo ||
      "/image/default-profile.png"
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section className="provider-network">

        <div className="provider-network__container">

          <div className="provider-network__content">

            <span className="provider-network__eyebrow">
              OUR WOMEN NETWORK
            </span>

            <h2>
              Connecting{" "}
              <span>Women</span>
              <br />
              Across India
            </h2>

            <p>
              Discover trusted women
              professionals from different
              cities, categories and
              communities.
            </p>

          </div>

          <div className="provider-network__visual">

            <div className="india-map loading-map">

              <India
                type="select-single"
                size={430}
                mapColor="#F3E8FF"
                strokeColor="#A855F7"
                strokeWidth={1}
                hoverColor="#DB2777"
                selectColor="#6B21A8"
              />

            </div>

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="provider-network">

      <div className="provider-network__container">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="provider-network__content">

          <span className="provider-network__eyebrow">
            OUR WOMEN NETWORK
          </span>

          <h2>
            Connecting{" "}
            <span>Women</span>
            <br />
            Across India
          </h2>

          <p>
            Discover trusted women professionals
            from different cities, categories and
            communities, all connected through
            NariBazar.
          </p>

          <div className="provider-network__stats">

            <div className="network-stat">

              <strong>
                {verifiedProviders.length}+
              </strong>

              <span>
                Women
              </span>

            </div>

            <div className="network-stat">

              <strong>
                100+
              </strong>

              <span>
                Cities
              </span>

            </div>

            <div className="network-stat">

              <strong>
                50+
              </strong>

              <span>
                Categories
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="provider-network__visual">

          <div className="india-map">

            {/* REAL INDIA SVG */}

            <div className="india-svg-wrapper">

              <India
                type="select-single"
                size={430}
                mapColor="#F3E8FF"
                strokeColor="#A855F7"
                strokeWidth={1}
                hoverColor="#DB2777"
                selectColor="#6B21A8"
              />

            </div>

            {/* =================================================
                CONNECTION LINES
            ================================================= */}

            <svg
              className="network-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >

              {completedProviders.map(
                (providerId) => {

                  const provider =
                    verifiedProviders.find(
                      (item) =>
                        item.id ===
                        providerId
                    );

                  if (!provider)
                    return null;

                  const position =
                    getMapPosition(
                      provider
                    );

                  return (
                    <line
                      key={
                        provider.id
                      }
                      x1="50"
                      y1="50"
                      x2={
                        position.x
                      }
                      y2={
                        position.y
                      }
                      className="network-connection"
                    />
                  );
                }
              )}

            </svg>

            {/* =================================================
                COMPLETED PROVIDERS
            ================================================= */}

            {completedProviders.map(
              (providerId) => {

                const provider =
                  verifiedProviders.find(
                    (item) =>
                      item.id ===
                      providerId
                  );

                if (!provider)
                  return null;

                const position =
                  getMapPosition(
                    provider
                  );

                return (
                  <div
                    key={
                      provider.id
                    }
                    className="completed-provider"
                    style={{
                      left:
                        `${position.x}%`,
                      top:
                        `${position.y}%`,
                    }}
                  >

                    <span className="location-ripple" />

                    <div className="completed-avatar">

                      <img
                        src={getProviderImage(
                          provider
                        )}
                        alt={
                          provider.name ||
                          provider.full_name ||
                          "Provider"
                        }
                      />

                    </div>

                  </div>
                );
              }
            )}

            {/* =================================================
                ACTIVE PROVIDER
            ================================================= */}

            {activeProvider &&
              (() => {

                const position =
                  getMapPosition(
                    activeProvider
                  );

                return (
                  <div
                    key={
                      activeProvider.id
                    }
                    className="active-provider"
                    style={{
                      left:
                        `${position.x}%`,
                      top:
                        `${position.y}%`,
                    }}
                  >

                    {/* LOCATION */}

                    <div className="active-location">
                      <span />
                    </div>

                    {/* AVATAR */}

                    <div className="active-avatar">

                      <img
                        src={getProviderImage(
                          activeProvider
                        )}
                        alt={
                          activeProvider.name ||
                          activeProvider.full_name ||
                          "Provider"
                        }
                      />

                    </div>

                    {/* CARD */}

                    <div className="provider-popup">

                      <img
                        className="provider-popup__image"
                        src={getProviderImage(
                          activeProvider
                        )}
                        alt={
                          activeProvider.name ||
                          activeProvider.full_name ||
                          "Provider"
                        }
                      />

                      <div className="provider-popup__info">

                        <h3>
                          {
                            activeProvider.name ||
                            activeProvider.full_name ||
                            "Provider"
                          }
                        </h3>

                        <p>
                          {
                            activeProvider.category ||
                            activeProvider.service_category ||
                            "Professional Service"
                          }
                        </p>

                        <span>
                          📍{" "}
                          {
                            activeProvider.city ||
                            activeProvider.location ||
                            "India"
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })()}

          </div>

          <div className="network-status">

            <span className="status-dot" />

            Connecting women professionals
            across India

          </div>

        </div>

      </div>

    </section>
  );
};

export default AboutBanner;