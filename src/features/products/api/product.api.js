import apiClient from "../../../api/client";

const PRODUCTS_BASE = "/api/v1";

export const productApi = {
  // =========================
  // PRODUCTS
  // =========================

  getProducts(params = {}) {
    return apiClient.get(`${PRODUCTS_BASE}/products/`, {
      params,
    });
  },

  getProductBySlug(slug) {
    if (!slug) {
      throw new Error("Product slug is required.");
    }

    return apiClient.get(
      `${PRODUCTS_BASE}/products/${encodeURIComponent(slug)}/`,
    );
  },

  // =========================
  // CATEGORIES
  // =========================

  getCategories(params = {}) {
    return apiClient.get(`${PRODUCTS_BASE}/categories/`, {
      params,
    });
  },

  getCategoryBySlug(slug) {
    if (!slug) {
      throw new Error("Category slug is required.");
    }

    return apiClient.get(
      `${PRODUCTS_BASE}/categories/${encodeURIComponent(slug)}/`,
    );
  },

  // =========================
  // BRANDS
  // =========================

  getBrands(params = {}) {
    return apiClient.get(`${PRODUCTS_BASE}/brands/`, {
      params,
    });
  },

  getBrandBySlug(slug) {
    if (!slug) {
      throw new Error("Brand slug is required.");
    }

    return apiClient.get(
      `${PRODUCTS_BASE}/brands/${encodeURIComponent(slug)}/`,
    );
  },
};
