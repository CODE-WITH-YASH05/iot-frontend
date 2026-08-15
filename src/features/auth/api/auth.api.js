// src/features/auth/api/auth.api.js

import apiClient from "../../../api/client";

const AUTH_BASE = "/api/v1/auth";

export const authApi = {
  login(payload) {
    return apiClient.post(`${AUTH_BASE}/login/`, payload);
  },

  register(payload) {
    return apiClient.post(`${AUTH_BASE}/register/`, payload);
  },

  verifyEmail(payload) {
    return apiClient.post(`${AUTH_BASE}/verify-email/`, payload);
  },

  resendOTP(payload) {
    return apiClient.post(`${AUTH_BASE}/resend-otp/`, payload);
  },

  refreshToken(payload) {
    return apiClient.post(`${AUTH_BASE}/refresh/`, payload);
  },

  logout(payload) {
    return apiClient.post(`${AUTH_BASE}/logout/`, payload);
  },

  changePassword(payload) {
    return apiClient.post(`${AUTH_BASE}/change-password/`, payload);
  },

  forgotPassword(payload) {
    return apiClient.post(`${AUTH_BASE}/forgot-password/`, payload);
  },

  verifyResetOtp(payload) {
    return apiClient.post(`${AUTH_BASE}/verify-reset-otp/`, payload);
  },

  resetPassword(payload) {
    return apiClient.post(`${AUTH_BASE}/reset-password/`, payload);
  },

  getProfile() {
    return apiClient.get(`${AUTH_BASE}/profile/`);
  },
};
