import adminClient from "../../../api/admin-client";

const PRODUCTS_BASE = "/api/v1/products";

export const adminProductsApi = {
  getProducts(params = {}) {
    return adminClient.get(`${PRODUCTS_BASE}/`, {
      params,
    });
  },

  getProduct(slug) {
    return adminClient.get(`${PRODUCTS_BASE}/${encodeURIComponent(slug)}/`);
  },

  createProduct(data) {
    return adminClient.post(`${PRODUCTS_BASE}/`, data);
  },

  updateProduct(slug, data) {
    return adminClient.patch(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/`,
      data,
    );
  },

  deleteProduct(slug) {
    return adminClient.delete(`${PRODUCTS_BASE}/${encodeURIComponent(slug)}/`);
  },

  getImages(slug) {
    return adminClient.get(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/images/`,
    );
  },

  uploadImage(slug, data) {
    return adminClient.post(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/images/`,
      data,
    );
  },

  updateImage(slug, imageId, data) {
    return adminClient.patch(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/images/${imageId}/`,
      data,
    );
  },

  deleteImage(slug, imageId) {
    return adminClient.delete(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/images/${imageId}/`,
    );
  },

  setPrimaryImage(slug, imageId) {
    return adminClient.post(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/images/${imageId}/primary/`,
    );
  },

  getVideos(slug) {
    return adminClient.get(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/videos/`,
    );
  },

  uploadVideo(slug, data) {
    return adminClient.post(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/videos/`,
      data,
    );
  },

  updateVideo(slug, videoId, data) {
    return adminClient.patch(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/videos/${videoId}/`,
      data,
    );
  },

  deleteVideo(slug, videoId) {
    return adminClient.delete(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/videos/${videoId}/`,
    );
  },

  getSpecifications(slug) {
    return adminClient.get(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/specifications/`,
    );
  },

  createSpecification(slug, data) {
    return adminClient.post(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/specifications/`,
      data,
    );
  },

  updateSpecification(slug, specificationId, data) {
    return adminClient.patch(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/specifications/${specificationId}/`,
      data,
    );
  },

  deleteSpecification(slug, specificationId) {
    return adminClient.delete(
      `${PRODUCTS_BASE}/${encodeURIComponent(slug)}/specifications/${specificationId}/`,
    );
  },
};
