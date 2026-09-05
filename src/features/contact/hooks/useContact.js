import { useCallback, useEffect, useState } from "react";

import contactApi from "../api/contact.api";

export function useContact({ autoFetch = true } = {}) {
  // =====================================================
  // STATE
  // =====================================================

  const [settings, setSettings] = useState(null);

  const [offices, setOffices] = useState([]);

  const [faqs, setFaqs] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);

  const [submitError, setSubmitError] = useState(null);

  const [success, setSuccess] = useState(false);

  // =====================================================
  // FETCH CONTACT DATA
  // =====================================================

  const fetchContact = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [settingsResponse, officesResponse, faqsResponse] =
        await Promise.all([
          contactApi.getSettings(),
          contactApi.getOffices(),
          contactApi.getFAQs(),
        ]);

      setSettings(settingsResponse?.data ?? null);

      setOffices(
        Array.isArray(officesResponse?.data)
          ? officesResponse.data
          : (officesResponse?.data?.results ?? []),
      );

      setFaqs(
        Array.isArray(faqsResponse?.data)
          ? faqsResponse.data
          : (faqsResponse?.data?.results ?? []),
      );
    } catch (err) {
      console.error("Contact fetch error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load contact information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // SUBMIT CONTACT FORM
  // =====================================================

  const submitInquiry = useCallback(async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);

    try {
      const response = await contactApi.createInquiry(data);

      setSuccess(true);

      return response;
    } catch (err) {
      console.error("Contact inquiry error:", err);

      setSubmitError(
        err?.response?.data || err?.message || "Failed to send your message.",
      );

      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // =====================================================
  // AUTO FETCH
  // =====================================================

  useEffect(() => {
    if (autoFetch) {
      fetchContact();
    }
  }, [autoFetch, fetchContact]);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    settings,

    offices,

    faqs,

    loading,

    submitting,

    error,

    submitError,

    success,

    fetchContact,

    submitInquiry,
  };
}

export default useContact;
