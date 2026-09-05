import { useCallback, useEffect, useState } from "react";

import { adminHomeApi } from "../api/home.api";

// ==========================================================
// ERROR HELPER
// ==========================================================

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong. Please try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.error) {
    if (typeof data.error === "string") {
      return data.error;
    }

    if (typeof data.error === "object") {
      return Object.values(data.error).flat().join(", ");
    }
  }

  if (data.detail) {
    return data.detail;
  }

  const fieldErrors = Object.values(data).flat().filter(Boolean);

  if (fieldErrors.length > 0) {
    return fieldErrors.join(", ");
  }

  return "Something went wrong. Please try again.";
};

// ==========================================================
// HOOK
// ==========================================================

export function useAdminHome({ autoFetch = true } = {}) {
  // ========================================================
  // STATE
  // ========================================================

  const [homeConfig, setHomeConfig] = useState(null);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  // ========================================================
  // FETCH CONFIG
  // ========================================================

  const fetchHomeConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await adminHomeApi.getHomeConfig();

      setHomeConfig(data);

      return data;
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // UPDATE COMPLETE CONFIG
  // ========================================================

  const updateHomeConfig = useCallback(async (payload) => {
    try {
      setSaving(true);
      setError(null);

      const data = await adminHomeApi.updateHomeConfig(payload);

      setHomeConfig(data);

      return data;
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);

      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // ========================================================
  // PARTIAL UPDATE
  // ========================================================

  const updateHomeConfigPartial = useCallback(async (payload) => {
    try {
      setSaving(true);
      setError(null);

      const data = await adminHomeApi.updateHomeConfigPartial(payload);

      setHomeConfig(data);

      return data;
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);

      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // ========================================================
  // TOGGLE SECTION
  // ========================================================

  const toggleSection = useCallback(async (section, isEnabled) => {
    try {
      setSaving(true);
      setError(null);

      const data = await adminHomeApi.toggleSection(section, isEnabled);

      setHomeConfig(data);

      return data;
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);

      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // ========================================================
  // AUTO FETCH
  // ========================================================

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchHomeConfig().catch(() => {
      // Error state already handled
    });
  }, [autoFetch, fetchHomeConfig]);

  // ========================================================
  // RETURN
  // ========================================================

  return {
    homeConfig,

    loading,

    saving,

    error,

    setHomeConfig,

    fetchHomeConfig,

    updateHomeConfig,

    updateHomeConfigPartial,

    toggleSection,
  };
}

export default useAdminHome;
