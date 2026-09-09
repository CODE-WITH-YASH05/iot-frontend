import apiClient from "../../../api/admin-client";

<<<<<<< HEAD
const WISHLIST_BASE = "/api/v1/products/wishlist";

export const wishlistApi = {
  // Get user wishlist
  getWishlist() {
    return apiClient.get(`${WISHLIST_BASE}/`);
  },

  // Add product to wishlist
  addToWishlist(productId) {
    return apiClient.post(`${WISHLIST_BASE}/`, { product: productId });
  },

  // Remove product from wishlist
  removeFromWishlist(productId) {
    return apiClient.delete(`${WISHLIST_BASE}/${productId}/`);
  },

  // Check if product is in wishlist
  checkWishlistStatus(productId) {
    return apiClient.get(`${WISHLIST_BASE}/check/${productId}/`);
=======
const ADMIN_WISHLIST_BASE = "/api/v1/products/admin/wishlist";

export const adminWishlistApi = {
  // =====================================================
  // GET ALL USERS WISHLIST
  // =====================================================

  getWishlist() {
    return apiClient.get(`${ADMIN_WISHLIST_BASE}/`);
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
  },
};
