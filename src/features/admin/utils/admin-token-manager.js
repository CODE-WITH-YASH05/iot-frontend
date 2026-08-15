const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_USER_KEY = "adminUser";

export const adminTokenManager = {
  getAccessToken() {
    return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  },

  setAccessToken(access) {
    if (!access) return;

    localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, access);
  },

  setUser(user) {
    if (!user) return;

    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem(ADMIN_USER_KEY);

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);

    localStorage.removeItem(ADMIN_USER_KEY);
  },
};
