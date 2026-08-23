import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { tokenManager } from "../../../api/token-manager";
import { useReview } from "../hooks/useReviews";
import ImageWithFallback from "../../../components/ImageWithFallback";

// ==========================================================
// REVIEW STARS
// ==========================================================

const ReviewStars = ({ rating, size = "md" }) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={`flex gap-0.5 ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          {star <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

// ==========================================================
// REVIEW ITEM
// ==========================================================

const ReviewItem = ({ review, onEdit, onDelete, isOwner }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const shouldTruncate = review.comment && review.comment.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            {review.user_avatar ? (
              <ImageWithFallback
                src={review.user_avatar}
                alt={review.user_name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              getInitials(review.user_name)
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-gray-900">
                {review.user_name || "Anonymous User"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <ReviewStars rating={review.rating} size="sm" />
                <span className="text-xs text-gray-400">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(review)}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit review"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                </button>
                <button
                  onClick={() => onDelete(review.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete review"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                </button>
              </div>
            )}
          </div>

          {review.title && (
            <h5 className="text-sm font-semibold text-gray-800 mt-2">
              {review.title}
            </h5>
          )}

          <div className="mt-1.5">
            <p
              className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && shouldTruncate ? "line-clamp-3" : ""}`}
            >
              {review.comment}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-indigo-600 font-medium hover:text-indigo-700 mt-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {review.is_verified_purchase && (
            <div className="flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-green-500 text-sm">
                verified
              </span>
              <span className="text-xs text-green-600 font-medium">
                Verified Purchase
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================================
// REVIEWS COMPONENT
// ==========================================================

export default function Reviews({ productSlug }) {
  const {
    reviews,
    loading,
    error,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
  } = useReview();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const token = tokenManager.getAccessToken();
    if (token) {
      try {
        const user = tokenManager.getUser();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  // Load reviews on mount
  useEffect(() => {
    if (productSlug) {
      fetchProductReviews(productSlug);
    }
  }, [productSlug, fetchProductReviews]);

  // Check if current user has reviewed
  const userHasReviewed = (review) => {
    if (!currentUser || !review) return false;
    return review.user === currentUser.id;
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate
    const errors = {};
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = "Please select a rating";
    }
    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.comment?.trim()) {
      errors.comment = "Comment is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
      };

      if (editingReview) {
        await updateReview(editingReview.id, reviewData, productSlug);
        toast.success("Review updated successfully! ✏️");
      } else {
        await createReview(productSlug, reviewData);
        toast.success("Review submitted successfully! 🎉");
      }

      // Reset form
      setFormData({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (err) {
      console.error("Review submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating || 5,
      title: review.title || "",
      comment: review.comment || "",
    });
    setShowReviewForm(true);
    setFormErrors({});
    // Scroll to form
    document
      .getElementById("review-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    await deleteReview(reviewId, productSlug);
  };

  // Cancel review form
  const cancelReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setFormData({ rating: 5, title: "", comment: "" });
    setFormErrors({});
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <div className="mt-8 md:mt-12 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 md:mt-12 pt-6 border-t border-gray-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-600 text-3xl">
              rate_review
            </span>
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <ReviewStars rating={Math.round(averageRating)} size="lg" />
              </div>
              <span className="text-sm text-gray-400">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {currentUser && (
          <button
            onClick={() => {
              if (showReviewForm) {
                cancelReviewForm();
              } else {
                setShowReviewForm(true);
                setEditingReview(null);
                setFormData({ rating: 5, title: "", comment: "" });
                setFormErrors({});
              }
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">
              {showReviewForm ? "close" : "add"}
            </span>
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {/* REVIEW FORM */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            id="review-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${
                          star <= formData.rating ? "animate-pulse" : ""
                        }`}
                      >
                        {star <= formData.rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  {formErrors.rating && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.rating}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Review Comment *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Share your detailed experience..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition-all resize-none"
                  />
                  {formErrors.comment && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.comment}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelReviewForm}
                    className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {editingReview ? "Updating..." : "Submitting..."}
                      </>
                    ) : editingReview ? (
                      "Update Review"
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RATING DISTRIBUTION */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            Rating Distribution
          </h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-8">
                  {star} ★
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS LIST */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
          <p className="text-sm text-gray-500 mt-2">
            Be the first to share your experience with this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isOwner={userHasReviewed(review)}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500">
            error_outline
          </span>
          <div>
            <p className="font-semibold">Error loading reviews</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
