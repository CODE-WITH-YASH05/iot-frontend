import axios from "axios";
import { tokenManager } from "./token-manager";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,

  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenManager.getAccessToken();

    if (accessToken) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    /*
     * IMPORTANT
     *
     * FormData ke liye Content-Type
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
// REFRESH STATE
// ==========================================================

let refreshPromise = null;

// ==========================================================
// REFRESH ACCESS TOKEN
// ==========================================================

const refreshAccessToken = async () => {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is not available.");
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/auth/refresh/`,
    {
      refresh: refreshToken,
    },
    {
      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      timeout: 15000,
    },
  );

  const responseData = response.data;

  const data = responseData?.data ?? responseData;

  const access = data?.access;

  const refresh = data?.refresh;

  if (!access) {
    throw new Error("Refresh response does not contain an access token.");
  }

  tokenManager.setTokens({
    access,
    refresh: refresh || refreshToken,
  });

  return access;
};

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes("/auth/refresh/")) {
      tokenManager.clear();

      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      tokenManager.clear();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenManager.clear();

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
