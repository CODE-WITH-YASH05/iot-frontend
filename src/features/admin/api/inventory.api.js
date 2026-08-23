import adminApiClient from "../../../api/admin-client";

export const adminInventoryApi = {
  // =========================================================
  // GET INVENTORY
  // =========================================================

  getInventory(slug) {
    return adminApiClient.get(`/api/v1/products/${slug}/inventory/`);
  },

  // =========================================================
  // UPDATE INVENTORY
  // =========================================================

  updateInventory(slug, data) {
    return adminApiClient.patch(`/api/v1/products/${slug}/inventory/`, data);
  },
};
