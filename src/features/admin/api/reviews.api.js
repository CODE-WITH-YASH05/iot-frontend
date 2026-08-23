import apiClient from "../../../api/admin-client";

const REVIEWS_BASE = "/api/v1/products";

export const adminReviewsApi = {
  /**
   * Get reviews for a product
   */
  getProductReviews(productSlug) {
    return apiClient.get(`${REVIEWS_BASE}/${productSlug}/reviews/`);
  },

  /**
   * Get single review
   */
  getReview(reviewId) {
    return apiClient.get(`${REVIEWS_BASE}/reviews/${reviewId}/`);
  },

  /**
   * Update review
   */
  updateReview(reviewId, data) {
    return apiClient.patch(`${REVIEWS_BASE}/reviews/${reviewId}/`, data);
  },

  /**
   * Delete review
   */
  deleteReview(reviewId) {
    return apiClient.delete(`${REVIEWS_BASE}/reviews/${reviewId}/`);
  },
};
