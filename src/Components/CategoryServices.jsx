import { useState } from "react";
import "./CategoryServices.css";

const services = [
  /* =========================================================
     MAIN CATEGORIES
  ========================================================= */

  {
    id: "beauty",
    title: "Beauty & Wellness",
    short: "Salon, skincare, spa, makeup & haircare",
    desc: "Professional beauty and wellness services from trusted women professionals.",
    image: "/image/Beautician.jpg",
    color: "#e8a4c4",
    colorDark: "#c96a97",
  },

  {
    id: "bridal",
    title: "Mehendi & Bridal",
    short: "Bridal makeup, mehendi & hairstyling",
    desc: "Everything you need to get ready for weddings and special celebrations.",
    image: "/image/Mehendi.jpg",
    color: "#d9a8c1",
    colorDark: "#b96e94",
  },

  {
    id: "tailoring",
    title: "Tailoring & Fashion",
    short: "Custom tailoring, boutiques & alterations",
    desc: "Personalized fashion solutions, embroidery, alterations and designer wear.",
    image: "/image/Tailor.jpg",
    color: "#b3a8e0",
    colorDark: "#7c6bc7",
  },

  {
    id: "food",
    title: "Food & Catering",
    short: "Home chefs, bakers & event catering",
    desc: "Homemade food, baking and catering services for everyday needs and events.",
    image: "/image/Food.jpg",
    color: "#e0b894",
    colorDark: "#c98c4f",
  },

  {
    id: "education",
    title: "Education & Tutoring",
    short: "Tutors, classes & skill development",
    desc: "Academic coaching, languages, online classes and skill development.",
    image: "/image/Tutoring.jpg",
    color: "#9bc0dd",
    colorDark: "#5a94bd",
  },

  {
    id: "fitness",
    title: "Yoga & Fitness",
    short: "Yoga, fitness, Zumba & meditation",
    desc: "Wellness coaching, yoga, fitness and mindful movement with professionals.",
    image: "/image/fitness.jpg",
    color: "#8fc9ac",
    colorDark: "#4f9b74",
  },

  {
    id: "home",
    title: "Home Services",
    short: "Cleaning, repairs & maintenance",
    desc: "Trusted women professionals for home care, maintenance and everyday help.",
    image: "/image/homeservices.jpg",
    color: "#d99aa1",
    colorDark: "#bd5e6a",
  },

  {
    id: "arts",
    title: "Arts & Crafts",
    short: "Handmade gifts, art & creative workshops",
    desc: "Creative products, customized art, handicrafts and workshops by talented artisans.",
    image: "/image/artcraft.jpg",
    color: "#cba8db",
    colorDark: "#9c6bbe",
  },

  /* =========================================================
     ADDITIONAL / OTHER SERVICES
  ========================================================= */

  {
    id: "laundry",
    title: "Laundry & Ironing",
    short: "Washing, ironing & garment care",
    desc: "Convenient laundry, ironing and garment-care services for everyday needs.",
    image: "/image/laundry.jpg",
    color: "#a8c7df",
    colorDark: "#5b8fb8",
  },

  {
    id: "homeDecor",
    title: "Home Decor",
    short: "Interior styling, decor & organization",
    desc: "Creative home styling, organization and decor solutions for beautiful spaces.",
    image: "/image/homedecor.jpg",
    color: "#d7b69a",
    colorDark: "#a97952",
  },

  {
    id: "childcare",
    title: "Child Care",
    short: "Childcare, babysitting & activity support",
    desc: "Trusted childcare support for families looking for dependable everyday assistance.",
    image: "/image/childcare.jpg",
    color: "#f0b5c5",
    colorDark: "#c96d89",
  },

  {
    id: "eldercare",
    title: "Elder Care",
    short: "Companionship & everyday assistance",
    desc: "Supportive everyday assistance and companionship services for older family members.",
    image: "/image/eldercare.jpg",
    color: "#b8c7dd",
    colorDark: "#7186a8",
  },
];


/* =========================================================
   CATEGORY GROUPS
   EXACTLY 4 SERVICES IN EVERY SECTION
========================================================= */

const needGroups = [
  {
    id: "yourself",
    number: "01",
    title: "For Yourself",
    subtitle: "Services that help you look, feel and grow your best.",
    serviceIds: ["beauty", "tailoring", "fitness", "arts"],
  },

  {
    id: "home",
    number: "02",
    title: "For Your Home",
    subtitle: "Reliable services for everyday home needs and a comfortable living space.",
    serviceIds: ["home", "food", "laundry", "homeDecor"],
  },

  {
    id: "family",
    number: "03",
    title: "For Your Family",
    subtitle: "Helpful services for learning, wellness and everyday family life.",
    serviceIds: ["education", "fitness", "childcare", "eldercare"],
  },

  {
    id: "occasion",
    number: "04",
    title: "For Special Occasions",
    subtitle: "Make celebrations easier with trusted women professionals.",
    serviceIds: ["bridal", "beauty", "food", "arts"],
  },
];


export default function CategoryServices() {
  const [activeNeed, setActiveNeed] = useState("yourself");

  const activeGroup =
    needGroups.find((group) => group.id === activeNeed) || needGroups[0];

  const visibleServices = activeGroup.serviceIds
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean);

  return (
    <section className="service-category-section">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="service-category-heading">

        <span className="service-category-eyebrow">
          What we offer
        </span>

        <h2 className="service-category-title">
          Find the service{" "}
          <span>for your need</span>
        </h2>

        <p className="service-category-subtitle">
          Explore trusted women professionals based on what
          you need today — for yourself, your home, your family
          or a special occasion.
        </p>

      </div>


      {/* =====================================================
          NEED SELECTOR
      ===================================================== */}

      <div
        className="service-need-selector"
        role="tablist"
        aria-label="Service needs"
      >

        {needGroups.map((group) => {

          const isActive = activeNeed === group.id;

          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`service-need-tab ${isActive ? "service-need-tab-active" : ""}`}
              onClick={() => setActiveNeed(group.id)}
            >

              <span className="service-need-number">
                {group.number}
              </span>

              <span className="service-need-tab-label">
                {group.title}
              </span>

              <span className="service-need-tab-arrow">
                →
              </span>

            </button>
          );
        })}

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="service-need-content">

        <div className="service-need-intro">

          <span className="service-need-label">
            Explore by need
          </span>

          <h3>
            {activeGroup.title}
          </h3>

          <p>
            {activeGroup.subtitle}
          </p>

        </div>


        {/* ===================================================
            EXACTLY 4 SERVICE CARDS
        =================================================== */}

        <div
          key={activeNeed}
          className={`service-category-grid service-category-grid-${visibleServices.length}`}
        >

          {visibleServices.map((item, index) => (

            <article
              key={item.id}
              className="service-category-card"
              style={{
                "--i": index,
                "--accent": item.color,
                "--accent-dark": item.colorDark,
              }}
            >

              {/* IMAGE */}

              <div className="service-card-image">

                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="service-card-image-overlay" />

                <span className="service-card-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

              </div>


              {/* CONTENT */}

              <div className="service-card-body">

                <h4>
                  {item.title}
                </h4>

                <p className="service-card-short">
                  {item.short}
                </p>

                <p className="service-card-desc">
                  {item.desc}
                </p>

                <button
                  type="button"
                  className="service-card-arrow"
                >
                  
                </button>

              </div>

            </article>

          ))}

        </div>

      </div>

    </section>
  );
}