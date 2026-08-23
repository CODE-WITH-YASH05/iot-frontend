import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import reviewApi from "../api/reviewApi";

export function useReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Get error message helper
  const getErrorMessage = useCallback(
    (err, fallback = "Something went wrong") => {
      const data = err?.response?.data;
      if (!data) return err?.message || fallback;

      if (data.message) return data.message;
      if (data.detail) return data.detail;
      if (data.review) return data.review;
      if (data.rating) return data.rating?.[0] || "Invalid rating";
      if (data.title) return data.title?.[0] || "Invalid title";
      if (data.comment) return data.comment?.[0] || "Invalid comment";

      return err?.message || fallback;
    },
    [],
  );

  // Fetch product reviews
  const fetchProductReviews = useCallback(
    async (slug) => {
      if (!slug) {
        setError("Product slug is required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const response = await reviewApi.getProductReviews(slug);

        // Handle backend response: { success: true, message: "...", data: [...] }
        const reviewData = response?.data?.data || response?.data || [];

        const reviewList = Array.isArray(reviewData) ? reviewData : [];
        setReviews(reviewList);

        return reviewList;
      } catch (err) {
        const message = getErrorMessage(err, "Unable to load reviews");
        setError(message);
        setReviews([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // Create review
  const createReview = useCallback(
    async (slug, data) => {
      if (!slug) {
        toast.error("Product slug is required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await reviewApi.createReview(slug, data);
        const reviewData = response?.data?.data || response?.data;

        // Refresh reviews
        await fetchProductReviews(slug);

        return reviewData;
      } catch (err) {
        const message = getErrorMessage(err, "Unable to submit review");
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchProductReviews, getErrorMessage],
  );

  // Update review
  const updateReview = useCallback(
    async (reviewId, data, slug) => {
      if (!reviewId) {
        toast.error("Review ID is required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await reviewApi.updateReview(reviewId, data);
        const reviewData = response?.data?.data || response?.data;

        if (slug) {
          await fetchProductReviews(slug);
        }

        return reviewData;
      } catch (err) {
        const message = getErrorMessage(err, "Unable to update review");
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchProductReviews, getErrorMessage],
  );

  // Delete review
  const deleteReview = useCallback(
    async (reviewId, slug) => {
      if (!reviewId) {
        toast.error("Review ID is required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await reviewApi.deleteReview(reviewId);

        if (slug) {
          await fetchProductReviews(slug);
        }

        setSelectedReview(null);
        return true;
      } catch (err) {
        const message = getErrorMessage(err, "Unable to delete review");
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchProductReviews, getErrorMessage],
  );

  // Get single review
  const getReview = useCallback(
    async (reviewId) => {
      if (!reviewId) {
        setError("Review ID is required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await reviewApi.getReview(reviewId);
        const reviewData = response?.data?.data || response?.data;

        setSelectedReview(reviewData);
        return reviewData;
      } catch (err) {
        const message = getErrorMessage(err, "Unable to load review");
        setError(message);
        setSelectedReview(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  return {
    reviews,
    loading,
    error,
    selectedReview,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getReview,
  };
}

export default useReview;
