import adminApiClient from "../../../api/admin-client";

const ADMIN_BASE = "/api/v1/admin";

export const adminUsersApi = {
  // Get all users
  getUsers(params = {}) {
    return adminApiClient.get(`${ADMIN_BASE}/users/`, {
      params,
    });
  },

  // Get single user
  getUser(id) {
    return adminApiClient.get(`${ADMIN_BASE}/users/${id}/`);
  },

  // Update user
  updateUser(id, data) {
    return adminApiClient.patch(`${ADMIN_BASE}/users/${id}/`, data);
  },

  // Delete user
  deleteUser(id) {
    return adminApiClient.delete(`${ADMIN_BASE}/users/${id}/`);
  },

  // Change user status
  updateStatus(id, isActive) {
    return adminApiClient.patch(`${ADMIN_BASE}/users/${id}/`, {
      is_active: isActive,
    });
  },
};
