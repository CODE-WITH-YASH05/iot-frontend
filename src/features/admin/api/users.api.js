import apiClient from "../../../api/client";

const ADMIN_BASE = "/api/v1/admin";

export const adminUsersApi = {
  getUsers(params = {}) {
    return apiClient.get(`${ADMIN_BASE}/users/`, { params });
  },

  getUser(id) {
    return apiClient.get(`${ADMIN_BASE}/users/${id}/`);
  },

  updateUser(id, data) {
    return apiClient.put(`${ADMIN_BASE}/users/${id}/`, data);
  },

  deleteUser(id) {
    return apiClient.delete(`${ADMIN_BASE}/users/${id}/`);
  },

  toggleStatus(id) {
    return apiClient.patch(`${ADMIN_BASE}/users/${id}/toggle-status/`);
  },
};
