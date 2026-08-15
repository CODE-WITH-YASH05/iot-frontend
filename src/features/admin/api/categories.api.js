import adminClient from "../../../api/admin-client";

const CATEGORIES_BASE = "/api/v1/categories";

export const adminCategoriesApi = {
  getCategories(params = {}) {
    return adminClient.get(`${CATEGORIES_BASE}/`, {
      params,
    });
  },

  getCategory(id) {
    return adminClient.get(`${CATEGORIES_BASE}/${id}/`);
  },

  createCategory(data) {
    return adminClient.post(`${CATEGORIES_BASE}/`, data);
  },

  updateCategory(id, data) {
    return adminClient.patch(`${CATEGORIES_BASE}/${id}/`, data);
  },

  deleteCategory(id) {
    return adminClient.delete(`${CATEGORIES_BASE}/${id}/`);
  },
};
