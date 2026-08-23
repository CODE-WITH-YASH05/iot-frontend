// ==========================================================
// STATUS LABELS
// ==========================================================

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ==========================================================
// STATUS COLORS
// ==========================================================

export const STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  processing: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  shipped: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

// ==========================================================
// ALLOWED STATUS TRANSITIONS
// ==========================================================

export const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// ==========================================================
// GET ALLOWED STATUSES
// ==========================================================

export const getAllowedStatuses = (currentStatus) => {
  if (!currentStatus) return [];
  return ALLOWED_STATUS_TRANSITIONS[currentStatus.toLowerCase()] || [];
};

// ==========================================================
// CAN TRANSITION
// ==========================================================

export const canTransition = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;
  const allowed = getAllowedStatuses(currentStatus);
  return allowed.includes(newStatus.toLowerCase());
};
