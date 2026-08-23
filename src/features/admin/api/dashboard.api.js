import adminClient from "../../../api/admin-client";

const DASHBOARD_BASE = "/api/v1/admin/dashboard";

export const dashboardApi = {
  // Get dashboard stats
  getStats() {
    return adminClient.get(`${DASHBOARD_BASE}/stats/`);
  },

  // Get recent orders
  getRecentOrders(limit = 10) {
    return adminClient.get(`${DASHBOARD_BASE}/recent-orders/`, {
      params: { limit },
    });
  },

  // Get revenue data for charts
  getRevenueData() {
    return adminClient.get(`${DASHBOARD_BASE}/revenue/`);
  },

  // Get top products
  getTopProducts(limit = 5) {
    return adminClient.get(`${DASHBOARD_BASE}/top-products/`, {
      params: { limit },
    });
  },

  // Get order status distribution
  getOrderStatus() {
    return adminClient.get(`${DASHBOARD_BASE}/order-status/`);
  },

  // Get category distribution
  getCategoryDistribution() {
    return adminClient.get(`${DASHBOARD_BASE}/category-distribution/`);
  },
};
