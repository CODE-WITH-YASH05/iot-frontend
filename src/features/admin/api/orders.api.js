import adminClient from "../../../api/admin-client";

// ==========================================================
// ADMIN ORDER API
// ==========================================================

const ADMIN_ORDERS_BASE = "/api/v1/orders/admin";

export const adminOrderApi = {
  // ========================================================
  // GET ALL ORDERS
  // ========================================================

  getOrders(params = {}) {
    return adminClient.get(`${ADMIN_ORDERS_BASE}/`, {
      params,
    });
  },

  // ========================================================
  // GET SINGLE ORDER
  // ========================================================

  getOrder(orderId) {
    return adminClient.get(
      `${ADMIN_ORDERS_BASE}/${encodeURIComponent(orderId)}/`,
    );
  },

  // ========================================================
  // UPDATE ORDER STATUS
  // ========================================================

  updateStatus(orderId, status) {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    if (!status) {
      throw new Error("Order status is required.");
    }

    const normalizedStatus = String(status).trim().toLowerCase();

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid order status: ${status}`);
    }

    console.log("ADMIN STATUS REQUEST:", {
      orderId,
      status: normalizedStatus,
    });

    return adminClient.patch(
      `${ADMIN_ORDERS_BASE}/${encodeURIComponent(orderId)}/status/`,
      {
        status: normalizedStatus,
      },
    );
  },

  // ========================================================
  // GET ORDER STATUS HISTORY
  // ========================================================

  getHistory(orderId) {
    return adminClient.get(
      `${ADMIN_ORDERS_BASE}/${encodeURIComponent(orderId)}/history/`,
    );
  },
};

export default adminOrderApi;
