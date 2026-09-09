import { useCallback, useState } from "react";

import apiClient from "../../../api/client";

import { adminReviewsApi } from "../api/reviews.api";

export function useReviews() {
  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch all reviews
  |--------------------------------------------------------------------------
  |
  | Backend me all-reviews endpoint nahi hai.
  |
  | Isliye:
  |
  | 1. Products fetch
  | 2. Har product ka slug nikalo
  | 3. Har product ke reviews fetch karo
  | 4. Sab reviews ko ek array me combine karo
  |
  */

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      /*
       * Get all products
       */
      const productsResponse = await apiClient.get("/api/v1/products/");

      const responseData =
        productsResponse?.data?.data ?? productsResponse?.data ?? {};

      /*
       * Django pagination support
       *
       * Possible response:
       *
       * {
       *   count: 4,
       *   results: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      const products = Array.isArray(responseData)
        ? responseData
        : (responseData?.results ?? []);

      if (!products.length) {
        setReviews([]);
        return;
      }

      /*
       * Fetch reviews of every product
       */
      const reviewRequests = products
        .filter((product) => product?.slug)
        .map(async (product) => {
          try {
            const response = await adminReviewsApi.getProductReviews(
              product.slug,
            );

            const data = response?.data?.data ?? response?.data ?? [];

            const productReviews = Array.isArray(data)
              ? data
              : (data?.results ?? []);

            /*
             * Add product information
             * to every review
             */
            return productReviews.map((review) => ({
              ...review,

              product_name: product?.name ?? "Unknown Product",

              product_slug: product?.slug ?? "",

              product_id: product?.id ?? null,
            }));
          } catch (reviewError) {
            console.error(
              `Failed to fetch reviews for ${product.slug}`,
              reviewError,
            );

            return [];
          }
        });

      const results = await Promise.all(reviewRequests);

      /*
       * Combine all product reviews
       */
      const allReviews = results.flat();

      setReviews(allReviews);
    } catch (err) {
      console.error("Failed to fetch admin reviews:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load reviews.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update review
  |--------------------------------------------------------------------------
  */

  const updateReview = async (reviewId, data) => {
    try {
      setError(null);

      await adminReviewsApi.updateReview(reviewId, data);

      await fetchReviews();

      return {
        success: true,
      };
    } catch (err) {
      console.error("Failed to update review:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to update review.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete review
  |--------------------------------------------------------------------------
  */

  const deleteReview = async (reviewId) => {
    try {
      setIsDeleting(true);
      setError(null);

      await adminReviewsApi.deleteReview(reviewId);

      /*
       * Remove immediately from UI
       */
      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId),
      );

      return {
        success: true,
      };
    } catch (err) {
      console.error("Failed to delete review:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to delete review.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    reviews,

    isLoading,

    isDeleting,

    error,

    fetchReviews,

    updateReview,

    deleteReview,
  };
}
