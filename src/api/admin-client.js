import axios from "axios";
import { adminTokenManager } from "../features/admin/utils/admin-token-manager";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,

  timeout: 30000,

  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});

// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

adminApiClient.interceptors.request.use(
  (config) => {
    const accessToken = adminTokenManager.getAccessToken();

    if (accessToken) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    /*
     * IMPORTANT
     *
     * JSON request:
     * application/json
     *
     * FormData request:
     * Browser/Axios automatically sets:
     * multipart/form-data; boundary=...
     *
     * Isliye FormData ke liye Content-Type
     * manually set nahi karna.
     */

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ==========================================================
// REFRESH LOCK
// ==========================================================

let refreshPromise = null;

// ==========================================================
// REFRESH ADMIN ACCESS TOKEN
// ==========================================================

const refreshAdminAccessToken = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/admin/auth/refresh/`,
    {},
    {
      withCredentials: true,

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      timeout: 15000,
    },
  );

  const data = response?.data?.data ?? response?.data;

  const access = data?.access;

  if (!access) {
    throw new Error("Admin refresh did not return access token.");
  }

  adminTokenManager.setAccessToken(access);

  return access;
};

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

adminApiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes("/admin/auth/login/")) {
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes("/admin/auth/refresh/")) {
      adminTokenManager.clear();

      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      adminTokenManager.clear();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAdminAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return adminApiClient(originalRequest);
    } catch (refreshError) {
      adminTokenManager.clear();

      return Promise.reject(refreshError);
    }
  },
);

export default adminApiClient;
