import apiClient from "../../../api/client";

const CONTACT_BASE = "/api/v1/contact";

export const contactApi = {
  // =====================================================
  // CONTACT SETTINGS
  // =====================================================

  getSettings() {
    return apiClient.get(`${CONTACT_BASE}/settings/`);
  },

  // =====================================================
  // OFFICES
  // =====================================================

  getOffices() {
    return apiClient.get(`${CONTACT_BASE}/offices/`);
  },

  // =====================================================
  // FAQ
  // =====================================================

  getFAQs() {
    return apiClient.get(`${CONTACT_BASE}/faqs/`);
  },

  // =====================================================
  // CONTACT INQUIRY
  // =====================================================

  createInquiry(data) {
    if (!data) {
      throw new Error("Contact inquiry data is required.");
    }

    return apiClient.post(`${CONTACT_BASE}/inquiries/`, data);
  },
};

export default contactApi;
