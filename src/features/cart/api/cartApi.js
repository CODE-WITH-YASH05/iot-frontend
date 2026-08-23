import apiClient from "../../../api/client";

const CART_BASE = "/api/v1/cart";

export const cartApi = {
  getCart() {
    return apiClient.get(`${CART_BASE}/`);
  },

  addItem(productId, quantity = 1) {
    if (!productId) {
      throw new Error("Product ID is required.");
    }

    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    return apiClient.post(`${CART_BASE}/`, {
      product: productId,
      quantity,
    });
  },

  updateItem(itemId, quantity) {
    if (!itemId) {
      throw new Error("Cart item ID is required.");
    }

    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    return apiClient.patch(
      `${CART_BASE}/items/${encodeURIComponent(itemId)}/`,
      {
        quantity,
      },
    );
  },

  removeItem(itemId) {
    if (!itemId) {
      throw new Error("Cart item ID is required.");
    }

    return apiClient.delete(
      `${CART_BASE}/items/${encodeURIComponent(itemId)}/`,
    );
  },

  clearCart() {
    return apiClient.delete(`${CART_BASE}/clear/`);
  },
};

export default cartApi;
