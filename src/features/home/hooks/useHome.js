import { useCallback, useEffect, useState } from "react";
import { homeApi } from "../api/home.api";

// ==========================================================
// HELPER
// ==========================================================

const normalizeResponse = (response) => {
  if (!response) {
    return null;
  }

  const payload = response.data ?? response;

  if (payload?.data) {
    return payload.data;
  }

  return payload;
};

// ==========================================================
// HOOK
// ==========================================================

export function useHome({ autoFetch = true } = {}) {
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // ========================================================
  // FETCH
  // ========================================================

  const fetchHome = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await homeApi.getHomeConfig();
      const data = normalizeResponse(response);

      // Check if home page is active
      if (data) {
        setIsActive(data.is_active !== false);
        setHome(data);
      } else {
        setHome(null);
        setIsActive(true); // Default to true if no data
      }

      return data;
    } catch (err) {
      console.error("Failed to fetch home configuration:", err);

      setError(
        err?.response?.data || err?.message || "Failed to load home page.",
      );
      setHome(null);
      setIsActive(true); // Default to true on error

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // AUTO FETCH
  // ========================================================

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchHome().catch(() => {});
  }, [autoFetch, fetchHome]);

  // ========================================================
  // RETURN
  // ========================================================

  return {
    home,
    loading,
    error,
    isActive,
    refetch: fetchHome,
    setHome,
  };
}

export default useHome;
