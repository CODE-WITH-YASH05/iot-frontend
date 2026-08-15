// src/api/interceptors.js

import axios from "axios";

import apiClient from "./client";
import { authStorage } from "../lib/auth-storage";

let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Add a request to the refresh queue.
 */
const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Resolve all queued requests after successful refresh.
 */
const notifyRefreshSubscribers = (accessToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(accessToken, null);
  });

  refreshSubscribers = [];
};

/**
 * Reject all queued requests if refresh fails.
 */
const rejectRefreshSubscribers = (error) => {
  refreshSubscribers.forEach((callback) => {
    callback(null, error);
  });

  refreshSubscribers = [];
};

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
| Automatically attach the access token to API requests.
|--------------------------------------------------------------------------
*/

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = authStorage.getAccessToken();

    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return config;
  },

  (error) => Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
| 401 → refresh token → retry original request
|--------------------------------------------------------------------------
*/

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
    No response from server.
    Example: network error / server unavailable.
    */
    if (!error.response) {
      return Promise.reject(error);
    }

    /*
    Only handle 401 responses.
    Never retry the same request twice.
    */
    if (
      error.response.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    /*
    Never refresh the refresh endpoint itself.
    */
    if (
      originalRequest?.url?.includes(
        "/api/v1/auth/refresh/",
      )
    ) {
      authStorage.clear();

      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();

    /*
    No refresh token available.
    */
    if (!refreshToken) {
      authStorage.clear();

      return Promise.reject(error);
    }

    /*
    Another request is already refreshing.
    Wait for it.
    */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh(
          (accessToken, refreshError) => {
            if (refreshError || !accessToken) {
              reject(
                refreshError ||
                  new Error("Token refresh failed."),
              );

              return;
            }

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`,
            };

            resolve(
              apiClient(originalRequest),
            );
          },
        );
      });
    }

    /*
    Start refresh process.
    */
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /*
      IMPORTANT:
      Use plain axios here instead of apiClient.

      Otherwise this interceptor could intercept
      the refresh request itself.
      */

      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh/`,
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

      const responseData = refreshResponse.data;

      /*
      Your success_response may return:

      {
        data: {
          access: "...",
          refresh: "..."
        }
      }

      So support both formats.
      */

      const data =
        responseData?.data ?? responseData;

      const newAccessToken = data?.access;
      const newRefreshToken = data?.refresh;

      if (!newAccessToken) {
        throw new Error(
          "Refresh response does not contain an access token.",
        );
      }

      /*
      Store new access token.
      */
      authStorage.setAccessToken(
        newAccessToken,
      );

      /*
      Store rotated refresh token if backend sends one.
      */
      if (newRefreshToken) {
        authStorage.setRefreshToken(
          newRefreshToken,
        );
      }

      /*
      Release queued requests.
      */
      notifyRefreshSubscribers(
        newAccessToken,
      );

      /*
      Retry original request.
      */
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return apiClient(originalRequest);
    } catch (refreshError) {
      /*
      Refresh failed.
      Reject waiting requests.
      */
      rejectRefreshSubscribers(
        refreshError,
      );

      /*
      Clear invalid session.
      */
      authStorage.clear();

      return Promise.reject(
        refreshError,
      );
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;