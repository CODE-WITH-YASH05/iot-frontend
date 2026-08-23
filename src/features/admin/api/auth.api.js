import apiClient from "../../../api/admin-client";

const ADMIN_AUTH_BASE = "/api/v1/admin/auth";

export const adminAuthApi = {
  // ========================================================
  // ADMIN LOGIN
  // POST /api/v1/admin/auth/login/
  // ========================================================

  login(credentials) {
    if (!credentials?.email) {
      throw new Error("Admin email is required.");
    }

    if (!credentials?.password) {
      throw new Error("Admin password is required.");
    }

    return apiClient.post(`${ADMIN_AUTH_BASE}/login/`, {
      email: credentials.email,
      password: credentials.password,
    });
  },

  // ========================================================
  // ADMIN PROFILE
  // GET /api/v1/admin/auth/profile/
  // ========================================================

  getProfile() {
    return apiClient.get(`${ADMIN_AUTH_BASE}/profile/`);
  },
};

export default adminAuthApi;
