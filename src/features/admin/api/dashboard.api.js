import apiClient from "../../../api/client";

const ADMIN_BASE = "/api/v1/admin";

export const dashboardApi = {
  getStats() {
    return apiClient.get(`${ADMIN_BASE}/dashboard/stats/`);
  },

  getRecentOrders() {
    return apiClient.get(`${ADMIN_BASE}/dashboard/recent-orders/`);
  },

  getRevenueData() {
    return apiClient.get(`${ADMIN_BASE}/dashboard/revenue/`);
  },

  getTopProducts() {
    return apiClient.get(`${ADMIN_BASE}/dashboard/top-products/`);
  },
};
