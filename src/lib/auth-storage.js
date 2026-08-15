const ACCESS_TOKEN_KEY = "iot_access_token";
const REFRESH_TOKEN_KEY = "iot_refresh_token";
const USER_KEY = "iot_user";

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  },

  setSession({ access, refresh, user }) {
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  hasSession() {
    return Boolean(
      this.getAccessToken() &&
      this.getRefreshToken()
    );
  },
};