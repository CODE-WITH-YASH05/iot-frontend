import adminClient from "../../../api/admin-client";

const ADMIN_HOME_BASE = "/api/v1/home/admin";

const normalizeResponse = (response) => {
  return response?.data?.data || response?.data || null;
};

const createFormData = (data = {}) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const adminHomeApi = {
  // ========================================================
  // HOME CONFIG
  // ========================================================

  async getHomeConfig() {
    const response = await adminClient.get(`${ADMIN_HOME_BASE}/config/`);

    return normalizeResponse(response);
  },

  async updateHomeConfig(data) {
    const response = await adminClient.put(`${ADMIN_HOME_BASE}/config/`, data);

    return normalizeResponse(response);
  },

  async updateHomeConfigPartial(data) {
    const response = await adminClient.patch(
      `${ADMIN_HOME_BASE}/config/`,
      data,
    );

    return normalizeResponse(response);
  },

  async toggleSection(section, isEnabled) {
    const response = await adminClient.patch(`${ADMIN_HOME_BASE}/config/`, {
      [section]: isEnabled,
    });

    return normalizeResponse(response);
  },

  // ========================================================
  // GENERIC CRUD
  // ========================================================

  async getItems(endpoint) {
    const response = await adminClient.get(`${ADMIN_HOME_BASE}/${endpoint}/`);

    return normalizeResponse(response);
  },

  async getItem(endpoint, id) {
    const response = await adminClient.get(
      `${ADMIN_HOME_BASE}/${endpoint}/${id}/`,
    );

    return normalizeResponse(response);
  },

  async createItem(endpoint, data) {
    const formData = createFormData(data);

    const response = await adminClient.post(
      `${ADMIN_HOME_BASE}/${endpoint}/`,
      formData,
    );

    return normalizeResponse(response);
  },

  async updateItem(endpoint, id, data) {
    const formData = createFormData(data);

    const response = await adminClient.patch(
      `${ADMIN_HOME_BASE}/${endpoint}/${id}/`,
      formData,
    );

    return normalizeResponse(response);
  },

  async deleteItem(endpoint, id) {
    const response = await adminClient.delete(
      `${ADMIN_HOME_BASE}/${endpoint}/${id}/`,
    );

    return normalizeResponse(response);
  },

  async toggleItem(endpoint, id, isActive) {
    const response = await adminClient.patch(
      `${ADMIN_HOME_BASE}/${endpoint}/${id}/`,
      {
        is_active: isActive,
      },
    );

    return normalizeResponse(response);
  },
};

export default adminHomeApi;
