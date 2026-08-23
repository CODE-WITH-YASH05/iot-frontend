import apiClient from "../../../api/client";

const WISHLIST_BASE = "/api/v1/products/wishlist";

export const wishlistApi = {
  // Get logged-in user's wishlist
  getWishlist() {
    return apiClient.get(`${WISHLIST_BASE}/`);
  },

  // Add product
  addToWishlist(productId) {
    return apiClient.post(`${WISHLIST_BASE}/`, {
      product: productId,
    });
  },

  // Remove product
  removeFromWishlist(productId) {
    return apiClient.delete(`${WISHLIST_BASE}/${productId}/`);
  },
};
