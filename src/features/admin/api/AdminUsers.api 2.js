import apiClient from "../../../api/admin-client";

const ADMIN_USERS_BASE = "/api/v1/admin/users";

export const adminUsersApi = {
  // ========================================================
  // GET ALL USERS
  // GET /api/v1/admin/users/
  // ========================================================

  getUsers(params = {}) {
    return apiClient.get(`${ADMIN_USERS_BASE}/`, {
      params,
    });
  },

  // ========================================================
  // GET SINGLE USER
  // GET /api/v1/admin/users/<user_id>/
  // ========================================================

  getUser(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return apiClient.get(`${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/`);
  },

  // ========================================================
  // GET USER ADDRESSES
  // GET /api/v1/admin/users/<user_id>/addresses/
  // ========================================================

  getUserAddresses(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return apiClient.get(
      `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/addresses/`,
    );
  },

  // ========================================================
  // ACTIVATE / DEACTIVATE USER
  // PATCH /api/v1/admin/users/<user_id>/status/
  // ========================================================

  updateUserStatus(userId, isActive) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (typeof isActive !== "boolean") {
      throw new Error("isActive must be a boolean.");
    }

    return apiClient.patch(
      `${ADMIN_USERS_BASE}/${encodeURIComponent(userId)}/status/`,
      {
        is_active: isActive,
      },
    );
  },

  // ========================================================
  // ACTIVATE USER
  // ========================================================

  activateUser(userId) {
    return this.updateUserStatus(userId, true);
  },

  // ========================================================
  // DEACTIVATE USER
  // ========================================================

  deactivateUser(userId) {
    return this.updateUserStatus(userId, false);
  },
};

export default adminUsersApi;
