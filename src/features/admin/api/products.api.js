import adminApiClient from "../../../api/admin-client";

const API_BASE = "/api/v1";

export const adminProductsApi = {
  // =========================================================
  // PRODUCTS
  // =========================================================

  getProducts(params = {}) {
    return apiClient.get(`${API_BASE}/products/`, {
      params,
    });
  },

  getProduct(slug) {
    return apiClient.get(`${API_BASE}/products/${slug}/`);
  },

  createProduct(data) {
    return apiClient.post(`${API_BASE}/products/`, data);
  },

  updateProduct(slug, data) {
    return apiClient.patch(`${API_BASE}/products/${slug}/`, data);
  },

  deleteProduct(slug) {
    return apiClient.delete(`${API_BASE}/products/${slug}/`);
  },

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  getImages(slug) {
    return apiClient.get(`${API_BASE}/products/${slug}/images/`);
  },

  uploadImage(slug, formData) {
    return apiClient.post(`${API_BASE}/products/${slug}/images/`, formData);
  },

  getImage(slug, imageId) {
    return apiClient.get(`${API_BASE}/products/${slug}/images/${imageId}/`);
  },

  updateImage(slug, imageId, formData) {
    return apiClient.patch(
      `${API_BASE}/products/${slug}/images/${imageId}/`,
      formData,
    );
  },

  deleteImage(slug, imageId) {
    return apiClient.delete(`${API_BASE}/products/${slug}/images/${imageId}/`);
  },

  setPrimaryImage(slug, imageId) {
    return apiClient.post(
      `${API_BASE}/products/${slug}/images/${imageId}/primary/`,
    );
  },

  // =========================================================
  // PRODUCT VIDEOS
  // =========================================================

  getVideos(slug) {
    return apiClient.get(`${API_BASE}/products/${slug}/videos/`);
  },

  uploadVideo(slug, formData) {
    return apiClient.post(`${API_BASE}/products/${slug}/videos/`, formData);
  },

  getVideo(slug, videoId) {
    return apiClient.get(`${API_BASE}/products/${slug}/videos/${videoId}/`);
  },

  updateVideo(slug, videoId, formData) {
    return apiClient.patch(
      `${API_BASE}/products/${slug}/videos/${videoId}/`,
      formData,
    );
  },

  deleteVideo(slug, videoId) {
    return apiClient.delete(`${API_BASE}/products/${slug}/videos/${videoId}/`);
  },

  // =========================================================
  // PRODUCT SPECIFICATIONS
  // =========================================================

  getSpecifications(slug) {
    return apiClient.get(`${API_BASE}/products/${slug}/specifications/`);
  },

  createSpecification(slug, data) {
    return apiClient.post(`${API_BASE}/products/${slug}/specifications/`, data);
  },

  updateSpecification(slug, specificationId, data) {
    return apiClient.patch(
      `${API_BASE}/products/${slug}/specifications/${specificationId}/`,
      data,
    );
  },

  deleteSpecification(slug, specificationId) {
    return apiClient.delete(
      `${API_BASE}/products/${slug}/specifications/${specificationId}/`,
    );
  },
};
