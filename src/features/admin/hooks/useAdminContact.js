import { useCallback, useEffect, useState } from "react";

import adminContactApi from "../api/contact.api";

export function useAdminContact({ autoFetch = true } = {}) {
  // =====================================================
  // STATE
  // =====================================================

  const [settings, setSettings] = useState(null);

  const [offices, setOffices] = useState([]);

  const [faqs, setFaqs] = useState([]);

  const [inquiries, setInquiries] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  // =====================================================
  // RESPONSE HELPER
  // =====================================================

  const getListData = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return response?.data?.results ?? [];
  };

  // =====================================================
  // FETCH SETTINGS
  // =====================================================

  const fetchSettings = useCallback(async () => {
    const response = await adminContactApi.getSettings();

    setSettings(response?.data ?? null);

    return response;
  }, []);

  // =====================================================
  // FETCH OFFICES
  // =====================================================

  const fetchOffices = useCallback(async () => {
    const response = await adminContactApi.getOffices();

    const data = getListData(response);

    setOffices(data);

    return response;
  }, []);

  // =====================================================
  // FETCH FAQ
  // =====================================================

  const fetchFAQs = useCallback(async () => {
    const response = await adminContactApi.getFAQs();

    const data = getListData(response);

    setFaqs(data);

    return response;
  }, []);

  // =====================================================
  // FETCH INQUIRIES
  // =====================================================

  const fetchInquiries = useCallback(async (params = {}) => {
    const response = await adminContactApi.getInquiries(params);

    const data = getListData(response);

    setInquiries(data);

    return response;
  }, []);

  // =====================================================
  // FETCH EVERYTHING
  // =====================================================

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchSettings(),
        fetchOffices(),
        fetchFAQs(),
        fetchInquiries(),
      ]);
    } catch (err) {
      console.error("Admin contact fetch error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load contact data.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchSettings, fetchOffices, fetchFAQs, fetchInquiries]);

  // =====================================================
  // UPDATE SETTINGS
  // =====================================================

  const updateSettings = useCallback(async (data) => {
    setSaving(true);

    try {
      const response = await adminContactApi.updateSettings(data);

      setSettings(response?.data ?? null);

      return response;
    } finally {
      setSaving(false);
    }
  }, []);

  // =====================================================
  // CREATE OFFICE
  // =====================================================

  const createOffice = useCallback(
    async (data) => {
      setSaving(true);

      try {
        const response = await adminContactApi.createOffice(data);

        await fetchOffices();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchOffices],
  );

  // =====================================================
  // UPDATE OFFICE
  // =====================================================

  const updateOffice = useCallback(
    async (id, data) => {
      setSaving(true);

      try {
        const response = await adminContactApi.updateOffice(id, data);

        await fetchOffices();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchOffices],
  );

  // =====================================================
  // DELETE OFFICE
  // =====================================================

  const deleteOffice = useCallback(
    async (id) => {
      setSaving(true);

      try {
        const response = await adminContactApi.deleteOffice(id);

        await fetchOffices();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchOffices],
  );

  // =====================================================
  // CREATE FAQ
  // =====================================================

  const createFAQ = useCallback(
    async (data) => {
      setSaving(true);

      try {
        const response = await adminContactApi.createFAQ(data);

        await fetchFAQs();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchFAQs],
  );

  // =====================================================
  // UPDATE FAQ
  // =====================================================

  const updateFAQ = useCallback(
    async (id, data) => {
      setSaving(true);

      try {
        const response = await adminContactApi.updateFAQ(id, data);

        await fetchFAQs();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchFAQs],
  );

  // =====================================================
  // DELETE FAQ
  // =====================================================

  const deleteFAQ = useCallback(
    async (id) => {
      setSaving(true);

      try {
        const response = await adminContactApi.deleteFAQ(id);

        await fetchFAQs();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchFAQs],
  );

  // =====================================================
  // UPDATE INQUIRY
  // =====================================================

  const updateInquiry = useCallback(
    async (id, data) => {
      setSaving(true);

      try {
        const response = await adminContactApi.updateInquiry(id, data);

        await fetchInquiries();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchInquiries],
  );

  // =====================================================
  // DELETE INQUIRY
  // =====================================================

  const deleteInquiry = useCallback(
    async (id) => {
      setSaving(true);

      try {
        const response = await adminContactApi.deleteInquiry(id);

        await fetchInquiries();

        return response;
      } finally {
        setSaving(false);
      }
    },
    [fetchInquiries],
  );

  // =====================================================
  // AUTO FETCH
  // =====================================================

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    settings,
    offices,
    faqs,
    inquiries,

    loading,
    saving,
    error,

    fetchSettings,
    fetchOffices,
    fetchFAQs,
    fetchInquiries,
    fetchAll,

    updateSettings,

    createOffice,
    updateOffice,
    deleteOffice,

    createFAQ,
    updateFAQ,
    deleteFAQ,

    updateInquiry,
    deleteInquiry,
  };
}

export default useAdminContact;
