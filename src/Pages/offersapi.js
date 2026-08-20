import api from "./api";

// 🟢 Auto-detecting sub-offers helper.
//
// We don't have a confirmed backend route for "Sub-Offer Packages" (title +
// min/max price), so instead of hardcoding one guess (which silently 404s
// if wrong), this tries several common route names and remembers whichever
// one actually works — used by ProviderDashboard.jsx, Register.jsx,
// ProviderProfile.jsx and ServiceDetailPage.jsx so they all stay in sync.
//
// If NONE of these match your backend, sub-offers simply won't save/show —
// open Swagger UI, search "offer", and tell me the real path shown there;
// then add it to CANDIDATE_BASES below (or replace the list with just that
// one) and everything will work immediately.
const CANDIDATE_BASES = [
  "/offers",
  "/sub-offers",
  "/suboffers",
  "/service-offers",
  "/service_offers",
  "/pricing-packages",
];

let workingBase = null; // cached once we find the real one

const withEachBase = async (attemptFn) => {
  const basesToTry = workingBase
    ? [workingBase, ...CANDIDATE_BASES.filter((b) => b !== workingBase)]
    : CANDIDATE_BASES;

  let lastError = null;
  for (const base of basesToTry) {
    try {
      const result = await attemptFn(base);
      workingBase = base; // remember the one that worked
      return result;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
};

// GET this service's sub-offers. Returns [] on failure (never throws) so
// callers can render safely either way.
export const fetchServiceOffers = async (serviceId) => {
  try {
    const res = await withEachBase((base) => api.get(`${base}/service/${serviceId}`));
    return res.data.data || res.data || [];
  } catch (err) {
    console.error(`Could not fetch sub-offers for service ${serviceId} (tried: ${CANDIDATE_BASES.join(", ")}):`, err);
    return [];
  }
};

// Replace this service's sub-offers with the given list. `offers` items
// need { offer_name, price_min, price_max }. Rows missing any of those are
// silently skipped (packages are optional). `oldOfferIds` are deleted first
// (used when editing an existing service).
export const saveServiceOffers = async (serviceId, offers, oldOfferIds = []) => {
  const validOffers = (offers || []).filter(
    (o) => o.offer_name && String(o.offer_name).trim() && o.price_min !== "" && o.price_max !== ""
  );

  try {
    if (oldOfferIds.length > 0) {
      const base = workingBase || CANDIDATE_BASES[0];
      await Promise.all(
        oldOfferIds.map((id) => api.delete(`${base}/${id}`).catch((err) => console.error("Failed to remove old sub-offer:", err)))
      );
    }

    if (validOffers.length === 0) return;

    await withEachBase((base) =>
      Promise.all(
        validOffers.map((o) =>
          api.post(`${base}/`, {
            service_id: serviceId,
            offer_name: o.offer_name.trim ? o.offer_name.trim() : o.offer_name,
            price_min: o.price_min,
            price_max: o.price_max,
          })
        )
      )
    );
  } catch (err) {
    console.error(`Could not save sub-offers for service ${serviceId} (tried: ${CANDIDATE_BASES.join(", ")}):`, err);
  }
};