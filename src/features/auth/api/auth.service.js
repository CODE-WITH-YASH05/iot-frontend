// src/features/auth/api/auth.service.js

import { authApi } from "./auth.api";
import { authStorage } from "../../../lib/auth-storage";

export const authService = {
  async login(credentials) {
    const response = await authApi.login(credentials);

    const data = response.data;

    const session = data?.data ?? data;

    if (!session?.access || !session?.refresh || !session?.user) {
      throw new Error("Invalid login response.");
    }

    authStorage.setSession({
      access: session.access,
      refresh: session.refresh,
      user: session.user,
    });

    return session;
  },

  async register(payload) {
    const response = await authApi.register(payload);

    return response.data;
  },

  async verifyEmail(payload) {
    const response = await authApi.verifyEmail(payload);

    return response.data;
  },

  async resendOtp(payload) {
    const response = await authApi.resendOtp(payload);

    return response.data;
  },

  async refreshToken() {
    const refresh = authStorage.getRefreshToken();

    if (!refresh) {
      throw new Error("Refresh token not available.");
    }

    const response = await authApi.refreshToken({
      refresh,
    });

    const data = response.data;

    const result = data?.data ?? data;

    if (!result?.access) {
      throw new Error("Invalid refresh response.");
    }

    authStorage.setAccessToken(result.access);

    if (result.refresh) {
      authStorage.setRefreshToken(result.refresh);
    }

    return result;
  },

  async logout() {
    const refresh = authStorage.getRefreshToken();

    try {
      if (refresh) {
        await authApi.logout({
          refresh,
        });
      }
    } finally {
      authStorage.clear();
    }
  },

  async changePassword(payload) {
    const response = await authApi.changePassword(payload);

    return response.data;
  },

  async forgotPassword(payload) {
    const response = await authApi.forgotPassword(payload);

    return response.data;
  },

  async verifyResetOtp(payload) {
    const response = await authApi.verifyResetOtp(payload);

    return response.data;
  },

  async resetPassword(payload) {
    const response = await authApi.resetPassword(payload);

    return response.data;
  },

  async getProfile() {
    const response = await authApi.getProfile();

    return response.data;
  },
};