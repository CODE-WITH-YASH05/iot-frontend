import apiClient from "../../../api/admin-client";

const CONTACT_BASE = "/api/v1/contact";
const ADMIN_CONTACT_BASE = "/api/v1/contact/admin";

export const adminContactApi = {
  // ========================================================
  // CONTACT SETTINGS
  // GET /api/v1/contact/settings/
  // PATCH /api/v1/contact/settings/
  // ========================================================

  getSettings() {
    return apiClient.get(`${CONTACT_BASE}/settings/`);
  },

  updateSettings(data) {
    if (!data) {
      throw new Error("Contact settings data is required.");
    }

    return apiClient.patch(`${CONTACT_BASE}/settings/`, data);
  },

  // ========================================================
  // GET ALL OFFICES
  // GET /api/v1/contact/admin/offices/
  // ========================================================

  getOffices() {
    return apiClient.get(`${ADMIN_CONTACT_BASE}/offices/`);
  },

  // ========================================================
  // CREATE OFFICE
  // POST /api/v1/contact/admin/offices/
  // ========================================================

  createOffice(data) {
    if (!data) {
      throw new Error("Office data is required.");
    }

    return apiClient.post(`${ADMIN_CONTACT_BASE}/offices/`, data);
  },

  // ========================================================
  // UPDATE OFFICE
  // PATCH /api/v1/contact/admin/offices/<id>/
  // ========================================================

  updateOffice(officeId, data) {
    if (!officeId) {
      throw new Error("Office ID is required.");
    }

    if (!data) {
      throw new Error("Office data is required.");
    }

    return apiClient.patch(
      `${ADMIN_CONTACT_BASE}/offices/${encodeURIComponent(officeId)}/`,
      data,
    );
  },

  // ========================================================
  // DELETE OFFICE
  // DELETE /api/v1/contact/admin/offices/<id>/
  // ========================================================

  deleteOffice(officeId) {
    if (!officeId) {
      throw new Error("Office ID is required.");
    }

    return apiClient.delete(
      `${ADMIN_CONTACT_BASE}/offices/${encodeURIComponent(officeId)}/`,
    );
  },

  // ========================================================
  // GET ALL FAQS
  // GET /api/v1/contact/admin/faqs/
  // ========================================================

  getFAQs() {
    return apiClient.get(`${ADMIN_CONTACT_BASE}/faqs/`);
  },

  // ========================================================
  // CREATE FAQ
  // POST /api/v1/contact/admin/faqs/
  // ========================================================

  createFAQ(data) {
    if (!data) {
      throw new Error("FAQ data is required.");
    }

    return apiClient.post(`${ADMIN_CONTACT_BASE}/faqs/`, data);
  },

  // ========================================================
  // UPDATE FAQ
  // PATCH /api/v1/contact/admin/faqs/<id>/
  // ========================================================

  updateFAQ(faqId, data) {
    if (!faqId) {
      throw new Error("FAQ ID is required.");
    }

    if (!data) {
      throw new Error("FAQ data is required.");
    }

    return apiClient.patch(
      `${ADMIN_CONTACT_BASE}/faqs/${encodeURIComponent(faqId)}/`,
      data,
    );
  },

  // ========================================================
  // DELETE FAQ
  // DELETE /api/v1/contact/admin/faqs/<id>/
  // ========================================================

  deleteFAQ(faqId) {
    if (!faqId) {
      throw new Error("FAQ ID is required.");
    }

    return apiClient.delete(
      `${ADMIN_CONTACT_BASE}/faqs/${encodeURIComponent(faqId)}/`,
    );
  },

  // ========================================================
  // GET ALL INQUIRIES
  // GET /api/v1/contact/admin/inquiries/
  // ========================================================

  getInquiries(params = {}) {
    return apiClient.get(`${ADMIN_CONTACT_BASE}/inquiries/`, {
      params,
    });
  },

  // ========================================================
  // GET SINGLE INQUIRY
  // GET /api/v1/contact/admin/inquiries/<id>/
  // ========================================================

  getInquiry(inquiryId) {
    if (!inquiryId) {
      throw new Error("Inquiry ID is required.");
    }

    return apiClient.get(
      `${ADMIN_CONTACT_BASE}/inquiries/${encodeURIComponent(inquiryId)}/`,
    );
  },

  // ========================================================
  // UPDATE INQUIRY
  // PATCH /api/v1/contact/admin/inquiries/<id>/
  // ========================================================

  updateInquiry(inquiryId, data) {
    if (!inquiryId) {
      throw new Error("Inquiry ID is required.");
    }

    if (!data) {
      throw new Error("Inquiry data is required.");
    }

    return apiClient.patch(
      `${ADMIN_CONTACT_BASE}/inquiries/${encodeURIComponent(inquiryId)}/`,
      data,
    );
  },

  // ========================================================
  // DELETE INQUIRY
  // DELETE /api/v1/contact/admin/inquiries/<id>/
  // ========================================================

  deleteInquiry(inquiryId) {
    if (!inquiryId) {
      throw new Error("Inquiry ID is required.");
    }

    return apiClient.delete(
      `${ADMIN_CONTACT_BASE}/inquiries/${encodeURIComponent(inquiryId)}/`,
    );
  },
};

export default adminContactApi;
