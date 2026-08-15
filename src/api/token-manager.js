import { authStorage } from "../lib/auth-storage";

export const tokenManager = {
  getAccessToken() {
    return authStorage.getAccessToken();
  },

  getRefreshToken() {
    return authStorage.getRefreshToken();
  },

  setTokens({ access, refresh }) {
    authStorage.setAccessToken(access);
    authStorage.setRefreshToken(refresh);
  },

  clear() {
    authStorage.clear();
  },
};