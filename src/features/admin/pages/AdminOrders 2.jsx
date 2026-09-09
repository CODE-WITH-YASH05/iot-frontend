import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import useAdminOrders from "../hooks/useAdminOrders";
import {
  getAllowedStatuses,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../constants/statusOptions";

// ==========================================================
// STATUS CONFIG
// ==========================================================

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: "schedule",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "check_circle",
  },
  processing: {
    label: "Processing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "sync",
  },
  shipped: {
    label: "Shipped",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: "local_shipping",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: "check_circle",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "cancel",
  },
};

// ==========================================================
// STATUS BADGE
// ==========================================================

function StatusBadge({ status }) {
  const key = String(status || "pending").toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          key === "pending"
            ? "bg-yellow-500"
            : key === "confirmed"
              ? "bg-blue-500"
              : key === "processing"
                ? "bg-purple-500"
                : key === "shipped"
                  ? "bg-indigo-500"
                  : key === "delivered"
                    ? "bg-green-500"
                    : "bg-red-500"
        }`}
      />
      {config.label}
    </span>
  );
}

// ==========================================================
// DATE FORMATTER
// ==========================================================

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==========================================================
// CURRENCY
// ==========================================================

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ==========================================================
// STAT CARD
// ==========================================================

function StatCard({ label, value, icon, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-black text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${colors[color]} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================================
// STATUS TIMELINE
// ==========================================================

function StatusTimeline({ currentStatus }) {
  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];
  const currentIndex = statuses.indexOf(currentStatus?.toLowerCase());

  return (
    <div className="flex items-center gap-2">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={status}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  isCompleted ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`w-6 h-0.5 ${isCompleted ? "bg-indigo-300" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==========================================================
// ADMIN ORDERS PAGE
// ==========================================================

export default function AdminOrders() {
  // ========================================================
  // HOOK
  // ========================================================

  const { orders, loading, error, actionLoading, fetchOrders, updateStatus } =
    useAdminOrders({
      autoFetch: true,
    });

  // ========================================================
  // LOCAL STATE
  // ========================================================

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // ========================================================
  // FETCH FILTERED ORDERS
  // ========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders({
        search: search.trim() || undefined,
        status: status || undefined,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [search, status, fetchOrders]);

  // ========================================================
  // STATISTICS
  // ========================================================

  const statistics = useMemo(() => {
    const data = Array.isArray(orders) ? orders : [];

    return {
      total: data.length,
      pending: data.filter((order) => order.status?.toLowerCase() === "pending")
        .length,
      processing: data.filter(
        (order) =>
          order.status?.toLowerCase() === "processing" ||
          order.status?.toLowerCase() === "confirmed",
      ).length,
      shipped: data.filter((order) => order.status?.toLowerCase() === "shipped")
        .length,
      delivered: data.filter(
        (order) => order.status?.toLowerCase() === "delivered",
      ).length,
      cancelled: data.filter(
        (order) => order.status?.toLowerCase() === "cancelled",
      ).length,
    };
  }, [orders]);

  // ========================================================
  // STATUS UPDATE
  // ========================================================

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    try {
      setUpdatingOrderId(orderId);
      await updateStatus(orderId, newStatus);
      toast.success(
        `Order status updated to ${STATUS_LABELS[newStatus] || newStatus}`,
      );
    } catch (err) {
      console.error("Admin order status update error:", err);
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ========================================================
  // CLEAR FILTERS
  // ========================================================

  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 w-52 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-80 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 bg-white rounded-2xl border border-gray-100"
                />
              ))}
            </div>
            <div className="h-96 bg-white rounded-2xl border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="material-symbols-outlined text-3xl">
                  receipt_long
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                  Orders Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all customer orders in one place
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                fetchOrders({
                  search: search.trim() || undefined,
                  status: status || undefined,
                })
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">
                {loading ? "progress_activity" : "refresh"}
              </span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        >
          <StatCard
            label="Total"
            value={statistics.total}
            icon="receipt_long"
            color="indigo"
          />
          <StatCard
            label="Pending"
            value={statistics.pending}
            icon="schedule"
            color="yellow"
          />
          <StatCard
            label="Processing"
            value={statistics.processing}
            icon="sync"
            color="purple"
          />
          <StatCard
            label="Shipped"
            value={statistics.shipped}
            icon="local_shipping"
            color="blue"
          />
          <StatCard
            label="Delivered"
            value={statistics.delivered}
            icon="check_circle"
            color="green"
          />
          <StatCard
            label="Cancelled"
            value={statistics.cancelled}
            icon="cancel"
            color="red"
          />
        </motion.div>

        {/* ================================================= */}
        {/* FILTER BAR */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
            {/* SEARCH */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order ID, customer name or email..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* STATUS */}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* CLEAR */}
            {(search || status) && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-red-500 text-2xl">
              error
            </span>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-sm">
                Unable to load orders
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                fetchOrders({
                  search: search.trim() || undefined,
                  status: status || undefined,
                })
              }
              className="text-sm font-bold text-red-700 hover:underline"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Order
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Items
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Total
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {orders.map((order, index) => {
                    const currentStatus = String(
                      order?.status || "",
                    ).toLowerCase();
                    const allowedStatuses = getAllowedStatuses(currentStatus);
                    const isUpdating = updatingOrderId === order.id;
                    const isDisabled =
                      actionLoading ||
                      isUpdating ||
                      allowedStatuses.length === 0;

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* ORDER */}
                        <td className="px-5 py-5">
                          <div>
                            <p className="font-bold text-gray-900">
                              #{String(order.id).slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[100px]">
                              {order.id}
                            </p>
                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-5 py-5">
                          <div className="max-w-[230px]">
                            <p className="font-semibold text-gray-900 truncate">
                              {order.customer_name || "Customer"}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {order.customer_email || "—"}
                            </p>
                          </div>
                        </td>

                        {/* ITEMS */}
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-50 rounded-lg font-bold text-indigo-600">
                            {order.item_count ?? order.items?.length ?? 0}
                          </span>
                        </td>

                        {/* TOTAL */}
                        <td className="px-5 py-5">
                          <p className="font-black text-gray-900 text-lg">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Subtotal {formatCurrency(order.subtotal)}
                          </p>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          <div className="flex flex-col gap-2 items-start">
                            <StatusBadge status={order.status} />

                            {/* Status Timeline */}
                            <StatusTimeline currentStatus={order.status} />

                            {/* Status Dropdown */}
                            <div className="relative w-full">
                              <select
                                value=""
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (!newStatus) return;
                                  handleStatusChange(order.id, newStatus);
                                }}
                                disabled={isDisabled}
                                className={`w-full h-9 px-3 rounded-lg border text-xs font-semibold outline-none transition-all ${
                                  isDisabled
                                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                }`}
                              >
                                <option value="">
                                  {allowedStatuses.length > 0
                                    ? "↻ Change Status"
                                    : "✓ Final Status"}
                                </option>

                                {allowedStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    → {STATUS_LABELS[status] || status}
                                  </option>
                                ))}
                              </select>

                              {isUpdating && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-5">
                          <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </p>
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-5 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold hover:bg-indigo-100 hover:shadow-md transition-all group-hover:scale-105"
                          >
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                            View
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {!loading && orders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-5xl text-gray-400">
                    inventory_2
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  No orders found
                </h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  {search || status
                    ? "Try changing your search or status filter to see more orders."
                    : "Orders will appear here once customers start placing orders."}
                </p>
                {(search || status) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* TABLE FOOTER */}
          {orders.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {orders.length} order{orders.length > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Auto-refresh enabled
              </span>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
