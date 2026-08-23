import apiClient from "../../../api/admin-client";

const ADMIN_WISHLIST_BASE = "/api/v1/products/admin/wishlist";

export const adminWishlistApi = {
  // =====================================================
  // GET ALL USERS WISHLIST
  // =====================================================

  getWishlist() {
    return apiClient.get(`${ADMIN_WISHLIST_BASE}/`);
  },
};
