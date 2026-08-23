import apiClient from "../../../api/client";

const ORDER_BASE = "/api/v1/orders";

export const orderApi = {
  // ==========================================
  // FETCH ALL ORDERS
  // GET /api/v1/orders/
  // ==========================================

  getOrders() {
    return apiClient.get(`${ORDER_BASE}/`);
  },

  // ==========================================
  // FETCH SINGLE ORDER
  // GET /api/v1/orders/:orderId/
  // ==========================================

  getOrder(orderId) {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    return apiClient.get(`${ORDER_BASE}/${encodeURIComponent(orderId)}/`);
  },

  // ==========================================
  // CANCEL ORDER
  // POST /api/v1/orders/:orderId/cancel/
  // ==========================================

  cancelOrder(orderId) {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    return apiClient.post(
      `${ORDER_BASE}/${encodeURIComponent(orderId)}/cancel/`,
    );
  },

  // ==========================================
  // FETCH ORDER STATUS HISTORY
  // GET /api/v1/orders/:orderId/history/
  // ==========================================

  getOrderHistory(orderId) {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    return apiClient.get(
      `${ORDER_BASE}/${encodeURIComponent(orderId)}/history/`,
    );
  },

  // ==========================================
  // CHECKOUT / CREATE ORDER
  // POST /api/v1/orders/checkout/
  // ==========================================

  checkout(addressId, coupon = "") {
    if (!addressId) {
      throw new Error("Address ID is required.");
    }

    const payload = {
      address: addressId,
    };

    if (coupon) {
      payload.coupon = coupon;
    }

    return apiClient.post(`${ORDER_BASE}/checkout/`, payload);
  },
};

export default orderApi;
