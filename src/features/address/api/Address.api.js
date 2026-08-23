import apiClient from "../../../api/client";

const ADDRESS_BASE = "/api/v1/address";

export const addressApi = {
  getAddresses() {
    return apiClient.get(`${ADDRESS_BASE}/`);
  },

  getAddress(addressId) {
    return apiClient.get(`${ADDRESS_BASE}/${addressId}/`);
  },

  createAddress(data) {
    return apiClient.post(`${ADDRESS_BASE}/`, data);
  },

  updateAddress(addressId, data) {
    return apiClient.patch(`${ADDRESS_BASE}/${addressId}/`, data);
  },

  deleteAddress(addressId) {
    return apiClient.delete(`${ADDRESS_BASE}/${addressId}/`);
  },

  setDefaultAddress(addressId) {
    return apiClient.patch(`${ADDRESS_BASE}/${addressId}/default/`);
  },
};
