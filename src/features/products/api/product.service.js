import { productApi } from "./product.api";

const unwrapResponse = (response) => {
  const responseData = response?.data;

  return responseData?.data ?? responseData;
};

export const productService = {
  // =========================
  // PRODUCTS
  // =========================

  async getProducts(params = {}) {
    const response = await productApi.getProducts(params);

    const data = unwrapResponse(response);

    return Array.isArray(data) ? data : [];
  },

  async getProductBySlug(slug) {
    const response = await productApi.getProductBySlug(slug);

    return unwrapResponse(response);
  },

  // =========================
  // CATEGORIES
  // =========================

  async getCategories(params = {}) {
    const response = await productApi.getCategories(params);

    const data = unwrapResponse(response);

    return Array.isArray(data) ? data : [];
  },

  async getCategoryBySlug(slug) {
    const response = await productApi.getCategoryBySlug(slug);

    return unwrapResponse(response);
  },

  // =========================
  // BRANDS
  // =========================

  async getBrands(params = {}) {
    const response = await productApi.getBrands(params);

    const data = unwrapResponse(response);

    return Array.isArray(data) ? data : [];
  },

  async getBrandBySlug(slug) {
    const response = await productApi.getBrandBySlug(slug);

    return unwrapResponse(response);
  },
};
