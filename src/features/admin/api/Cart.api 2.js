import apiClient from "../../../api/admin-client";

const ADMIN_CART_BASE = "/api/v1/cart/admin";

export const adminCartApi = {
  // ========================================================
  // GET ALL CARTS
  // GET /api/v1/cart/admin/
  // ========================================================

  getCarts(params = {}) {
    return apiClient.get(`${ADMIN_CART_BASE}/`, {
      params,
    });
  },

  // ========================================================
  // GET SINGLE CART
  // GET /api/v1/cart/admin/<cart_id>/
  // ========================================================

  getCart(cartId) {
    if (!cartId) {
      throw new Error("Cart ID is required.");
    }

    return apiClient.get(`${ADMIN_CART_BASE}/${encodeURIComponent(cartId)}/`);
  },

  // ========================================================
  // DELETE CART
  // DELETE /api/v1/cart/admin/<cart_id>/
  // ========================================================

  deleteCart(cartId) {
    if (!cartId) {
      throw new Error("Cart ID is required.");
    }

    return apiClient.delete(
      `${ADMIN_CART_BASE}/${encodeURIComponent(cartId)}/`,
    );
  },

  // ========================================================
  // CLEAR CART ITEMS
  // DELETE /api/v1/cart/admin/<cart_id>/clear/
  // ========================================================

  clearCart(cartId) {
    if (!cartId) {
      throw new Error("Cart ID is required.");
    }

    return apiClient.delete(
      `${ADMIN_CART_BASE}/${encodeURIComponent(cartId)}/clear/`,
    );
  },
};

export default adminCartApi;
