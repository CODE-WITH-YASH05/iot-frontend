import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import useAdminOrders from "../hooks/useAdminOrders";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/statusOptions";

// ==========================================================
// PRODUCT IMAGE - SAME AS ADMIN WISHLIST
// ==========================================================

const ProductImage = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = item?.product_image;

  if (!imageUrl || imageError) {
    return (
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl md:text-3xl">📦</span>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
      <img
        src={imageUrl}
        alt={item?.product_name || "Product"}
        className="w-full h-full object-contain p-2"
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();

  const config = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      icon: "⏳",
    },
    confirmed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      icon: "✅",
    },
    processing: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
      icon: "⚙️",
    },
    shipped: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
      icon: "🚚",
    },
    delivered: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-500",
      icon: "🎯",
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      icon: "❌",
    },
  };

  const style = config[normalized] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {style.icon} {STATUS_LABELS[normalized] || status || "Unknown"}
    </span>
  );
};

// ==========================================================
// STATUS TIMELINE
// ==========================================================

const StatusTimeline = ({ currentStatus }) => {
  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];
  const currentIndex = statuses.indexOf(currentStatus?.toLowerCase());
  const isCancelled = currentStatus?.toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
        <span className="text-2xl">🚫</span>
        <div>
          <p className="font-bold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-600">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-2 text-center ${
                  isCompleted ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {STATUS_LABELS[status]}
              </span>
              {index < statuses.length - 1 && (
                <div
                  className={`w-full h-1 mt-2 rounded-full ${
                    isCompleted
                      ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================================
// MONEY FORMATTER
// ==========================================================

const money = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================================
// INFO ROW
// ==========================================================

const InfoRow = ({ label, value, icon, highlight = false }) => {
  return (
    <div
      className={`flex gap-3 py-2.5 ${highlight ? "bg-indigo-50/50 rounded-xl px-3 -mx-3" : ""}`}
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-gray-500 text-[18px]">
          {icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

// ==========================================================
// SECTION CARD
// ==========================================================

const SectionCard = ({
  title,
  icon,
  children,
  className = "",
  action = null,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="px-5 md:px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </motion.section>
  );
};

// ==========================================================
// SUMMARY ROW
// ==========================================================

const SummaryRow = ({ label, value, negative = false, bold = false }) => {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span
        className={bold ? "font-bold text-gray-900" : "text-sm text-gray-500"}
      >
        {label}
      </span>
      <span
        className={
          negative
            ? "font-semibold text-green-600"
            : bold
              ? "font-black text-gray-900 text-lg"
              : "font-semibold text-gray-700"
        }
      >
        {negative && Number(value || 0) > 0 ? "-" : ""}
        {money(value)}
      </span>
    </div>
  );
};

// ==========================================================
// MAIN ADMIN ORDER DETAILS
// ==========================================================

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    selectedOrder,
    orderHistory,
    detailLoading,
    historyLoading,
    actionLoading,
    error,
    fetchOrder,
    fetchHistory,
    updateStatus,
    clearError,
  } = useAdminOrders({
    autoFetch: false,
  });

  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ========================================================
  // FETCH ORDER
  // ========================================================

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        setLocalError("");
        setSuccessMessage("");
        await fetchOrder(orderId);
        await fetchHistory(orderId);
      } catch (err) {
        console.error("ADMIN ORDER DETAILS ERROR:", err);
      }
    };

    loadOrder();
  }, [orderId, fetchOrder, fetchHistory]);

  // ========================================================
  // STATUS UPDATE
  // ========================================================

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder?.id || !newStatus) return;

    if (newStatus === selectedOrder.status?.toLowerCase()) {
      toast.info("Order is already in this status");
      return;
    }

    try {
      setUpdatingStatus(true);
      setLocalError("");
      setSuccessMessage("");

      await updateStatus(selectedOrder.id, newStatus);
      await fetchOrder(selectedOrder.id);
      await fetchHistory(selectedOrder.id);

      toast.success(`Order status updated to ${STATUS_LABELS[newStatus]}`);
      setSuccessMessage(
        `Order status updated to ${STATUS_LABELS[newStatus]} successfully!`,
      );
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
      const message =
        err?.response?.data?.status?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to update order status.";
      setLocalError(message);
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = async () => {
    if (!orderId) return;

    try {
      setLocalError("");
      setSuccessMessage("");
      await fetchOrder(orderId);
      await fetchHistory(orderId);
      toast.success("Order details refreshed!");
    } catch (err) {
      console.error("REFRESH ERROR:", err);
      toast.error("Failed to refresh order");
    }
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (detailLoading && !selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-5 font-semibold text-gray-600">
              Loading order details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ========================================================
  // ORDER NOT FOUND
  // ========================================================

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-[70vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-xl"
          >
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <span className="text-5xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Order Not Found
            </h1>
            <p className="text-gray-500 mt-2">
              {error || localError || "Unable to load this order."}
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Go Back
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  const currentStatus = String(selectedOrder?.status || "").toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20">
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* =================================================
              TOP HEADER
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-5"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              Back to Orders
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                    Order #{String(selectedOrder.id).slice(0, 8)}
                  </h1>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-500">
                    ID:{" "}
                    <span className="font-medium text-gray-700 font-mono">
                      {selectedOrder.id}
                    </span>
                  </p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm text-gray-400">
                    Placed{" "}
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={detailLoading || historyLoading}
                  className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-indigo-300 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  {detailLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* =================================================
              ALERTS
          ================================================= */}

          <AnimatePresence>
            {(localError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3"
              >
                <span className="text-xl mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold">Something went wrong</p>
                  <p className="text-sm mt-1">{localError || error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setLocalError("");
                  }}
                  className="font-bold hover:bg-red-100 p-1 rounded-lg transition-all"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-3"
              >
                <span className="text-xl">✅</span>
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT / MAIN */}
            <div className="xl:col-span-2 space-y-6">
              {/* ORDER STATUS */}
              <SectionCard
                title="Order Status"
                icon="local_shipping"
                action={
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {updatingStatus ? "Updating..." : ""}
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Current Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>

                  <div className="w-full md:w-80">
                    <label className="block text-xs font-bold text-gray-500 mb-2">
                      Change Status
                    </label>
                    <div className="relative">
                      <select
                        value=""
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={actionLoading || updatingStatus}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 appearance-none"
                      >
                        <option value="">
                          {updatingStatus
                            ? "⏳ Updating..."
                            : "↻ Select new status"}
                        </option>
                        {Object.keys(STATUS_LABELS).map((status) => {
                          const isCurrent = status === currentStatus;
                          return (
                            <option
                              key={status}
                              value={status}
                              className={
                                isCurrent ? "font-bold text-indigo-600" : ""
                              }
                            >
                              {isCurrent ? "✓ " : ""}
                              {STATUS_LABELS[status]}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {updatingStatus
                        ? "Updating status..."
                        : "Select any status to update"}
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <StatusTimeline currentStatus={selectedOrder.status} />
                </div>
              </SectionCard>

              {/* ORDER ITEMS */}
              <SectionCard title="Order Items" icon="shopping_bag">
                <div className="space-y-4">
                  {(selectedOrder?.items || []).map((item, index) => {
                    const quantity = Number(item.quantity || 0);
                    const unitPrice = Number(item.unit_price || 0);
                    const discount = Number(item.discount_amount || 0);
                    const totalPrice = Number(
                      item.total_price || unitPrice * quantity,
                    );

                    return (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 md:p-5 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image - Using same component as AdminWishlist */}
                          <ProductImage item={item} />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:justify-between gap-3">
                              <div>
                                <h3 className="font-black text-gray-900 text-base md:text-lg">
                                  {item.product_name || "Product"}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                  ID: {item.product || "—"}
                                </p>
                              </div>
                              <div className="text-left md:text-right">
                                <p className="text-xs text-gray-400">
                                  Item Total
                                </p>
                                <p className="text-lg font-black text-indigo-600">
                                  {money(totalPrice)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-gray-50 rounded-xl p-3 hover:bg-indigo-50 transition-colors">
                                <p className="text-xs text-gray-400">
                                  Quantity
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                  {quantity}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 hover:bg-indigo-50 transition-colors">
                                <p className="text-xs text-gray-400">
                                  Unit Price
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                  {money(unitPrice)}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 hover:bg-indigo-50 transition-colors">
                                <p className="text-xs text-gray-400">
                                  Discount
                                </p>
                                <p className="font-bold text-green-600 mt-1">
                                  {money(discount)}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 hover:bg-indigo-50 transition-colors">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="font-bold text-gray-900 mt-1">
                                  {money(totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {(!selectedOrder?.items ||
                    selectedOrder.items.length === 0) && (
                    <div className="py-10 text-center text-gray-400">
                      <span className="text-4xl block mb-3">🛒</span>
                      No order items found.
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* ORDER HISTORY */}
              <SectionCard title="Order History" icon="history">
                {historyLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <span className="text-3xl block mb-2">📋</span>
                    No status history available.
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-200 to-gray-200" />
                    <div className="space-y-6">
                      {orderHistory.map((history, index) => {
                        const newStatus = String(
                          history.new_status || "",
                        ).toLowerCase();
                        const oldStatus = String(
                          history.old_status || "",
                        ).toLowerCase();

                        return (
                          <motion.div
                            key={history.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex gap-4"
                          >
                            <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ring-4 ring-white flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
                              {index + 1}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-2xl p-4 hover:bg-indigo-50/50 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {oldStatus && (
                                      <>
                                        <span className="text-gray-400">
                                          {STATUS_LABELS[oldStatus] ||
                                            oldStatus}
                                        </span>
                                        <span className="text-gray-400 mx-2">
                                          →
                                        </span>
                                      </>
                                    )}
                                    <span className="text-indigo-600">
                                      {STATUS_LABELS[newStatus] || newStatus}
                                    </span>
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">
                                  {history.created_at
                                    ? new Date(
                                        history.created_at,
                                      ).toLocaleString("en-IN")
                                    : "—"}
                                </p>
                              </div>
                              {history.changed_by && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">
                                    person
                                  </span>
                                  Changed by:{" "}
                                  {typeof history.changed_by === "object"
                                    ? history.changed_by.email ||
                                      history.changed_by.username ||
                                      "Admin"
                                    : history.changed_by}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              {/* CUSTOMER */}
              <SectionCard title="Customer" icon="person">
                <div className="space-y-2">
                  <InfoRow
                    label="Name"
                    value={selectedOrder.address_name}
                    icon="person"
                    highlight
                  />
                  <InfoRow
                    label="Phone"
                    value={selectedOrder.address_phone}
                    icon="phone"
                  />
                  <InfoRow
                    label="Email"
                    value={selectedOrder.address_email}
                    icon="email"
                  />
                </div>
              </SectionCard>

              {/* SHIPPING ADDRESS */}
              <SectionCard title="Shipping Address" icon="location_on">
                <div className="space-y-2">
                  <InfoRow
                    label="Name"
                    value={selectedOrder.address_name}
                    icon="person"
                  />
                  <InfoRow
                    label="Phone"
                    value={selectedOrder.address_phone}
                    icon="phone"
                  />
                  <InfoRow
                    label="Address"
                    value={selectedOrder.address_line1}
                    icon="home"
                  />
                  {selectedOrder.address_line2 && (
                    <InfoRow
                      label="Address Line 2"
                      value={selectedOrder.address_line2}
                      icon="home"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <InfoRow
                      label="City"
                      value={selectedOrder.address_city}
                      icon="location_city"
                    />
                    <InfoRow
                      label="State"
                      value={selectedOrder.address_state}
                      icon="map"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InfoRow
                      label="Postal Code"
                      value={selectedOrder.address_postal_code}
                      icon="markunread_mailbox"
                    />
                    <InfoRow
                      label="Country"
                      value={selectedOrder.address_country}
                      icon="public"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* PAYMENT SUMMARY */}
              <SectionCard title="Payment Summary" icon="receipt_long">
                <div className="space-y-3">
                  <SummaryRow label="Subtotal" value={selectedOrder.subtotal} />
                  <SummaryRow
                    label="Discount"
                    value={selectedOrder.discount_amount}
                    negative
                  />
                  <SummaryRow
                    label="Shipping"
                    value={selectedOrder.shipping_amount}
                  />
                  <SummaryRow label="Tax" value={selectedOrder.tax_amount} />
                  <div className="border-t-2 border-gray-200 pt-3 mt-3">
                    <SummaryRow
                      label="Grand Total"
                      value={selectedOrder.total_amount}
                      bold
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ORDER INFORMATION */}
              <SectionCard title="Order Information" icon="info">
                <div className="space-y-2">
                  <InfoRow
                    label="Order ID"
                    value={selectedOrder.id}
                    icon="tag"
                    highlight
                  />
                  <InfoRow
                    label="Created"
                    value={
                      selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString(
                            "en-IN",
                          )
                        : "—"
                    }
                    icon="calendar_month"
                  />
                  <InfoRow
                    label="Last Updated"
                    value={
                      selectedOrder.updated_at
                        ? new Date(selectedOrder.updated_at).toLocaleString(
                            "en-IN",
                          )
                        : "—"
                    }
                    icon="update"
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
