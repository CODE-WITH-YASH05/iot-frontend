import adminClient from "../../../api/admin-client";

const BRANDS_BASE = "/api/v1/brands";

export const adminBrandsApi = {
  getBrands(params = {}) {
    return adminClient.get(`${BRANDS_BASE}/`, {
      params,
    });
  },

  getBrand(id) {
    return adminClient.get(`${BRANDS_BASE}/${id}/`);
  },

  createBrand(data) {
    return adminClient.post(`${BRANDS_BASE}/`, data);
  },

  updateBrand(id, data) {
    return adminClient.patch(`${BRANDS_BASE}/${id}/`, data);
  },

  deleteBrand(id) {
    return adminClient.delete(`${BRANDS_BASE}/${id}/`);
  },
};
