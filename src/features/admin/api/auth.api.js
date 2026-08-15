import adminApiClient from "../../../api/admin-client";

const ADMIN_BASE = "/api/v1/admin";

export const adminAuthApi = {
  login(credentials) {
    return adminApiClient.post(`${ADMIN_BASE}/auth/login/`, credentials);
  },

  logout() {
    return adminApiClient.post(`${ADMIN_BASE}/auth/logout/`);
  },

  getProfile() {
    return adminApiClient.get(`${ADMIN_BASE}/auth/profile/`);
  },

  refreshToken() {
    return adminApiClient.post(`${ADMIN_BASE}/auth/refresh/`);
  },

  changePassword(data) {
    return adminApiClient.post(`${ADMIN_BASE}/auth/change-password/`, data);
  },
};
