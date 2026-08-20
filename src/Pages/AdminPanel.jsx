import React, { useEffect, useState } from "react";
import "./AdminPanel.css";
import api from "../services/api";

const STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const normalizeStatus = (status) =>
  String(status || "pending").trim().toLowerCase();


const sortCategoriesWithOthersLast = (items = []) => {
  return [...items].sort((a, b) => {
    const aName = String(a?.name || "").trim();
    const bName = String(b?.name || "").trim();

    const aIsOthers = aName.toLowerCase() === "others";
    const bIsOthers = bName.toLowerCase() === "others";

    if (aIsOthers && !bIsOthers) return 1;
    if (!aIsOthers && bIsOthers) return -1;

    return aName.localeCompare(bName, undefined, {
      sensitivity: "base",
    });
  });
};

const normalizeAvailabilityFlag = (value) => {
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (
      ["false", "0", "no", "off", "", "null", "undefined"].includes(
        normalizedValue
      )
    ) {
      return false;
    }

    if (["true", "1", "yes", "on"].includes(normalizedValue)) {
      return true;
    }
  }

  return value === true || value === 1;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
};

const isPdfUrl = (url) =>
  String(url || "")
    .split("?")[0]
    .toLowerCase()
    .endsWith(".pdf");

const DetailItem = ({ label, children, wide = false }) => (
  <div className={`admin-detail-item${wide ? " wide" : ""}`}>
    <span>{label}</span>
    <strong>{children ?? "Not available"}</strong>
  </div>
);

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalProviders: 0,
    approvedProviders: 0,
    pendingProviders: 0,
    rejectedProviders: 0,
    totalCategories: 0,
  });

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedProvider, setSelectedProvider] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsError, setDetailsError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [processingProviderId, setProcessingProviderId] = useState(null);

  const [deletingProviderId, setDeletingProviderId] = useState(null);

  const [editedService, setEditedService] = useState({
    full_name: "",
    phone: "",
    email: "",
    category_id: "",
    city: "",
    service_id: null,
    service_bio: "",
  });

  const [newCategory, setNewCategory] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [editedCategoryName, setEditedCategoryName] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");

      const data = response.data || {};

      setStats({
        totalProviders: data.total_providers || 0,
        approvedProviders: data.approved_providers || 0,
        pendingProviders: data.pending_providers || 0,
        rejectedProviders: data.rejected_providers || 0,
        totalCategories: data.total_categories || 0,
      });
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await api.get("/admin/providers");

      const providerList = Array.isArray(response.data)
        ? response.data
        : [];

      setProviders(
        providerList.map((provider) => ({
          ...provider,
          status: normalizeStatus(provider.status),
        }))
      );
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");

      setCategories(
        sortCategoriesWithOthersLast(
          Array.isArray(response.data) ? response.data : []
        )
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProviders();
    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => Number(item.id) === Number(categoryId)
    );

    return category ? category.name : "Uncategorized";
  };

  const setEditValues = (provider) => {
    const providerServices = Array.isArray(provider?.services)
      ? provider.services
      : [];

    const primaryService =
      providerServices.find((service) =>
        String(service?.service_bio || "").trim()
      ) || providerServices[0];

    setEditedService({
      full_name: provider?.full_name || "",

      phone: provider?.phone || "",

      email: provider?.email || "",

      category_id: provider?.category_id || "",

      city: provider?.city || "",

      service_id: primaryService?.id || null,

      service_bio:
        primaryService?.service_bio ||
        provider?.service_description ||
        "",
    });
  };

  const openProviderDetails = async (provider) => {
    setSelectedProvider({
      ...provider,
      status: normalizeStatus(provider.status),
    });

    setEditValues(provider);

    setRejectionReason(
      provider.rejection_reason || ""
    );

    setIsEditing(false);

    setDetailsError("");

    setShowModal(true);

    setDetailsLoading(true);

    try {
      const response = await api.get(
        `/admin/providers/${provider.id}/details`
      );

      const details = response.data || provider;

      setSelectedProvider({
        ...details,

        status: normalizeStatus(details.status),

        services: Array.isArray(details.services)
          ? details.services
          : [],
      });

      setEditValues(details);

      setRejectionReason(
        details.rejection_reason || ""
      );
    } catch (error) {
      console.error(
        "Error loading complete provider details:",
        error
      );

      setDetailsError(
        error.response?.data?.detail ||
          "Unable to load service packages and photos."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeProviderDetails = () => {
    setShowModal(false);

    setSelectedProvider(null);

    setDetailsError("");

    setDetailsLoading(false);

    setIsEditing(false);

    setRejectionReason("");
  };

  const handleApprove = async (providerId) => {
    try {
      setProcessingProviderId(providerId);

      await api.put(
        `/admin/providers/${providerId}/approve`
      );

      setSelectedProvider((previous) =>
        previous && previous.id === providerId
          ? {
              ...previous,
              status: "approved",
              rejection_reason: null,
            }
          : previous
      );

      await Promise.all([
        fetchProviders(),
        fetchStats(),
      ]);

      alert(
        "Provider approved successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "Error approving provider:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to approve provider."
      );

      return false;
    } finally {
      setProcessingProviderId(null);
    }
  };

  const handleReject = async (
    providerId,
    reason
  ) => {
    const cleanReason = reason?.trim();

    if (!cleanReason) {
      alert(
        "Please enter a rejection reason."
      );

      return false;
    }

    try {
      setProcessingProviderId(providerId);

      await api.put(
        `/admin/providers/${providerId}/reject`,
        {
          reason: cleanReason,
        }
      );

      setSelectedProvider((previous) =>
        previous &&
        previous.id === providerId
          ? {
              ...previous,
              status: "rejected",
              rejection_reason: cleanReason,
            }
          : previous
      );

      await Promise.all([
        fetchProviders(),
        fetchStats(),
      ]);

      alert(
        "Provider rejected successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "Error rejecting provider:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to reject provider."
      );

      return false;
    } finally {
      setProcessingProviderId(null);
    }
  };

  const handleTableReject = async (
    provider
  ) => {
    const reason = window.prompt(
      `Enter the rejection reason for ${
        provider.full_name ||
        "this provider"
      }:`
    );

    if (reason === null) {
      return;
    }

    await handleReject(
      provider.id,
      reason
    );
  };

  const handleDeleteProvider = async (
    provider
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${
          provider.full_name ||
          "this provider"
        }?\n\nThis permanently removes the provider, all services, packages, portfolio images, reviews, and enquiries from the database.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProviderId(
        provider.id
      );

      await api.delete(
        `/admin/providers/${provider.id}`
      );

      closeProviderDetails();

      await Promise.all([
        fetchProviders(),
        fetchStats(),
      ]);

      alert(
        "Provider and all related service records were deleted."
      );
    } catch (error) {
      console.error(
        "Error deleting provider:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to delete provider."
      );
    } finally {
      setDeletingProviderId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProvider) {
      return;
    }

    const cleanName =
      editedService.full_name.trim();

    const cleanPhone =
      editedService.phone
        .replace(/\s+/g, "")
        .trim();

    const cleanEmail =
      editedService.email
        .trim()
        .toLowerCase();

    const cleanCity =
      editedService.city.trim();

    if (!cleanName) {
      alert(
        "Please enter the provider name."
      );

      return;
    }

    if (
      !/^\d{10,15}$/.test(cleanPhone)
    ) {
      alert(
        "Phone number must contain 10 to 15 digits."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      alert(
        "Please enter a valid email address."
      );

      return;
    }

    if (!cleanCity) {
      alert(
        "Please enter the provider city."
      );

      return;
    }

    try {
      const response =
        await api.put(
          `/admin/providers/${selectedProvider.id}`,
          {
            full_name: cleanName,

            phone: cleanPhone,

            email: cleanEmail,

            category_id:
              editedService.category_id
                ? Number(
                    editedService.category_id
                  )
                : null,

            city: cleanCity,

            service_id:
              editedService.service_id,

            service_bio:
              editedService.service_bio.trim(),
          }
        );

      const updatedProvider =
        response.data?.provider ||
        response.data;

      setSelectedProvider({
        ...updatedProvider,

        status: normalizeStatus(
          updatedProvider?.status
        ),

        services: Array.isArray(
          updatedProvider?.services
        )
          ? updatedProvider.services
          : [],
      });

      setEditValues(
        updatedProvider
      );

      setIsEditing(false);

      localStorage.setItem(
        "provider_profile_updated_at",

        JSON.stringify({
          provider_id:
            selectedProvider.id,

          updated_at: Date.now(),
        })
      );

      window.dispatchEvent(
        new CustomEvent(
          "provider-profile-updated",
          {
            detail: {
              providerId:
                selectedProvider.id,
            },
          }
        )
      );

      await fetchProviders();

      alert(
        "Provider details updated successfully. The provider dashboard and public profile will refresh with the new information."
      );
    } catch (error) {
      console.error(
        "Error updating provider:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to update provider."
      );
    }
  };

  const slugify = (value) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  const handleAddCategory =
    async () => {
      if (!newCategory.trim()) {
        return;
      }

      try {
        await api.post(
          "/admin/categories",
          {
            name:
              newCategory.trim(),

            slug:
              slugify(newCategory),

            icon: "",

            image_url: "",

            description: "",
          }
        );

        setNewCategory("");

        await Promise.all([
          fetchCategories(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error(
          "Error adding category:",
          error
        );

        alert(
          error.response?.data
            ?.detail ||
            "Unable to add category."
        );
      }
    };

  const handleRenameCategory =
    async (categoryId) => {
      if (
        !editedCategoryName.trim()
      ) {
        return;
      }

      try {
        await api.put(
          `/admin/categories/${categoryId}`,
          {
            name:
              editedCategoryName.trim(),

            slug: slugify(
              editedCategoryName
            ),

            icon: "",

            image_url: "",

            description: "",
          }
        );

        setEditingCategoryId(
          null
        );

        setEditedCategoryName(
          ""
        );

        await fetchCategories();
      } catch (error) {
        console.error(
          "Error renaming category:",
          error
        );

        alert(
          error.response?.data
            ?.detail ||
            "Unable to rename category."
        );
      }
    };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete category "${category.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/categories/${category.id}`
      );

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setEditedCategoryName("");
      }

      await Promise.all([
        fetchCategories(),
        fetchStats(),
      ]);

      alert("Category deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting category:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to delete category."
      );
    }
  };

  const getPageStatus = () => {
    if (
      [
        "approved",
        "pending",
        "rejected",
      ].includes(activePage)
    ) {
      return activePage;
    }

    return "All";
  };

  const currentStatus =
    getPageStatus();

  /*
   * SEARCH
   *
   * Search now works with:
   *
   * Provider name
   * Email
   * Phone
   * City
   *
   * It filters while typing.
   */
  const filteredProviders =
    providers.filter((provider) => {
      const providerName =
        provider.full_name || "";

      const providerEmail =
        provider.email || "";

      const providerPhone =
        provider.phone || "";

      const providerCity =
        provider.city || "";

      const searchValue =
        searchTerm
          .trim()
          .toLowerCase();

      const providerStatus =
        normalizeStatus(
          provider.status
        );

      const matchesSearch =
        !searchValue ||
        providerName
          .toLowerCase()
          .includes(searchValue) ||
        providerEmail
          .toLowerCase()
          .includes(searchValue) ||
        providerPhone
          .toLowerCase()
          .includes(searchValue) ||
        providerCity
          .toLowerCase()
          .includes(searchValue);

      const matchesPageStatus =
        currentStatus === "All" ||
        providerStatus ===
          currentStatus;

      const matchesStatusFilter =
        statusFilter === "All" ||
        providerStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesPageStatus &&
        matchesStatusFilter
      );
    });

  const getProviderPageTitle =
    () => {
      const titles = {
        providers:
          "Total Providers",

        approved:
          "Approved Providers",

        pending:
          "Pending Providers",

        rejected:
          "Rejected Providers",
      };

      return (
        titles[activePage] ||
        "Providers"
      );
    };

  /*
   * IMPORTANT:
   *
   * We call ProviderTable() directly below
   * instead of <ProviderTable />.
   *
   * Because this component is defined
   * inside AdminPanel.
   *
   * This prevents React from remounting
   * the search input every time
   * searchTerm changes.
   */
  const ProviderTable = () => (
    <div className="provider-interface">
      <div className="page-header">
        <div>
          <h2>
            {getProviderPageTitle()}
          </h2>

          <p>
            Review complete
            registrations and manage
            service providers.
          </p>
        </div>

        <div className="page-actions">
          <input
            type="text"
            placeholder="Search Provider..."
            className="page-search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          <select
            className="page-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="provider-table-card">
        <h3>
          Provider Management
        </h3>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  Provider Name
                </th>

                <th>Email</th>

                <th>
                  Phone Number
                </th>

                <th>
                  Category
                </th>

                <th>
                  Location
                </th>

                <th>Status</th>

                {activePage ===
                  "rejected" && (
                  <th>
                    Rejection Reason
                  </th>
                )}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProviders.length >
              0 ? (
                filteredProviders.map(
                  (provider) => {
                    const providerStatus =
                      normalizeStatus(
                        provider.status
                      );

                    const canReject =
                      [
                        "pending",
                        "approved",
                      ].includes(
                        providerStatus
                      );

                    const isProcessing =
                      processingProviderId ===
                      provider.id;

                    const isDeleting =
                      deletingProviderId ===
                      provider.id;

                    return (
                      <tr
                        key={
                          provider.id
                        }
                      >
                        <td>
                          {
                            provider.full_name
                          }
                        </td>

                        {/* EMAIL */}
                        <td>
                          {provider.email ||
                            "Not available"}
                        </td>

                        <td>
                          {
                            provider.phone
                          }
                        </td>

                        <td>
                          {getCategoryName(
                            provider.category_id
                          )}
                        </td>

                        <td>
                          {
                            provider.city
                          }
                        </td>

                        <td>
                          <span
                            className={`status ${providerStatus}`}
                          >
                            {STATUS_LABELS[
                              providerStatus
                            ] ||
                              providerStatus}
                          </span>
                        </td>

                        {activePage ===
                          "rejected" && (
                          <td className="rejection-reason-cell">
                            {provider.rejection_reason?.trim() ||
                              "No reason provided"}
                          </td>
                        )}

                        <td>
                          <div className="provider-actions">
                            <button
                              type="button"
                              className="view-btn"
                              onClick={() =>
                                openProviderDetails(
                                  provider
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="approve-btn"
                              disabled={
                                isProcessing ||
                                isDeleting
                              }
                              onClick={() =>
                                handleApprove(
                                  provider.id
                                )
                              }
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              disabled={
                                !canReject ||
                                isProcessing ||
                                isDeleting
                              }
                              onClick={() =>
                                handleTableReject(
                                  provider
                                )
                              }
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              disabled={
                                isProcessing ||
                                isDeleting
                              }
                              onClick={() =>
                                handleDeleteProvider(
                                  provider
                                )
                              }
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      activePage ===
                      "rejected"
                        ? 8
                        : 7
                    }
                    className="empty-state"
                  >
                    No providers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProviderDetails =
    () => {
      if (detailsLoading) {
        return (
          <div className="admin-details-loading">
            <div className="admin-loading-spinner" />

            <p>
              Loading services,
              packages, photos, and
              documents...
            </p>
          </div>
        );
      }

      if (!selectedProvider) {
        return null;
      }

      const services =
        Array.isArray(
          selectedProvider.services
        )
          ? selectedProvider.services
          : [];

      return (
        <>
          {detailsError && (
            <div className="admin-details-error">
              {detailsError}
            </div>
          )}

          <section className="admin-detail-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-kicker">
                  Registration
                </span>

                <h3>
                  Provider Information
                </h3>
              </div>
            </div>

            <div className="admin-provider-overview">
              <div className="admin-provider-photo-wrap">
                {selectedProvider.profile_image ? (
                  <img
                    src={
                      selectedProvider.profile_image
                    }
                    alt={`${selectedProvider.full_name} profile`}
                    className="admin-provider-photo"
                  />
                ) : (
                  <div className="admin-provider-photo-placeholder">
                    {(
                      selectedProvider.full_name ||
                      "P"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="admin-provider-title-block">
                <div className="admin-provider-title-row">
                  <h2>
                    {selectedProvider.full_name ||
                      "Provider"}
                  </h2>

                  <span
                    className={`status ${selectedProvider.status}`}
                  >
                    {STATUS_LABELS[
                      selectedProvider
                        .status
                    ] ||
                      selectedProvider.status}
                  </span>
                </div>

                <p>
                  Submitted{" "}
                  {formatDate(
                    selectedProvider.created_at
                  )}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="admin-edit-grid">
                <label>
                  Full Name

                  <input
                    value={
                      editedService.full_name
                    }
                    onChange={(
                      event
                    ) =>
                      setEditedService(
                        {
                          ...editedService,

                          full_name:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </label>

                <label>
                  Phone Number

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={
                      editedService.phone
                    }
                    onChange={(
                      event
                    ) =>
                      setEditedService(
                        {
                          ...editedService,

                          phone:
                            event.target.value.replace(
                              /\D/g,
                              ""
                            ),
                        }
                      )
                    }
                  />

                  <small>
                    Only the admin can
                    change this login
                    phone number.
                  </small>
                </label>

                <label>
                  Email Address

                  <input
                    type="email"
                    value={
                      editedService.email
                    }
                    onChange={(
                      event
                    ) =>
                      setEditedService(
                        {
                          ...editedService,

                          email:
                            event.target.value.replace(
                              /\s/g,
                              ""
                            ),
                        }
                      )
                    }
                  />

                  <small>
                    Only the admin can
                    change this verified
                    login email address.
                  </small>
                </label>

                <label>
                  City

                  <input
                    value={
                      editedService.city
                    }
                    onChange={(
                      event
                    ) =>
                      setEditedService(
                        {
                          ...editedService,

                          city:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </label>
              </div>
            ) : (
              <div className="admin-detail-grid">
                <DetailItem label="Full Name">
                  {selectedProvider.full_name ||
                    "Not available"}
                </DetailItem>

                {/* EMAIL IN VIEW DETAILS */}
                <DetailItem label="Email">
                  {selectedProvider.email ||
                    "Not available"}
                </DetailItem>

                <DetailItem label="Phone Number">
                  {selectedProvider.phone ||
                    "Not available"}
                </DetailItem>

                <DetailItem label="City">
                  {selectedProvider.city ||
                    "Not available"}
                </DetailItem>

                <DetailItem label="PIN Code">
                  {selectedProvider.pin_code ||
                    "Not provided"}
                </DetailItem>

                <DetailItem label="Provider Available">
                  {normalizeAvailabilityFlag(
                    selectedProvider.is_available
                  )
                    ? "Yes"
                    : "No"}
                </DetailItem>

                <DetailItem label="Average Rating">
                  {Number(
                    selectedProvider.avg_rating ||
                      0
                  ).toFixed(1)}{" "}
                  (
                  {selectedProvider.ratings_count ||
                    0}{" "}
                  ratings)
                </DetailItem>

                <DetailItem label="Completed Enquiries">
                  {selectedProvider.completed_enquiries_count ||
                    0}
                </DetailItem>
              </div>
            )}
          </section>

          <section className="admin-detail-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-kicker">
                  Verification
                </span>

                <h3>
                  Identity Document
                </h3>
              </div>
            </div>

            <div className="admin-document-card">
              <div className="admin-document-meta">
                <DetailItem label="ID Type">
                  {selectedProvider.id_type ||
                    "Not provided"}
                </DetailItem>

                <DetailItem label="Document Status">
                  {selectedProvider.id_document_url
                    ? "Uploaded"
                    : "Not uploaded"}
                </DetailItem>
              </div>

              {selectedProvider.id_document_url ? (
                isPdfUrl(
                  selectedProvider.id_document_url
                ) ? (
                  <div className="admin-pdf-preview">
                    <iframe
                      title={`${selectedProvider.full_name} identity document`}
                      src={
                        selectedProvider.id_document_url
                      }
                      className="admin-document-frame"
                    />

                    <a
                      href={
                        selectedProvider.id_document_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="admin-file-link"
                    >
                      Open PDF in a new
                      tab
                    </a>
                  </div>
                ) : (
                  <a
                    href={
                      selectedProvider.id_document_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="admin-document-image-link"
                  >
                    <img
                      src={
                        selectedProvider.id_document_url
                      }
                      alt="Provider identity document"
                      className="admin-document-image"
                    />
                  </a>
                )
              ) : (
                <div className="admin-empty-content">
                  No identity document
                  uploaded.
                </div>
              )}
            </div>
          </section>

          <section className="admin-detail-section">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-kicker">
                  Services
                </span>

                <h3>
                  Registered Services (
                  {services.length})
                </h3>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="admin-services-list">
                {services.map(
                  (
                    service,
                    serviceIndex
                  ) => {
                    const offers =
                      Array.isArray(
                        service.offers
                      )
                        ? service.offers
                        : [];

                    const portfolioImages =
                      Array.isArray(
                        service.portfolio_images
                      )
                        ? service.portfolio_images
                        : [];

                    const serviceDisplayName =
                      service.service_name ||
                      `Service ${
                        serviceIndex +
                        1
                      }`;

                    return (
                      <article
                        className="admin-service-card"
                        key={
                          service.id
                        }
                      >
                        <div className="admin-service-header">
                          {service.service_profile_image ? (
                            <img
                              src={
                                service.service_profile_image
                              }
                              alt={
                                service.service_name ||
                                "Service"
                              }
                              className="admin-service-cover"
                            />
                          ) : (
                            <div className="admin-service-cover-placeholder">
                              Service{" "}
                              {serviceIndex +
                                1}
                            </div>
                          )}

                          <div className="admin-service-heading-copy">
                            <h4>
                              {
                                serviceDisplayName
                              }
                            </h4>

                            <p>
                              {service.category_name ||
                                "Uncategorized"}
                            </p>
                          </div>
                        </div>

                        <div className="admin-detail-grid compact">
                          <DetailItem label="Service Available">
                            {normalizeAvailabilityFlag(
                              service.is_item_available
                            )
                              ? "Yes"
                              : "No"}
                          </DetailItem>

                          <DetailItem label="Created">
                            {formatDate(
                              service.created_at
                            )}
                          </DetailItem>

                          <DetailItem label="Last Updated">
                            {formatDate(
                              service.updated_at
                            )}
                          </DetailItem>

                          <DetailItem
                            label="Service Bio"
                            wide
                          >
                            {service.service_bio ||
                              "Not provided"}
                          </DetailItem>
                        </div>

                        <div className="admin-subsection">
                          <div className="admin-subsection-title">
                            <h5>
                              Packages /
                              Offers —{" "}
                              {
                                serviceDisplayName
                              }
                            </h5>
                          </div>

                          {offers.length >
                          0 ? (
                            <div className="admin-offers-grid">
                              {offers.map(
                                (
                                  offer
                                ) => (
                                  <div
                                    className="admin-offer-card"
                                    key={
                                      offer.id
                                    }
                                  >
                                    <h6>
                                      {
                                        offer.offer_name
                                      }
                                    </h6>

                                    <p>
                                      {formatPrice(
                                        offer.price_min
                                      )}{" "}
                                      –{" "}
                                      {formatPrice(
                                        offer.price_max
                                      )}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="admin-empty-content">
                              No packages
                              were added
                              for this
                              service.
                            </div>
                          )}
                        </div>

                        <div className="admin-subsection">
                          <div className="admin-subsection-title">
                            <h5>
                              Portfolio —{" "}
                              {
                                serviceDisplayName
                              }
                            </h5>
                          </div>

                          {portfolioImages.length >
                          0 ? (
                            <div className="admin-portfolio-grid">
                              {portfolioImages.map(
                                (
                                  image,
                                  imageIndex
                                ) => (
                                  <a
                                    key={
                                      image.id
                                    }
                                    href={
                                      image.image_url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-portfolio-link"
                                  >
                                    <img
                                      src={
                                        image.image_url
                                      }
                                      alt={`${
                                        service.service_name ||
                                        "Service"
                                      } portfolio ${
                                        imageIndex +
                                        1
                                      }`}
                                      className="admin-portfolio-image"
                                    />
                                  </a>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="admin-empty-content">
                              No
                              portfolio
                              photos
                              were
                              uploaded.
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="admin-empty-content large">
                No service listing is
                connected to this
                provider registration.
              </div>
            )}
          </section>

          {selectedProvider.status ===
            "rejected" && (
            <div className="rejection-reason-display">
              <strong>
                Rejection Reason:
              </strong>

              <p>
                {selectedProvider.rejection_reason?.trim() ||
                  "No reason provided"}
              </p>
            </div>
          )}

          {[
            "pending",
            "approved",
          ].includes(
            normalizeStatus(
              selectedProvider.status
            )
          ) && (
            <div className="rejection-box">
              <label>
                Rejection Reason
              </label>

              <textarea
                placeholder="Explain why this provider is being rejected..."
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target
                      .value
                  )
                }
              />
            </div>
          )}
        </>
      );
    };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage Providers and
            Categories
          </p>
        </div>
      </div>

      {activePage !==
        "dashboard" && (
        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setActivePage(
              "dashboard"
            );

            setSearchTerm("");

            setStatusFilter(
              "All"
            );
          }}
        >
          ← Back to Dashboard
        </button>
      )}

      {activePage ===
        "dashboard" && (
        <div className="admin-stats-grid">
          <div
            className="admin-stat-card"
            onClick={() =>
              setActivePage(
                "providers"
              )
            }
          >
            <div className="admin-card-icon">
              👥
            </div>

            <div className="admin-stat-number">
              {
                stats.totalProviders
              }
            </div>

            <h3>
              Total Providers
            </h3>

            <p>
              All registered service
              providers
            </p>
          </div>

          <div
            className="admin-stat-card"
            onClick={() =>
              setActivePage(
                "approved"
              )
            }
          >
            <div className="admin-card-icon">
              ✓
            </div>

            <div className="admin-stat-number">
              {
                stats.approvedProviders
              }
            </div>

            <h3>
              Approved Providers
            </h3>

            <p>
              Verified providers
            </p>
          </div>

          <div
            className="admin-stat-card"
            onClick={() =>
              setActivePage(
                "pending"
              )
            }
          >
            <div className="admin-card-icon">
              ⌛
            </div>

            <div className="admin-stat-number">
              {
                stats.pendingProviders
              }
            </div>

            <h3>
              Pending Providers
            </h3>

            <p>
              Waiting for approval
            </p>
          </div>

          <div
            className="admin-stat-card"
            onClick={() =>
              setActivePage(
                "rejected"
              )
            }
          >
            <div className="admin-card-icon">
              ✕
            </div>

            <div className="admin-stat-number">
              {
                stats.rejectedProviders
              }
            </div>

            <h3>
              Rejected Providers
            </h3>

            <p>
              Rejected applications
            </p>
          </div>

          <div
            className="admin-stat-card"
            onClick={() =>
              setActivePage(
                "categories"
              )
            }
          >
            <div className="admin-card-icon">
              ▦
            </div>

            <div className="admin-stat-number">
              {
                stats.totalCategories
              }
            </div>

            <h3>
              Categories
            </h3>

            <p>
              Available service
              categories
            </p>
          </div>
        </div>
      )}

      {[
        "providers",
        "approved",
        "pending",
        "rejected",
      ].includes(activePage) &&
        ProviderTable()}

      {activePage ===
        "categories" && (
        <div className="category-interface">
          <div className="page-header">
            <div>
              <h2>
                Category Management
              </h2>

              <p>
                Manage all available
                service categories
                here.
              </p>
            </div>
          </div>

          <div className="category-table-card">
            <h3>
              Categories
            </h3>

            <table>
              <thead>
                <tr>
                  <th>
                    Category Name
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map(
                  (category) => (
                    <tr
                      key={
                        category.id
                      }
                    >
                      <td>
                        {editingCategoryId ===
                        category.id ? (
                          <input
                            className="category-edit-input"
                            value={
                              editedCategoryName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditedCategoryName(
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        ) : (
                          category.name
                        )}
                      </td>

                      <td>
                        <div className="category-action-buttons">
                          {editingCategoryId ===
                          category.id ? (
                            <>
                              <button
                                type="button"
                                className="approve-btn"
                                onClick={() =>
                                  handleRenameCategory(
                                    category.id
                                  )
                                }
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                className="close-btn"
                                onClick={() => {
                                  setEditingCategoryId(
                                    null
                                  );

                                  setEditedCategoryName(
                                    ""
                                  );
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="view-btn"
                                onClick={() => {
                                  setEditingCategoryId(
                                    category.id
                                  );

                                  setEditedCategoryName(
                                    category.name
                                  );
                                }}
                              >
                                Rename
                              </button>

                              <button
                                type="button"
                                className="category-delete-btn"
                                onClick={() =>
                                  handleDeleteCategory(
                                    category
                                  )
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="category-add">
              <input
                type="text"
                placeholder="Category Name"
                value={
                  newCategory
                }
                onChange={(event) =>
                  setNewCategory(
                    event.target
                      .value
                  )
                }
              />

              <button
                type="button"
                className="approve-btn"
                onClick={
                  handleAddCategory
                }
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal &&
        selectedProvider && (
        <div
          className="modal-overlay"
          onClick={
            closeProviderDetails
          }
        >
          <div
            className="modal admin-provider-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-modal-close-icon"
              onClick={
                closeProviderDetails
              }
              aria-label="Close provider details"
            >
              ×
            </button>

            {renderProviderDetails()}

            {!detailsLoading && (
              <div className="modal-buttons admin-modal-actions">
                <button
                  type="button"
                  className="approve-btn"
                  disabled={
                    processingProviderId ===
                      selectedProvider.id ||
                    deletingProviderId ===
                      selectedProvider.id
                  }
                  onClick={() =>
                    handleApprove(
                      selectedProvider.id
                    )
                  }
                >
                  {processingProviderId ===
                  selectedProvider.id
                    ? "Processing..."
                    : "Approve Provider"}
                </button>

                {[
                  "pending",
                  "approved",
                ].includes(
                  normalizeStatus(
                    selectedProvider.status
                  )
                ) && (
                  <button
                    type="button"
                    className="reject-btn"
                    disabled={
                      processingProviderId ===
                        selectedProvider.id ||
                      deletingProviderId ===
                        selectedProvider.id
                    }
                    onClick={() =>
                      handleReject(
                        selectedProvider.id,
                        rejectionReason
                      )
                    }
                  >
                    Reject Provider
                  </button>
                )}

                {!isEditing ? (
                  <button
                    type="button"
                    className="view-btn"
                    onClick={() => {
                      setEditValues(
                        selectedProvider
                      );

                      setIsEditing(
                        true
                      );
                    }}
                  >
                    Edit Basic Details
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="approve-btn"
                      onClick={
                        handleSaveEdit
                      }
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      className="close-btn"
                      onClick={() => {
                        setEditValues(
                          selectedProvider
                        );

                        setIsEditing(
                          false
                        );
                      }}
                    >
                      Cancel Edit
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="delete-btn"
                  disabled={
                    deletingProviderId ===
                    selectedProvider.id
                  }
                  onClick={() =>
                    handleDeleteProvider(
                      selectedProvider
                    )
                  }
                >
                  {deletingProviderId ===
                  selectedProvider.id
                    ? "Deleting..."
                    : "Delete Provider"}
                </button>

                <button
                  type="button"
                  className="close-btn"
                  onClick={
                    closeProviderDetails
                  }
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;