import apiClient from "../../../api/client";

const REVIEW_BASE = "/api/v1/products";

export const reviewApi = {
  // Get reviews for a product
  getProductReviews: (slug) => {
    if (!slug) {
      throw new Error("Product slug is required");
    }
    return apiClient.get(`${REVIEW_BASE}/${slug}/reviews/`);
  },

  // Create a review
  createReview: (slug, data) => {
    if (!slug) {
      throw new Error("Product slug is required");
    }
    return apiClient.post(`${REVIEW_BASE}/${slug}/reviews/`, data);
  },

  // Get single review
  getReview: (reviewId) => {
    if (!reviewId) {
      throw new Error("Review ID is required");
    }
    return apiClient.get(`${REVIEW_BASE}/reviews/${reviewId}/`);
  },

  // Update review
  updateReview: (reviewId, data) => {
    if (!reviewId) {
      throw new Error("Review ID is required");
    }
    return apiClient.patch(`${REVIEW_BASE}/reviews/${reviewId}/`, data);
  },

  // Delete review
  deleteReview: (reviewId) => {
    if (!reviewId) {
      throw new Error("Review ID is required");
    }
    return apiClient.delete(`${REVIEW_BASE}/reviews/${reviewId}/`);
  },
};

export default reviewApi;
