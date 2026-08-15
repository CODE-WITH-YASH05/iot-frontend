import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { adminAuthApi } from "../api/auth.api";
import { adminTokenManager } from "../utils/admin-token-manager";

export function useAdminAuth() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHECK AUTH
  // ==========================================================

  const checkAuth = useCallback(async () => {
    const accessToken = adminTokenManager.getAccessToken();

    if (!accessToken) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminAuthApi.getProfile();

      const profile = response?.data?.data ?? response?.data;

      setUser(profile);
      setIsAuthenticated(true);

      adminTokenManager.setUser(profile);
    } catch (error) {
      adminTokenManager.clear();

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAuthApi.login({
        email,
        password,
      });

      const responseData = response.data;

      const access = responseData?.data?.access;
      const user = responseData?.data?.user;

      if (!access || !user) {
        throw new Error("Invalid admin login response.");
      }

      localStorage.setItem("adminAccessToken", access);

      localStorage.setItem("adminUser", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return {
        success: true,
      };
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid credentials.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async () => {
    try {
      await adminAuthApi.logout();
    } catch (error) {
      // Logout should continue even if API fails.
    } finally {
      adminTokenManager.clear();

      setUser(null);
      setIsAuthenticated(false);

      navigate("/admin/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // ==========================================================
  // INITIAL AUTH CHECK
  // ==========================================================

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,

    login,
    logout,
    checkAuth,
  };
}
